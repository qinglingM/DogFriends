import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { TipCard, DogAvatar, WalkMap } from '../../components';
import { useWalk } from '../../contexts/WalkContext';
import { useDogs } from '../../contexts/DogContext';

export default function WalkResultScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { records } = useWalk();
  const { dogs: allDogs } = useDogs();
  const walkId = route?.params?.id;
  const last = useMemo(() => {
    if (walkId) return records.find((record) => record.id === walkId) || records[0];
    return records[0];
  }, [records, walkId]);

  const distance = last?.distance || 0;
  const duration = last?.duration || 0;
  const pace = last?.pace || 0;
  const dogs = last?.dogs || [];
  const trackPoints = last?.trackPoints || [];
  const normalizedDogs = useMemo(() => {
    return dogs.map((dog, index) => {
      const dogId = typeof dog === 'string' ? dog : dog?.id;
      const found = allDogs.find((item) => item.id === dogId);
      return {
        id: dogId || `dog_${index}`,
        name: (typeof dog === 'object' && dog?.name) || found?.name || `狗狗${index + 1}`,
        image: (typeof dog === 'object' && dog?.image) || found?.image || null,
      };
    });
  }, [dogs, allDogs]);

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
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}> 
        <View style={styles.checkIcon}>
          <Ionicons name="checkmark-circle" size={56} color={colors.primary} />
        </View>
        <Text style={styles.title}>遛狗完成！</Text>
        <Text style={styles.time}>{formatTime(last?.startTime)}</Text>
      </View>

      {normalizedDogs.length > 0 && (
        <View style={styles.dogRow}>
          {normalizedDogs.map(dog => (
            <View key={dog.id} style={styles.dogItem}>
              <DogAvatar size={48} image={dog.image} />
              <Text style={styles.dogName}>{dog.name}</Text>
            </View>
          ))}
        </View>
      )}

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
        <View style={styles.routeCard}>
          <View style={styles.routeHeader}>
            <Ionicons name="git-network-outline" size={20} color={colors.primary} />
            <Text style={styles.routeTitle}>路线轨迹</Text>
          </View>
          <View style={styles.routeMapWrap}>
            <WalkMap
              points={trackPoints}
              interactive={false}
              autoFitRoute
              emptyLabel="本次遛狗未记录到轨迹"
              style={styles.routeMap}
            />
          </View>
        </View>
      </View>

      <View style={styles.tipsSection}>
        <TipCard icon="bulb-outline" title="小贴士" description="连续遛狗超过30分钟，狗狗更容易保持好心情" tone="blue" />
      </View>

      <TouchableOpacity
        style={[styles.finishBtn, { marginBottom: insets.bottom + 8 }]}
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'WalkHome' }] })}
      >
        <Text style={styles.finishBtnText}>完成</Text>
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: spacing.lg },
  header: { alignItems: 'center', paddingVertical: spacing.md },
  checkIcon: { marginBottom: spacing.sm },
  title: { ...typography.h1, color: colors.secondary },
  time: { ...typography.body, color: colors.textLight, marginTop: spacing.xs },
  dogRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  dogItem: {
    alignItems: 'center',
    gap: 6,
  },
  dogName: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.secondary,
  },
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
  routeCard: {
    backgroundColor: colors.white, borderRadius: spacing.radiusLg,
    padding: spacing.md,
  },
  routeMapWrap: {
    borderRadius: spacing.radiusMd,
    overflow: 'hidden',
    height: 220,
    marginBottom: spacing.md,
  },
  routeMap: {
    flex: 1,
  },
  routeHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginBottom: spacing.md,
  },
  routeTitle: { ...typography.bodyBold, color: colors.secondary },
  tipsSection: { gap: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.md },
  finishBtn: {
    marginHorizontal: spacing.xl, marginTop: spacing.md,
    backgroundColor: colors.primary, borderRadius: spacing.radiusPill,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  finishBtnText: { ...typography.button, color: colors.secondary },
});
