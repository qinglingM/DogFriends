import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export default function Chip({
  children,
  variant = 'default',
  active = false,
  onPress,
  style,
  textStyle,
}) {
  const isActive = active || variant === 'active' || variant === 'verified';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
      style={[
        styles.base,
        variant === 'default' && !isActive && styles.default,
        variant === 'verified' && styles.verified,
        isActive && styles.active,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          isActive && styles.textActive,
          textStyle,
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: spacing.radiusMd,
    alignSelf: 'flex-start',
  },
  default: {
    backgroundColor: colors.chipDefault,
  },
  verified: {
    backgroundColor: colors.chipVerified,
  },
  active: {
    backgroundColor: colors.primary,
  },
  text: {
    ...typography.captionBold,
    color: colors.textMain,
  },
  textActive: {
    color: colors.secondary,
  },
});
