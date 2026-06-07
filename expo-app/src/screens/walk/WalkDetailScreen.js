import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, Card, Chip, DogAvatar, MapPlaceholder } from '../../components';

export default function WalkDetailScreen({ navigation }) {
  return (
    <View style={styles.screen}>
      <NavBar title="遛狗详情" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <MapPlaceholder height={240} label="路线回放地图" style={{ borderRadius: 0, marginBottom: 0 }} />

        <View style={styles.body}>
          <View style={styles.header}>
            <View>
              <Text style={styles.date}>6月7日 周六</Text>
              <Text style={styles.time}>08:30 - 09:15 · 45 分钟</Text>
            </View>
            <Chip variant="verified">已完成</Chip>
          </View>

          <View style={styles.dogChips}>
            <View style={styles.dogChip}>
              <DogAvatar size={32} />
              <Text style={styles.dogChipName}>旺财</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            {[
              { icon: 'trending-up', value: '3.2', unit: ' km', label: '总距离' },
              { icon: 'timer-outline', value: '45', unit: ' min', label: '总时长' },
              { icon: 'speedometer-outline', value: '4.3', unit: ' km/h', label: '平均配速' },
            ].map((s, i) => (
              <View key={i} style={styles.statItem}>
                <Ionicons name={s.icon} size={24} color={colors.primary} style={{ marginBottom: 4 }} />
                <Text style={styles.statValue}>{s.value}<Text style={styles.statUnit}>{s.unit}</Text></Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          <Card>
            <View style={styles.checkinTitle}>
              <Ionicons name="clipboard" size={16} color={colors.primary} />
              <Text style={styles.checkinTitleText}>健康打卡记录</Text>
            </View>

            <View style={styles.dogSection}>
              <DogAvatar size={32} />
              <Text style={styles.dogSectionName}>旺财</Text>
            </View>
            {[
              { label: '排尿', value: '2 次' },
              { label: '排便', value: '1 次' },
              { label: '便便状态', value: 'B4 理想便便 😄' },
              { label: '精神状态', value: '😄 活力满满' },
              { label: '异常行为', value: '不愿走' },
              { label: '备注', value: '走到一半不太想动' },
            ].map((row, i) => (
              <View key={i} style={[styles.checkinRow, i < 5 && styles.checkinRowBorder]}>
                <Text style={styles.checkinLabel}>{row.label}</Text>
                <Text style={styles.checkinValue}>{row.value}</Text>
              </View>
            ))}

            <View style={[styles.dogSection, { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }]}>
              <DogAvatar size={32} />
              <Text style={styles.dogSectionName}>小白</Text>
            </View>
            {[
              { label: '排尿', value: '1 次' },
              { label: '排便', value: '0 次' },
              { label: '精神状态', value: '🙂 心情不错' },
              { label: '异常行为', value: '无' },
            ].map((row, i) => (
              <View key={i} style={[styles.checkinRow, i < 3 && styles.checkinRowBorder]}>
                <Text style={styles.checkinLabel}>{row.label}</Text>
                <Text style={styles.checkinValue}>{row.value}</Text>
              </View>
            ))}
          </Card>

          <Text style={styles.photoTitle}>
            <Ionicons name="camera" size={14} color={colors.primary} /> 打卡照片
            <Text style={styles.photoCount}>  3 张</Text>
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
            {[1, 2, 3].map(i => (
              <View key={i} style={styles.photoItem}>
                <Ionicons name="image-outline" size={32} color={colors.secondary} style={{ opacity: 0.5 }} />
                <Text style={styles.photoTime}>08:{40 + i * 10}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 48 },
  body: { padding: spacing.screenMargin, gap: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  date: { ...typography.h2, color: colors.secondary, marginBottom: 4 },
  time: { ...typography.body, color: colors.textLight },
  dogChips: { flexDirection: 'row', gap: 8 },
  dogChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.white, borderRadius: spacing.radiusPill,
    paddingVertical: 8, paddingLeft: 8, paddingRight: 16,
  },
  dogChipName: { ...typography.bodyBold, color: colors.secondary },
  statsGrid: { flexDirection: 'row', gap: 8 },
  statItem: {
    flex: 1, backgroundColor: colors.white, borderRadius: spacing.radiusMd,
    paddingVertical: 16, alignItems: 'center',
  },
  statValue: { ...typography.statValue, color: colors.secondary },
  statUnit: { ...typography.captionBold, color: colors.secondary },
  statLabel: { ...typography.caption, color: colors.textLight, marginTop: 4 },
  checkinTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  checkinTitleText: { ...typography.bodyBold, color: colors.secondary },
  dogSection: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  dogSectionName: { ...typography.bodyBold, color: colors.secondary },
  checkinRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 8,
  },
  checkinRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  checkinLabel: { ...typography.body, color: colors.textLight },
  checkinValue: { ...typography.bodyBold, color: colors.secondary },
  photoTitle: { ...typography.bodyBold, color: colors.secondary, marginBottom: 12 },
  photoCount: { ...typography.body, color: colors.textLight },
  photoRow: { flexDirection: 'row', gap: 8 },
  photoItem: {
    width: 96, height: 96, borderRadius: spacing.radiusMd,
    backgroundColor: '#D3E0C8', alignItems: 'center', justifyContent: 'center',
  },
  photoTime: {
    position: 'absolute', bottom: 8, left: 8,
    fontSize: 10, color: colors.white,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
});
