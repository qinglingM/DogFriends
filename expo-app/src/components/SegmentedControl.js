import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export default function SegmentedControl({ segments, activeKey, onChange }) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const activeIndex = segments.findIndex(s => s.key === activeKey);
  const segCount = segments.length;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeIndex,
      tension: 80,
      friction: 12,
      useNativeDriver: false,
    }).start();
  }, [activeIndex]);

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        {segments.map((seg, i) => {
          const isActive = seg.key === activeKey;
          return (
            <TouchableOpacity
              key={seg.key}
              style={[styles.segment, isActive && styles.segmentActive]}
              onPress={() => onChange(seg.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {seg.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.screenMargin,
    marginBottom: spacing.md,
  },
  track: {
    flexDirection: 'row',
    backgroundColor: colors.bgLight,
    borderRadius: spacing.radiusPill,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: spacing.radiusPill,
  },
  segmentActive: {
    backgroundColor: colors.secondary,
  },
  label: {
    ...typography.bodyBold,
    color: colors.textLight,
  },
  labelActive: {
    color: colors.white,
  },
});
