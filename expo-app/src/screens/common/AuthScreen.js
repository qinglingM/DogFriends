import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const MODE_LOGIN = 'login';
const MODE_SIGNUP = 'signup';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState(MODE_LOGIN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isLogin = mode === MODE_LOGIN;

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('提示', '请输入邮箱和密码');
      return;
    }
    if (!isLogin && password.length < 6) {
      Alert.alert('提示', '密码至少需要 6 位');
      return;
    }
    setLoading(true);
    const fn = isLogin ? signIn : signUp;
    const { error } = await fn(email.trim(), password);
    setLoading(false);

    if (error) {
      const msg =
        error.message === 'Invalid login credentials'
          ? '邮箱或密码错误'
          : error.message === 'User already registered'
          ? '该邮箱已注册'
          : error.message.includes('security purpose')
          ? '操作过于频繁，请稍后再试'
          : error.message;
      Alert.alert('提示', msg);
    } else if (!isLogin) {
      Alert.alert('注册成功', '请查看邮箱完成验证');
    }
  }

  function toggleMode() {
    setMode(isLogin ? MODE_SIGNUP : MODE_LOGIN);
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top + 60 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.logoSection}>
        <View style={styles.logoCircle}>
          <Ionicons name="paw" size={48} color={colors.white} />
        </View>
        <Text style={styles.appName}>DogFriends</Text>
        <Text style={styles.subtitle}>和狗狗一起探索城市</Text>
      </View>

      <View style={styles.form}>
        <Text style={[styles.modeTitle, isLogin ? styles.modeTitleLogin : styles.modeTitleSignup]}>
          {isLogin ? '欢迎回来' : '创建账号'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="邮箱"
          placeholderTextColor={colors.textLight}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
        />

        <View style={styles.passwordRow}>
          <TextInput
            style={styles.inputPassword}
            placeholder="密码"
            placeholderTextColor={colors.textLight}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.textLight}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.submitBtn,
            isLogin ? styles.submitBtnLogin : styles.submitBtnSignup,
            loading && styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitText}>
              {isLogin ? '登录' : '注册'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.toggleBtn} onPress={toggleMode}>
          <Text style={styles.toggleText}>
            {isLogin ? '没有账号？去注册' : '已有账号？去登录'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
    paddingHorizontal: spacing.screenMargin,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
  },
  form: {
    gap: spacing.md,
  },
  modeTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  modeTitleLogin: {
    color: colors.secondary,
  },
  modeTitleSignup: {
    color: colors.accent,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    paddingHorizontal: spacing.md,
    height: spacing.touchTarget,
    fontSize: 15,
    color: colors.textMain,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputPassword: {
    flex: 1,
    paddingHorizontal: spacing.md,
    height: spacing.touchTarget,
    fontSize: 15,
    color: colors.textMain,
  },
  eyeBtn: {
    paddingHorizontal: spacing.md,
    height: spacing.touchTarget,
    justifyContent: 'center',
  },
  submitBtn: {
    borderRadius: spacing.radiusMd,
    height: spacing.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  submitBtnLogin: {
    backgroundColor: colors.secondary,
  },
  submitBtnSignup: {
    backgroundColor: colors.accent,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    ...typography.button,
    color: colors.white,
  },
  toggleBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  toggleText: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '600',
  },
});
