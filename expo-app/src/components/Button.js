import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export default function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';
  const isGhost = variant === 'ghost';

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 16, minHeight: 40 },
    md: { paddingVertical: 14, paddingHorizontal: 24, minHeight: 48 },
    lg: { paddingVertical: 16, paddingHorizontal: 32, minHeight: 56 },
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.base,
        sizeStyles[size],
        isPrimary && styles.primary,
        isSecondary && styles.secondary,
        isDanger && styles.danger,
        isGhost && styles.ghost,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.secondary : colors.primary} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              isPrimary && styles.textPrimary,
              isSecondary && styles.textSecondary,
              isDanger && styles.textDanger,
              isGhost && styles.textGhost,
              icon ? { marginLeft: 8 } : null,
              textStyle,
            ]}
          >
            {children}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.radiusPill,
  },
  primary: {
    backgroundColor: colors.primary,
    borderBottomWidth: 3,
    borderBottomColor: colors.secondary,
  },
  secondary: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  danger: {
    backgroundColor: colors.danger,
    borderBottomWidth: 3,
    borderBottomColor: '#C0392B',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...typography.button,
  },
  textPrimary: {
    color: colors.secondary,
  },
  textSecondary: {
    color: colors.secondary,
  },
  textDanger: {
    color: colors.white,
  },
  textGhost: {
    color: colors.textLight,
  },
});
