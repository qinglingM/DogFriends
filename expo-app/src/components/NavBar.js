import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export default function NavBar({ title, onBack, rightAction, rightIcon, rightLabel, bgColor }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top, backgroundColor: bgColor || colors.bg }]}>
      <View style={styles.bar}>
        <View style={styles.left}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="arrow-back" size={24} color={colors.secondary} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={styles.right}>
          {rightLabel ? (
            <Text style={styles.progressText}>{rightLabel}</Text>
          ) : rightAction && rightIcon ? (
            <TouchableOpacity onPress={rightAction} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name={rightIcon} size={24} color={colors.secondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 10,
  },
  bar: {
    height: spacing.navBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  left: {
    position: 'absolute',
    left: spacing.md,
    bottom: 0,
    height: spacing.navBarHeight,
    justifyContent: 'center',
  },
  right: {
    position: 'absolute',
    right: spacing.md,
    bottom: 0,
    height: spacing.navBarHeight,
    justifyContent: 'center',
  },
  backBtn: {
    width: spacing.touchTarget,
    height: spacing.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.bodyBold,
    fontSize: 18,
    color: colors.textMain,
  },
  progressText: {
    ...typography.bodyBold,
    color: colors.textLight,
  },
});
