import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

function WalkMetric({ value, unit, label }) {
  return (
    <View style={s.walkMetric}>
      <Text style={s.walkMetricValue}>
        {value}{!!unit && <Text style={s.walkMetricUnit}> {unit}</Text>}
      </Text>
      <Text style={s.walkMetricLabel}>{label}</Text>
    </View>
  );
}

export default function WalkRecordPreview({ record }) {
  return (
    <View style={s.walkRecordCard}>
      <View style={s.walkMapCanvas}>
        <View style={[s.mapPatch, s.mapPatchOne]} />
        <View style={[s.mapPatch, s.mapPatchTwo]} />
        <View style={s.routeLine} />
        <View style={[s.routePoint, s.routeStart]} />
        <View style={[s.routePoint, s.routeEnd]} />
        <Text style={s.mapArea}>{record.area}</Text>
      </View>
      <View style={s.walkRecordStats}>
        <WalkMetric value={record.distance} unit="km" label="距离" />
        <View style={s.walkMetricDivider} />
        <WalkMetric value={record.duration} label="时长" />
        <View style={s.walkMetricDivider} />
        <WalkMetric value={record.pace} label="配速" />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  walkRecordCard: {
    borderRadius: spacing.radiusMd,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
  },
  walkMapCanvas: {
    height: 128,
    backgroundColor: '#DDEBD3',
    overflow: 'hidden',
    position: 'relative',
  },
  mapPatch: {
    position: 'absolute',
    borderRadius: spacing.radiusPill,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  mapPatchOne: {
    width: 160, height: 72, left: -24, top: 18,
    transform: [{ rotate: '-18deg' }],
  },
  mapPatchTwo: {
    width: 190, height: 86, right: -32, bottom: -8,
    transform: [{ rotate: '16deg' }],
  },
  routeLine: {
    position: 'absolute', left: '18%', right: '16%', top: '48%',
    height: 8, borderRadius: spacing.radiusPill,
    backgroundColor: colors.secondary, transform: [{ rotate: '-10deg' }],
  },
  routePoint: {
    position: 'absolute', width: 18, height: 18, borderRadius: 9,
    borderWidth: 3, borderColor: colors.white, backgroundColor: colors.primary,
  },
  routeStart: { left: '16%', top: '51%' },
  routeEnd: { right: '14%', top: '36%' },
  mapArea: {
    position: 'absolute', left: spacing.md, top: spacing.md,
    ...typography.captionBold, color: colors.secondary,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    borderRadius: spacing.radiusPill,
  },
  walkRecordStats: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.md, backgroundColor: colors.white,
  },
  walkMetric: { flex: 1, alignItems: 'center' },
  walkMetricValue: { ...typography.h3, color: colors.textMain },
  walkMetricUnit: { ...typography.captionBold, color: colors.textMain },
  walkMetricLabel: { ...typography.caption, color: colors.textLight, marginTop: spacing.xs },
  walkMetricDivider: { width: 1, height: 32, backgroundColor: colors.border },
});
