import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { MapPlaceholder, TipCard } from '../../components';
import { useWalk } from '../../contexts/WalkContext';

export default function WalkResultScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { records } = useWalk();
  const last = records[0];

  const distance = last?.distance || 0;
  const duration = last?.duration || 0;
  const pace = last?.pace || 0;
  const photos = last?.photos || [];

  const formatDuration = (sec) => {
    if (sec < 60) return `${sec}秒`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m < 60) return s > 0 ? `${m}分${s}秒` : `${m}分`;
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return `${h}时${rm}分`;
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>遛狗完成！</Text>
        <Text style={styles.time}>{formatTime(last?.startTime)}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Ionicons name="speedometer-outline" size={20} color={colors.primary} />
          <View style={styles.statValueRow}>
            <Text style={styles.statValue}>{pace}</Text>
            <Text style={styles.statUnit}> km/h</Text>
          </View>
          <Text style={styles.statLabel}>平均配速</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="timer-outline" size={20} color={colors.primary} />
          <View style={styles.statValueRow}>
            <Text style={styles.statValue}>{formatDuration(duration)}</Text>
          </View>
          <Text style={styles.statLabel}>总时长</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="trending-up" size={20} color={colors.primary} />
          <View style={styles.statValueRow}>
            <Text style={styles.statValue}>{distance.toFixed(1)}</Text>
            <Text style={styles.statUnit}> km</Text>
          </View>
          <Text style={styles.statLabel}>总距离</Text>
        </View>
      </View>

      <View style={styles.mapWrap}>
        <MapPlaceholder
          height={160}
          label="轨迹地图"
          sublabel="完成后展示本次路线"
        />
      </View>

      {photos.length > 0 && (
        <View style={styles.photosSection}>
          <Text style={styles.sectionTitle}>本次照片</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
            {photos.map((p, i) => (
              <View key={p.id || i} style={styles.photoThumb}>
                <Ionicons name="image-outline" size={28} color={colors.textLight} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.tipsSection}>
        <TipCard icon="bulb-outline" title="小贴士" description="连续遛狗超过30分钟，狗狗更容易保持好心情" tone="blue" />
      </View>

      <View style={styles.bottomFill} />

      <TouchableOpacity
        style={[styles.finishBtn, { marginBottom: insets.bottom + 20 }]}
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'WalkHome' }] })}
      >
        <Text style={styles.finishBtnText}>完成</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { alignItems: 'center', paddingVertical: spacing.lg },
  title: { ...typography.h1, color: colors.secondary },
  time: { ...typography.body, color: colors.textLight, marginTop: spacing.xs },
  statsGrid: {
    flexDirection: 'row', marginHorizontal: spacing.lg, marginTop: spacing.md,
    backgroundColor: colors.white, borderRadius: spacing.radiusLg, padding: spacing.md,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.xs },
  statValue: { ...typography.h2, color: colors.secondary },
  statUnit: { ...typography.caption, color: colors.textLight, marginLeft: 2 },
  statLabel: { ...typography.caption, color: colors.textLight, marginTop: spacing.xs },
  mapWrap: { marginHorizontal: spacing.lg, marginTop: spacing.md, borderRadius: spacing.radiusLg, overflow: 'hidden' },
  photosSection: { marginTop: spacing.md, paddingHorizontal: spacing.lg },
  sectionTitle: { ...typography.bodyBold, color: colors.secondary, marginBottom: spacing.sm },
  photoRow: { gap: 8 },
  photoThumb: {
    width: 100, height: 100, borderRadius: spacing.radiusMd,
    backgroundColor: colors.surfaceLight, alignItems: 'center', justifyContent: 'center',
  },
  tipsSection: { gap: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.md },
  bottomFill: { flex: 1 },
  finishBtn: {
    marginHorizontal: spacing.xl, marginTop: spacing.md,
    backgroundColor: colors.primary, borderRadius: spacing.radiusPill,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  finishBtnText: { ...typography.button, color: colors.secondary },
});
