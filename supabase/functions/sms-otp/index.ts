import { createClient, type User } from 'npm:@supabase/supabase-js@2.105.4'

type Purpose = 'login' | 'signup' | 'forgot'
type OtpPayload = {
  phone: string
  purpose: Purpose
  nonce: string
  codeHash: string
  exp: number
}

const OTP_TTL_MS = 5 * 60 * 1000
const ALIYUN_TIMEOUT_MS = 10_000
const PHONE_EMAIL_DOMAIN = 'phone.dogfriends.app'
const encoder = new TextEncoder()
const rateBuckets = new Map<string, number[]>()
const consumedNonces = new Map<string, number>()

function env(name: string): string {
  const value = Deno.env.get(name)?.trim()
  if (!value) throw new Error(`未配置环境变量：${name}`)
  return value
}

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin')
  const configured = Deno.env.get('ALLOWED_ORIGINS')
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean) ?? []
  const isAllowed = !origin || configured.length === 0 || configured.includes(origin)

  return {
    'Access-Control-Allow-Origin': isAllowed ? (origin ?? '*') : 'null',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

function json(request: Request, body: Record<string, unknown>, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request),
      ...extra,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

function normalizePhone(input: unknown): string | null {
  const value = String(input ?? '').trim().replace(/\s+/g, '')
  if (/^\+861\d{10}$/.test(value)) return value

  const digits = value.replace(/\D/g, '')
  if (/^1\d{10}$/.test(digits)) return `+86${digits}`
  if (/^861\d{10}$/.test(digits)) return `+${digits}`
  return null
}

function base64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '')
}

function standardBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function fromBase64Url(value: string): Uint8Array {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))
}

async function hmac(
  algorithm: 'SHA-1' | 'SHA-256',
  secret: string,
  message: string,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign'],
  )
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(message)))
}

async function sha256Hex(value: string): Promise<string> {
  const digest = new Uint8Array(
    await crypto.subtle.digest('SHA-256', encoder.encode(value)),
  )
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function constantTimeEqual(expected: Uint8Array, actual: Uint8Array): boolean {
  if (expected.length !== actual.length) return false
  let difference = 0
  for (let index = 0; index < expected.length; index += 1) {
    difference |= expected[index] ^ actual[index]
  }
  return difference === 0
}

function secureCode(): string {
  const random = new Uint32Array(1)
  crypto.getRandomValues(random)
  return String(100000 + (random[0] % 900000))
}

async function createOtpToken(
  phone: string,
  purpose: Purpose,
  code: string,
): Promise<string> {
  const secret = env('ALIYUN_OTP_HMAC_SECRET')
  const nonce = crypto.randomUUID()
  const codeHash = base64Url(await hmac(
    'SHA-256',
    secret,
    `${nonce}:${phone}:${purpose}:${code}`,
  ))
  const payload: OtpPayload = {
    phone,
    purpose,
    nonce,
    codeHash,
    exp: Date.now() + OTP_TTL_MS,
  }
  const encodedPayload = base64Url(encoder.encode(JSON.stringify(payload)))
  const signature = base64Url(await hmac('SHA-256', secret, encodedPayload))
  return `${encodedPayload}.${signature}`
}

async function parseOtpToken(token: unknown): Promise<OtpPayload> {
  const parts = String(token ?? '').split('.')
  if (parts.length !== 2) throw new Error('验证码凭据无效，请重新获取')

  const [encodedPayload, signature] = parts
  const expected = await hmac('SHA-256', env('ALIYUN_OTP_HMAC_SECRET'), encodedPayload)
  const actual = fromBase64Url(signature)
  if (!constantTimeEqual(expected, actual)) {
    throw new Error('验证码凭据无效，请重新获取')
  }

  const payload = JSON.parse(
    new TextDecoder().decode(fromBase64Url(encodedPayload)),
  ) as OtpPayload
  if (payload.exp <= Date.now()) throw new Error('验证码已过期，请重新获取')
  if (consumedNonces.has(payload.nonce)) throw new Error('验证码已使用，请重新获取')
  return payload
}

async function verifyOtp(
  phone: string,
  code: unknown,
  token: unknown,
  purposes?: Purpose[],
): Promise<OtpPayload> {
  const normalizedCode = String(code ?? '').trim()
  if (!/^\d{6}$/.test(normalizedCode)) throw new Error('请输入 6 位验证码')

  const payload = await parseOtpToken(token)
  if (payload.phone !== phone) throw new Error('手机号与验证码不匹配')
  if (purposes && !purposes.includes(payload.purpose)) {
    throw new Error('验证码用途不匹配，请重新获取')
  }

  const expectedHash = await hmac(
    'SHA-256',
    env('ALIYUN_OTP_HMAC_SECRET'),
    `${payload.nonce}:${phone}:${payload.purpose}:${normalizedCode}`,
  )
  const actualHash = fromBase64Url(payload.codeHash)
  if (!constantTimeEqual(expectedHash, actualHash)) {
    throw new Error('验证码错误')
  }
  return payload
}

function consumeOtp(payload: OtpPayload) {
  consumedNonces.set(payload.nonce, payload.exp)
  for (const [nonce, exp] of consumedNonces) {
    if (exp <= Date.now()) consumedNonces.delete(nonce)
  }
}

function rateLimit(key: string, max: number, windowMs: number): number | null {
  const now = Date.now()
  const current = (rateBuckets.get(key) ?? []).filter((time) => time > now - windowMs)
  if (current.length >= max) {
    return Math.max(1, Math.ceil((current[0] + windowMs - now) / 1000))
  }
  current.push(now)
  rateBuckets.set(key, current)
  return null
}

function enforceRateLimits(
  checks: Array<[string, number, number]>,
): number | null {
  for (const [key, max, windowMs] of checks) {
    const retryAfter = rateLimit(key, max, windowMs)
    if (retryAfter) return retryAfter
  }
  return null
}

function aliyunEncode(value: string): string {
  return encodeURIComponent(value)
    .replaceAll('!', '%21')
    .replaceAll("'", '%27')
    .replaceAll('(', '%28')
    .replaceAll(')', '%29')
    .replaceAll('*', '%2A')
}

async function sendAliyunSms(phone: string, code: string): Promise<void> {
  const signNameB64 = Deno.env.get('ALIYUN_SMS_SIGN_NAME_B64')?.trim()
  const signName = signNameB64
    ? new TextDecoder().decode(Uint8Array.from(atob(signNameB64), (char) => char.charCodeAt(0)))
    : env('ALIYUN_SMS_SIGN_NAME')

  const params: Record<string, string> = {
    AccessKeyId: env('ALIYUN_ACCESS_KEY_ID'),
    Action: 'SendSmsVerifyCode',
    CodeLength: '6',
    CodeType: '1',
    CountryCode: '86',
    Format: 'JSON',
    PhoneNumber: phone.slice(3),
    RegionId: 'cn-hangzhou',
    SignName: signName,
    SignatureMethod: 'HMAC-SHA1',
    SignatureNonce: crypto.randomUUID(),
    SignatureVersion: '1.0',
    TemplateCode: env('ALIYUN_SMS_TEMPLATE_CODE'),
    TemplateParam: JSON.stringify({ code, min: '5' }),
    Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    ValidTime: '300',
    Version: '2017-05-25',
  }

  const canonical = Object.entries(params)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${aliyunEncode(key)}=${aliyunEncode(value)}`)
    .join('&')
  const stringToSign = `POST&%2F&${aliyunEncode(canonical)}`
  const signature = standardBase64(
    await hmac('SHA-1', `${env('ALIYUN_ACCESS_KEY_SECRET')}&`, stringToSign),
  )

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ALIYUN_TIMEOUT_MS)
  try {
    const response = await fetch('https://dypnsapi.aliyuncs.com/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `${canonical}&Signature=${aliyunEncode(signature)}`,
      signal: controller.signal,
    })
    const result = await response.json()
    if (!response.ok || result.Code !== 'OK') {
      console.error('Aliyun SMS request failed', {
        httpStatus: response.status,
        code: result.Code,
        message: result.Message,
        requestId: result.RequestId,
        raw: JSON.stringify(result),
      })
      throw new Error('短信发送失败，请稍后重试')
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('短信服务响应超时，请稍后重试')
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}

function adminClient() {
  return createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function publicClient() {
  return createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

async function syntheticEmail(phone: string): Promise<string> {
  const digest = await sha256Hex(`phone:${phone}`)
  return `phone-${digest.slice(0, 32)}@${PHONE_EMAIL_DOMAIN}`
}

async function findUser(phone: string): Promise<User | null> {
  const admin = adminClient()
  const email = await syntheticEmail(phone)
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error
    const match = data.users.find((user) => user.phone === phone || user.email === email)
    if (match) return match
    if (data.users.length < 1000) break
  }
  return null
}

async function ensureUser(phone: string, nickname?: string): Promise<User> {
  const existing = await findUser(phone)
  if (existing) return existing

  const internalPassword = `${crypto.randomUUID()}Aa1!`
  const { data, error } = await adminClient().auth.admin.createUser({
    email: await syntheticEmail(phone),
    phone,
    password: internalPassword,
    email_confirm: true,
    phone_confirm: true,
    user_metadata: nickname ? { nickname } : {},
  })
  if (error || !data.user) throw error ?? new Error('账号创建失败')
  return data.user
}

async function issueSession(user: User) {
  let email = user.email
  if (!email) {
    email = await syntheticEmail(user.phone ?? '')
    const { data, error } = await adminClient().auth.admin.updateUserById(user.id, {
      email,
      email_confirm: true,
    })
    if (error || !data.user) throw error ?? new Error('账号信息更新失败')
  }

  const { data: linkData, error: linkError } = await adminClient().auth.admin.generateLink({
    type: 'magiclink',
    email,
  })
  if (linkError || !linkData.properties?.hashed_token) {
    throw linkError ?? new Error('登录凭据生成失败')
  }

  const { data, error } = await publicClient().auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: 'magiclink',
  })
  if (error || !data.session) throw error ?? new Error('Session 创建失败')
  return data.session
}

function sessionBody(session: {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}) {
  return {
    ok: true,
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: session.expires_in,
    token_type: session.token_type,
  }
}

function validatePassword(password: unknown, phone: string): string {
  const value = String(password ?? '')
  if (value.length < 8 || value.length > 20) throw new Error('密码需为 8–20 位')
  if (/[\u3400-\u9fff]/.test(value)) throw new Error('密码不能包含中文')
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    throw new Error('密码需同时包含字母和数字')
  }
  const weak = new Set(['password1', 'password123', '12345678', '123456789', 'qwerty123'])
  if (weak.has(value.toLowerCase())) throw new Error('密码过于简单，请更换')
  if (value.endsWith(phone.replace(/\D/g, '').slice(-6))) {
    throw new Error('密码不能以手机号后 6 位结尾')
  }
  return value
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(request) })
  }
  if (request.method !== 'POST') return json(request, { ok: false, error: 'Method not allowed' }, 405)

  const origin = request.headers.get('origin')
  const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean) ?? []
  if (origin && allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
    return json(request, { ok: false, error: 'Origin not allowed' }, 403)
  }

  try {
    const body = await request.json()
    const action = String(body.action ?? '')
    const phone = normalizePhone(body.phone)
    if (!phone) return json(request, { ok: false, error: '请输入正确的中国大陆手机号' }, 400)

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('cf-connecting-ip')
      || 'unknown'

    if (action === 'send') {
      const purpose = String(body.purpose ?? '') as Purpose
      if (!['login', 'signup', 'forgot'].includes(purpose)) {
        return json(request, { ok: false, error: '验证码用途无效' }, 400)
      }
      const retryAfter = enforceRateLimits([
        [`send-minute:${phone}:${purpose}`, 3, 60_000],
        [`send-hour:${phone}:${purpose}`, 8, 3_600_000],
        [`send-ip:${ip}`, 30, 3_600_000],
      ])
      if (retryAfter) {
        return json(
          request,
          { ok: false, error: `请求过于频繁，请 ${retryAfter} 秒后重试` },
          429,
          { 'Retry-After': String(retryAfter) },
        )
      }
      if (purpose === 'forgot' && !(await findUser(phone))) {
        return json(request, { ok: false, error: '该手机号尚未注册' })
      }

      const code = secureCode()
      const token = await createOtpToken(phone, purpose, code)
      await sendAliyunSms(phone, code)
      return json(request, { ok: true, token, login_phone: phone })
    }

    if (action === 'password-login') {
      const retryAfter = enforceRateLimits([
        [`password:${phone}:${ip}`, 8, 15 * 60_000],
        [`password-ip:${ip}`, 60, 15 * 60_000],
      ])
      if (retryAfter) {
        return json(request, { ok: false, error: '登录尝试过于频繁，请稍后重试' }, 429, {
          'Retry-After': String(retryAfter),
        })
      }
      const user = await findUser(phone)
      if (!user?.email) return json(request, { ok: false, error: '手机号或密码错误' })
      const { data, error } = await publicClient().auth.signInWithPassword({
        email: user.email,
        password: String(body.password ?? ''),
      })
      if (error || !data.session) return json(request, { ok: false, error: '手机号或密码错误' })
      return json(request, sessionBody(data.session))
    }

    const retryAfter = enforceRateLimits([
      [`verify:${phone}:${ip}`, 12, 5 * 60_000],
      [`verify-ip:${ip}`, 80, 5 * 60_000],
    ])
    if (retryAfter) {
      return json(request, { ok: false, error: '验证码尝试过于频繁，请稍后重试' }, 429, {
        'Retry-After': String(retryAfter),
      })
    }

    if (action === 'verify') {
      await verifyOtp(phone, body.code, body.token)
      return json(request, { ok: true })
    }

    if (action === 'complete-login') {
      const otp = await verifyOtp(phone, body.code, body.token, ['login', 'signup'])
      const user = await ensureUser(phone)
      const session = await issueSession(user)
      consumeOtp(otp)
      return json(request, sessionBody(session))
    }

    if (action === 'complete-signup') {
      const otp = await verifyOtp(phone, body.code, body.token, ['signup'])
      const password = validatePassword(body.password, phone)
      const user = await ensureUser(phone, String(body.nickname ?? '').trim() || undefined)
      const { error } = await adminClient().auth.admin.updateUserById(user.id, { password })
      if (error) throw error
      const { data, error: loginError } = await publicClient().auth.signInWithPassword({
        email: user.email ?? await syntheticEmail(phone),
        password,
      })
      if (loginError || !data.session) throw loginError ?? new Error('登录失败')
      consumeOtp(otp)
      return json(request, sessionBody(data.session))
    }

    if (action === 'complete-forgot') {
      const otp = await verifyOtp(phone, body.code, body.token, ['forgot'])
      const password = validatePassword(body.password, phone)
      const user = await findUser(phone)
      if (!user) return json(request, { ok: false, error: '该手机号尚未注册' })
      const { data: updated, error } = await adminClient().auth.admin.updateUserById(user.id, {
        password,
      })
      if (error || !updated.user) throw error ?? new Error('密码更新失败')
      const email = updated.user.email ?? await syntheticEmail(phone)
      const { data, error: loginError } = await publicClient().auth.signInWithPassword({
        email,
        password,
      })
      if (loginError || !data.session) throw loginError ?? new Error('登录失败')
      consumeOtp(otp)
      return json(request, sessionBody(data.session))
    }

    return json(request, { ok: false, error: '不支持的操作' }, 400)
  } catch (error) {
    console.error('sms-otp request failed', {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
    return json(request, {
      ok: false,
      error: error instanceof Error ? error.message : '服务暂时不可用，请稍后重试',
    }, 500)
  }
})
