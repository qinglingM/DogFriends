import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { normalizeChinaMobileToE164 } from '../../services/phone';
import { loginWithSmsCode, sendSmsCode } from '../../services/smsOtp';

const RESEND_SECONDS = 60;

export default function AuthScreen() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (countdown <= 0) return undefined;
    const timer = setInterval(() => {
      setCountdown((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const normalizedPhone = useMemo(
    () => normalizeChinaMobileToE164(phone),
    [phone],
  );

  const showError = (error) => {
    setMessage({ type: 'error', text: error.message || '操作失败，请重试' });
  };

  const handleSendCode = async () => {
    if (!normalizedPhone) {
      setMessage({ type: 'error', text: '请输入正确的中国大陆手机号' });
      return;
    }

    setSending(true);
    setMessage(null);
    try {
      const result = await sendSmsCode(normalizedPhone, 'login');
      setOtpToken(result.token || '');
      setCountdown(RESEND_SECONDS);
      setMessage({ type: 'success', text: '验证码已发送，5 分钟内有效' });
    } catch (error) {
      showError(error);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async () => {
    if (!normalizedPhone) {
      setMessage({ type: 'error', text: '请输入正确的中国大陆手机号' });
      return;
    }

    if (!/^\d{6}$/.test(code) || !otpToken) {
      setMessage({ type: 'error', text: otpToken ? '请输入 6 位验证码' : '请先获取验证码' });
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      await loginWithSmsCode(normalizedPhone, code, otpToken);
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Ionicons name="paw" size={40} color={colors.secondary} />
          </View>
          <Text style={styles.title}>欢迎来到遛遛</Text>
          <Text style={styles.subtitle}>记录每一次快乐散步</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.field}>
            <Ionicons name="phone-portrait-outline" size={20} color={colors.textLight} />
            <TextInput
              placeholderTextColor={colors.textLight}
              style={styles.input}
              placeholder="请输入手机号"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={17}
              returnKeyType="done"
              autoComplete="tel"
            />
          </View>

          <View style={styles.codeRow}>
            <View style={styles.codeField}>
              <View style={styles.field}>
                <Ionicons name="keypad-outline" size={20} color={colors.textLight} />
                <TextInput
                  placeholderTextColor={colors.textLight}
                  style={styles.input}
                  placeholder="6 位验证码"
                  value={code}
                  onChangeText={(value) => setCode(value.replace(/\D/g, ''))}
                  keyboardType="number-pad"
                  maxLength={6}
                  returnKeyType="done"
                  autoComplete="one-time-code"
                />
              </View>
            </View>
            <TouchableOpacity
              onPress={handleSendCode}
              disabled={sending || countdown > 0}
              style={[
                styles.sendButton,
                (sending || countdown > 0) && styles.disabled,
              ]}
            >
              {sending ? (
                <ActivityIndicator size="small" color={colors.secondary} />
              ) : (
                <Text style={styles.sendText}>
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {message && (
            <View style={[
              styles.message,
              message.type === 'success' ? styles.successMessage : styles.errorMessage,
            ]}>
              <Text style={[
                styles.messageText,
                message.type === 'success' ? styles.successText : styles.errorText,
              ]}>
                {message.text}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submit, busy && styles.disabled]}
            onPress={handleSubmit}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={colors.secondary} />
            ) : (
              <Text style={styles.submitText}>登录 / 注册</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.helper}>未注册手机号验证后将自动创建账号</Text>
        </View>

        <Text style={styles.terms}>登录即表示你同意《用户协议》和《隐私政策》</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    minHeight: 680,
  },
  brand: { alignItems: 'center', marginBottom: spacing.xl },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginBottom: spacing.md,
  },
  title: { ...typography.h1, color: colors.textMain },
  subtitle: { ...typography.body, color: colors.textLight, marginTop: spacing.xs },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bgLight,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    ...typography.body,
    color: colors.textMain,
    flex: 1,
    minWidth: 0,
    lineHeight: undefined,
    paddingVertical: 0,
    textAlignVertical: 'center',
    ...Platform.select({ web: { outlineStyle: 'none' }, default: {} }),
  },
  codeRow: { flexDirection: 'row', gap: spacing.sm },
  codeField: { flex: 1 },
  sendButton: {
    width: 112,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.radiusMd,
    backgroundColor: colors.surfaceLight,
  },
  sendText: { ...typography.bodyBold, color: colors.secondary },
  submit: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.primary,
    borderBottomWidth: 3,
    borderBottomColor: colors.secondary,
  },
  submitText: { ...typography.button, color: colors.secondary },
  disabled: { opacity: 0.5 },
  helper: { ...typography.caption, color: colors.textLight, textAlign: 'center' },
  message: { padding: spacing.sm, borderRadius: spacing.radiusSm },
  errorMessage: { backgroundColor: colors.tipRed },
  successMessage: { backgroundColor: colors.tipBlue },
  messageText: { ...typography.caption, textAlign: 'center' },
  errorText: { color: colors.danger },
  successText: { color: colors.secondary },
  terms: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
