import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, Card, Chip, DogAvatar } from '../../components';

const MOCK_RECORDS = [
  { id: '1', date: '今天 · 6月7日', time: '08:30 - 09:15', distance: '3.2 km', duration: '45 min', pace: '4.3 km/h', dogs: ['旺财'] },
  { id: '2', date: '昨天 · 6月6日', time: '18:00 - 18:40', distance: '2.8 km', duration: '40 min', pace: '4.2 km/h', dogs: ['旺财', '小白'] },
  { id: '3', date: '昨天 · 6月6日', time: '07:15 - 07:45', distance: '1.5 km', duration: '30 min', pace: '3.0 km/h', dogs: ['小白'] },
  { id: '4', date: '6月5日', time: '19:00 - 19:55', distance: '4.1 km', duration: '55 min', pace: '4.5 km/h', dogs: ['旺财'] },
];

export default function WalkHistoryScreen({ navigation }) {
  let lastDate = '';

  return (
    <View style={styles.screen}>
      <NavBar title="遛狗历史" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.monthSelector}>
          <TouchableOpacity style={styles.monthArrow}>
            <Ionicons name="chevron-back" size={20} color={colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.monthText}>2026 年 6 月</Text>
          <TouchableOpacity style={styles.monthArrow}>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        <Card>
          <View style={styles.overviewRow}>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewValue}>18</Text>
              <Text style={styles.overviewUnit}>次</Text>
              <Text style={styles.overviewLabel}>本月遛狗</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewValue}>48.2</Text>
              <Text style={styles.overviewUnit}>km</Text>
              <Text style={styles.overviewLabel}>本月距离</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewValue}>14.5</Text>
              <Text style={styles.overviewUnit}>h</Text>
              <Text style={styles.overviewLabel}>本月时长</Text>
            </View>
          </View>
        </Card>

        {MOCK_RECORDS.map(record => {
          const showDate = record.date !== lastDate;
          lastDate = record.date;
          return (
            <View key={record.id}>
              {showDate && <Text style={styles.dateGroup}>{record.date}</Text>}
              <TouchableOpacity
                style={styles.record}
                onPress={() => navigation.navigate('WalkDetail', { id: record.id })}
              >
                <View style={styles.recordHeader}>
                  <Text style={styles.recordDate}>{record.time}</Text>
                  <Chip variant="verified" style={{ paddingVertical: 4, paddingHorizontal: 8 }}>
                    <Text style={{ fontSize: 10 }}>已完成</Text>
                  </Chip>
                </View>
                <View style={styles.recordStats}>
                  <View style={styles.recordStat}>
                    <Ionicons name="trending-up" size={16} color={colors.primary} />
                    <Text style={styles.recordStatText}>{record.distance}</Text>
                  </View>
                  <View style={styles.recordStat}>
                    <Ionicons name="timer-outline" size={16} color={colors.primary} />
                    <Text style={styles.recordStatText}>{record.duration}</Text>
                  </View>
                  <View style={styles.recordStat}>
                    <Ionicons name="speedometer-outline" size={16} color={colors.primary} />
                    <Text style={styles.recordStatText}>{record.pace}</Text>
                  </View>
                </View>
                <View style={styles.recordDogs}>
                  {record.dogs.map((d, i) => (
                    <React.Fragment key={i}>
                      <DogAvatar size={24} />
                      <Text style={styles.recordDogName}>{d}</Text>
                    </React.Fragment>
                  ))}
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screenMargin, paddingBottom: 48 },
  monthSelector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 24, marginBottom: 24,
  },
  monthArrow: {
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
    borderRadius: 20,
  },
  monthText: { ...typography.h3, color: colors.secondary },
  overviewRow: { flexDirection: 'row', justifyContent: 'space-around' },
  overviewStat: { alignItems: 'center' },
  overviewValue: { ...typography.statValue, fontSize: 32, color: colors.secondary },
  overviewUnit: { ...typography.captionBold, color: colors.secondary },
  overviewLabel: { ...typography.caption, color: colors.textLight, marginTop: 4 },
  dateGroup: {
    ...typography.bodyBold, color: colors.textLight,
    paddingVertical: 8, marginTop: 8,
  },
  record: {
    backgroundColor: colors.white, borderRadius: spacing.radiusMd,
    padding: spacing.md, marginBottom: spacing.cardGap, gap: 12,
  },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recordDate: { ...typography.bodyBold, color: colors.secondary },
  recordStats: { flexDirection: 'row', gap: 16 },
  recordStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recordStatText: { ...typography.bodyBold, color: colors.textMain },
  recordDogs: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recordDogName: { ...typography.caption, color: colors.textLight },
});
