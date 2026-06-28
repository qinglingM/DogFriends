import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, Card, Chip, DogAvatar } from '../../components';
import { useWalk } from '../../contexts/WalkContext';

const MONTHS = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

export default function WalkHistoryScreen({ navigation }) {
  const { records, 加载完成, refresh, getRecentRecords, getTotalStats } = useWalk();
  const totalStats = getTotalStats();
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerYear, setPickerYear] = useState(currentDate.getFullYear());
  let lastDate = '';

  const goPrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const selectMonth = (monthIndex) => {
    setCurrentDate(new Date(pickerYear, monthIndex, 1));
    setPickerVisible(false);
  };

  const formatRecord = (record) => {
    const duration = record.duration || 0;
    const m = Math.floor(duration / 60);
    const s = duration % 60;
    return {
      id: record.id,
      date: record.dateLabel || record.date,
      sortDate: record.startTime || record.date,
      time: `${m > 0 ? m + '分' : ''}${s}秒`,
      distance: `${(record.distance || 0).toFixed(1)} km`,
      duration: `${m} min`,
      pace: `${record.pace || 0} km/h`,
      dogs: (record.dogs || []).map(d => d.name),
    };
  };

  const allRecords = 加载完成
    ? records.map(formatRecord)
    : [];

  const displayRecords = useMemo(() => {
    return allRecords.filter(record => {
      const d = new Date(record.sortDate);
      if (isNaN(d.getTime())) return false;
      return d.getFullYear() === currentDate.getFullYear() &&
             d.getMonth() === currentDate.getMonth();
    });
  }, [allRecords, currentDate]);

  return (
    <View style={styles.screen}>
      <NavBar title="遛狗历史" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={!加载完成} onRefresh={refresh} />}>
        <View style={styles.monthSelector}>
          <TouchableOpacity style={styles.monthArrow} onPress={goPrevMonth} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color={colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setPickerYear(currentDate.getFullYear());
              setPickerVisible(true);
            }}
          >
            <Text style={styles.monthText}>
              {currentDate.getFullYear()} 年 {currentDate.getMonth() + 1} 月
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.monthArrow} onPress={goNextMonth} activeOpacity={0.7}>
            <Ionicons name="chevron-forward" size={20} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        <Card>
          <View style={styles.overviewRow}>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewLabel}>本月遛狗</Text>
              <View style={styles.overviewValueRow}>
                <Text style={styles.overviewValue}>{totalStats.count || 0}</Text>
                <Text style={styles.overviewUnit}>次</Text>
              </View>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewLabel}>本月距离</Text>
              <View style={styles.overviewValueRow}>
                <Text style={styles.overviewValue}>{(totalStats.distance || 0).toFixed(1)}</Text>
                <Text style={styles.overviewUnit}>km</Text>
              </View>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewLabel}>本月时长</Text>
              <View style={styles.overviewValueRow}>
                <Text style={styles.overviewValue}>{((totalStats.duration || 0) / 3600).toFixed(1)}</Text>
                <Text style={styles.overviewUnit}>h</Text>
              </View>
            </View>
          </View>
        </Card>

        {displayRecords.map(record => {
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
                  <Chip variant="verified" style={{ paddingVertical: 4, paddingHorizontal: 8 }} textStyle={{ fontSize: 10 }}>
                    已完成
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

      <Modal visible={pickerVisible} transparent animationType="fade" onRequestClose={() => setPickerVisible(false)}>
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setPickerVisible(false)}>
          <View style={styles.pickerCard}>
            <View style={styles.pickerYearRow}>
              <TouchableOpacity
                style={styles.pickerArrow}
                activeOpacity={0.7}
                onPress={() => setPickerYear(prev => prev - 1)}
              >
                <Ionicons name="chevron-back" size={20} color={colors.secondary} />
              </TouchableOpacity>
              <Text style={styles.pickerYearText}>{pickerYear} 年</Text>
              <TouchableOpacity
                style={styles.pickerArrow}
                activeOpacity={0.7}
                onPress={() => setPickerYear(prev => prev + 1)}
              >
                <Ionicons name="chevron-forward" size={20} color={colors.secondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.pickerGrid}>
              {MONTHS.map((month, i) => {
                const isSelected = pickerYear === currentDate.getFullYear() && i === currentDate.getMonth();
                const isFuture = pickerYear > now.getFullYear() || (pickerYear === now.getFullYear() && i > now.getMonth());
                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.pickerMonth,
                      isSelected && styles.pickerMonthSelected,
                      isFuture && styles.pickerMonthDisabled,
                    ]}
                    activeOpacity={0.7}
                    disabled={isFuture}
                    onPress={() => selectMonth(i)}
                  >
                    <Text style={[
                      styles.pickerMonthText,
                      isSelected && styles.pickerMonthTextSelected,
                      isFuture && styles.pickerMonthTextDisabled,
                    ]}>{month}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  overviewStat: { alignItems: 'center', gap: 4 },
  overviewValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  overviewValue: { ...typography.statValue, fontSize: 24, color: colors.secondary },
  overviewUnit: { ...typography.bodyBold, color: colors.secondary, fontSize: 16 },
  overviewLabel: { ...typography.caption, color: colors.textLight },
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

  pickerOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  pickerCard: {
    width: 300, backgroundColor: colors.white,
    borderRadius: spacing.radiusLg, padding: spacing.md,
    alignItems: 'center',
  },
  pickerYearRow: {
    flexDirection: 'row', alignItems: 'center', gap: 24,
    marginBottom: 20,
  },
  pickerArrow: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  pickerYearText: { ...typography.h3, color: colors.secondary, fontSize: 20 },
  pickerGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 8, justifyContent: 'center',
  },
  pickerMonth: {
    width: 80, height: 44,
    borderRadius: spacing.radiusMd,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.chipDefault,
  },
  pickerMonthSelected: { backgroundColor: colors.secondary },
  pickerMonthDisabled: { backgroundColor: 'transparent' },
  pickerMonthText: { ...typography.bodyBold, color: colors.textMain },
  pickerMonthTextSelected: { color: colors.white },
  pickerMonthTextDisabled: { color: colors.border },
});
