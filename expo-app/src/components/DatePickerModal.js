import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export default function DatePickerModal({ visible, date, onConfirm, onCancel, maxDate }) {
  const insets = useSafeAreaInsets();
  const max = maxDate ? new Date(maxDate + 'T00:00:00') : new Date();
  const maxYear = max.getFullYear();
  const maxMonth = max.getMonth() + 1;
  const maxDayOfMonth = max.getDate();

  function clampDate(d) {
    const y = Math.min(d.getFullYear(), maxYear);
    const m = y === maxYear ? Math.min(d.getMonth() + 1, maxMonth) : d.getMonth() + 1;
    const dd = (y === maxYear && m === maxMonth) ? Math.min(d.getDate(), maxDayOfMonth) : d.getDate();
    return { year: y, month: m, day: dd };
  }

  const init = clampDate(date ? new Date(date + 'T00:00:00') : new Date());
  const [year, setYear] = useState(init.year);
  const [month, setMonth] = useState(init.month);
  const [day, setDay] = useState(init.day);

  useEffect(() => {
    if (visible) {
      const d = clampDate(date ? new Date(date + 'T00:00:00') : new Date());
      setYear(d.year);
      setMonth(d.month);
      setDay(d.day);
    }
  }, [visible, date]);

  const years = Array.from({ length: maxYear - 1990 + 1 }, (_, i) => 1990 + i);
  const months = Array.from({ length: year === maxYear ? maxMonth : 12 }, (_, i) => i + 1);

  const maxDay = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    if (year === maxYear && month === maxMonth) {
      return Math.min(daysInMonth, maxDayOfMonth);
    }
    return daysInMonth;
  }, [year, month, maxYear, maxMonth, maxDayOfMonth]);

  useEffect(() => {
    if (day > maxDay) setDay(maxDay);
  }, [maxDay]);

  useEffect(() => {
    setMonth(prev => Math.min(prev, year === maxYear ? maxMonth : 12));
  }, [year]);

  const displayText = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const handleConfirm = () => {
    onConfirm(displayText);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestCancel={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>选择生日</Text>
            <TouchableOpacity onPress={onCancel} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={colors.textMain} />
            </TouchableOpacity>
          </View>

          <View style={styles.pickerRow}>
            <View style={styles.pickerCol}>
              <Text style={styles.colLabel}>年</Text>
              <Picker
                selectedValue={year}
                onValueChange={(v) => setYear(v)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {years.map((y) => (
                  <Picker.Item key={y} label={`${y}`} value={y} />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerCol}>
              <Text style={styles.colLabel}>月</Text>
              <Picker
                selectedValue={month}
                onValueChange={(v) => setMonth(v)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {months.map((m) => (
                  <Picker.Item key={m} label={`${m}`} value={m} />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerCol}>
              <Text style={styles.colLabel}>日</Text>
              <Picker
                selectedValue={day}
                onValueChange={(v) => setDay(v)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
                  <Picker.Item key={d} label={`${d}`} value={d} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.7} onPress={onCancel}>
              <Text style={styles.cancelBtnText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} activeOpacity={0.7} onPress={handleConfirm}>
              <Text style={styles.confirmBtnText}>确定</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: spacing.radiusLg,
    borderTopRightRadius: spacing.radiusLg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h3, color: colors.secondary },
  pickerRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    height: 200,
  },
  pickerCol: {
    flex: 1,
    alignItems: 'center',
  },
  colLabel: {
    ...typography.captionBold,
    color: colors.textLight,
    marginTop: 8,
  },
  picker: {
    width: '100%',
    height: 160,
  },
  pickerItem: {
    fontSize: 18,
    color: colors.textMain,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelBtn: {
    flex: 1,
    height: spacing.touchTarget,
    borderRadius: spacing.radiusMd,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  cancelBtnText: { ...typography.bodyBold, color: colors.textLight },
  confirmBtn: {
    flex: 1,
    height: spacing.touchTarget,
    borderRadius: spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
  },
  confirmBtnText: { ...typography.bodyBold, color: colors.white },
});
