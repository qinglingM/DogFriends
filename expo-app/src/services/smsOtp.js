import { supabase } from '../lib/supabase';

const REQUEST_TIMEOUT_MS = 15000;

function timeoutAfter(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({
      data: null,
      error: new Error('请求超时，请检查网络后重试'),
    }), ms);
  });
}

async function callSmsOtp(body) {
  try {
    const response = await Promise.race([
      supabase.functions.invoke('sms-otp', { body }),
      timeoutAfter(REQUEST_TIMEOUT_MS),
    ]);

    if (response.error) {
      return { ok: false, error: response.error.message || '短信服务请求失败' };
    }

    return response.data ?? { ok: false, error: '短信服务没有返回结果' };
  } catch (error) {
    return { ok: false, error: error.message || '短信服务请求失败' };
  }
}

function requireSuccess(result, fallbackMessage) {
  if (!result.ok) throw new Error(result.error || fallbackMessage);
  return result;
}

async function establishSession(result) {
  if (!result.access_token || !result.refresh_token) {
    throw new Error('登录凭据不完整，请重试');
  }

  const { error } = await supabase.auth.setSession({
    access_token: result.access_token,
    refresh_token: result.refresh_token,
  });
  if (error) throw error;
}

export async function sendSmsCode(phone, purpose) {
  const result = await callSmsOtp({ action: 'send', phone, purpose });
  return requireSuccess(result, '验证码发送失败');
}

export async function loginWithSmsCode(phone, code, token) {
  const result = requireSuccess(
    await callSmsOtp({ action: 'complete-login', phone, code, token }),
    '验证码登录失败',
  );
  await establishSession(result);
}

export async function loginWithPassword(phone, password) {
  const result = requireSuccess(
    await callSmsOtp({ action: 'password-login', phone, password }),
    '手机号或密码错误',
  );
  await establishSession(result);
}

export async function resetPasswordWithSmsCode(phone, code, token, password) {
  const result = requireSuccess(
    await callSmsOtp({
      action: 'complete-forgot',
      phone,
      code,
      token,
      password,
    }),
    '密码重置失败',
  );
  await establishSession(result);
}
