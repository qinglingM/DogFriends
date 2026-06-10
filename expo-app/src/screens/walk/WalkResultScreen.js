import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Button, MapPlaceholder } from '../../components';

export default function WalkResultScreen({ navigation }) {
  const handleComplete = () => {
    navigation.getParent()?.getParent()?.reset({ index: 0, routes: [{ name: 'Walk' }] });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>遛狗记录</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <MapPlaceholder
          height={200}
          label="路线回放"
          sublabel="高德地图路线回放"
          style={{ borderRadius: spacing.radiusMd }}
        />

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Ionicons name="trending-up" size={20} color={colors.primary} />
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>3.2</Text>
              <Text style={styles.statUnit}> km</Text>
            </View>
            <Text style={styles.statLabel}>总距离</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="timer-outline" size={20} color={colors.primary} />
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>45</Text>
              <Text style={styles.statUnit}> min</Text>
            </View>
            <Text style={styles.statLabel}>总时长</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="speedometer-outline" size={20} color={colors.primary} />
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>4.3</Text>
              <Text style={styles.statUnit}> km/h</Text>
            </View>
            <Text style={styles.statLabel}>平均配速</Text>
          </View>
        </View>

        <View style={styles.photoSection}>
          <Text style={styles.photoTitle}>
            <Ionicons name="camera" size={14} color={colors.primary} /> 打卡照片
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
            {[1, 2, 3].map(i => (
              <View key={i} style={styles.photoItem}>
                <Ionicons name="image-outline" size={24} color={colors.secondary} style={{ opacity: 0.5 }} />
                <Text style={styles.photoTime}>10:{20 + i * 10}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <Button fullWidth onPress={handleComplete} style={{ marginTop: 8 }}>
          完成
        </Button>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.bodyBold, fontSize: 16, color: colors.secondary },
  content: { padding: spacing.screenMargin },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.cardGap,
    marginTop: spacing.cardGap,
  },
  statItem: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6,
  },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline' },
  statValue: { ...typography.statValue, fontSize: 20, color: colors.secondary },
  statUnit: { ...typography.captionBold, fontSize: 12, color: colors.secondary },
  statLabel: { ...typography.caption, color: colors.textLight },
  photoSection: { marginBottom: spacing.cardGap },
  photoTitle: { ...typography.bodyBold, fontSize: 14, color: colors.secondary, marginBottom: 12 },
  photoRow: { flexDirection: 'row', gap: 8 },
  photoItem: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#D3E0C8',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  photoTime: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    fontSize: 8,
    color: colors.white,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
});
