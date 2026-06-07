import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, Card, Button } from '../../components';

const VACCINES = [
  { name: '狂犬疫苗 (第3针)', date: '2025-09-15', note: '进口狂犬疫苗，有效期 1 年。', done: true },
  { name: '六联疫苗 (第3针)', date: '2025-06-01', note: '卫佳捌六联疫苗。', done: true },
  { name: '体内外驱虫', date: '2026-05-20', note: '拜宠清体内 + 福来恩体外。', done: true },
  { name: '狂犬疫苗加强针 (待接种)', date: '预计 2026-09-15', note: '距离上次接种已满 1 年。', done: false },
];

export default function VaccineScreen({ navigation }) {
  return (
    <View style={styles.screen}>
      <NavBar title="疫苗记录" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.summaryRow}>
            <View style={styles.summaryStat}>
              <Ionicons name="medkit" size={24} color={colors.primary} style={{ marginBottom: 4 }} />
              <Text style={styles.summaryValue}>3</Text>
              <Text style={styles.summaryLabel}>已接种</Text>
            </View>
            <View style={styles.summaryStat}>
              <Ionicons name="calendar" size={24} color={colors.primary} style={{ marginBottom: 4 }} />
              <Text style={styles.summaryValue}>1</Text>
              <Text style={styles.summaryLabel}>待接种</Text>
            </View>
            <View style={styles.summaryStat}>
              <Ionicons name="notifications" size={24} color={colors.primary} style={{ marginBottom: 4 }} />
              <Text style={styles.summaryValue}>92</Text>
              <Text style={styles.summaryLabel}>天后提醒</Text>
            </View>
          </View>
        </Card>

        <View style={styles.reminder}>
          <View style={styles.reminderIcon}>
            <Ionicons name="notifications" size={24} color={colors.accent} />
          </View>
          <View style={styles.reminderText}>
            <Text style={styles.reminderTitle}>下次接种提醒</Text>
            <Text style={styles.reminderDesc}>狂犬疫苗加强针 · 预计 2026-09-15</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>接种记录</Text>

        <View style={styles.timeline}>
          {VACCINES.map((v, i) => (
            <View key={i} style={styles.timelineItem}>
              <View style={styles.timelineDotCol}>
                <View style={[styles.timelineDot, !v.done && styles.timelineDotUpcoming]}>
                  <Ionicons
                    name={v.done ? 'checkmark' : 'time'}
                    size={12}
                    color={v.done ? colors.secondary : colors.accent}
                  />
                </View>
                {i < VACCINES.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <Card style={[styles.timelineCard, !v.done && styles.timelineCardUpcoming]}>
                <Text style={[styles.tlTitle, !v.done && { color: colors.accent }]}>{v.name}</Text>
                <Text style={styles.tlDate}>{v.date}</Text>
                <Text style={styles.tlNote}>{v.note}</Text>
              </Card>
            </View>
          ))}
        </View>

        <Button
          fullWidth
          icon={<Ionicons name="add" size={20} color={colors.secondary} />}
          style={{ marginTop: 16 }}
        >
          添加疫苗记录
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screenMargin, paddingBottom: 48 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryStat: { alignItems: 'center' },
  summaryValue: { ...typography.statValue, color: colors.secondary },
  summaryLabel: { ...typography.caption, color: colors.textLight, marginTop: 4 },
  reminder: {
    flexDirection: 'row', gap: 16, padding: spacing.md,
    backgroundColor: 'rgba(146, 102, 153, 0.08)',
    borderRadius: spacing.radiusMd, marginBottom: 24, alignItems: 'center',
  },
  reminderIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(146, 102, 153, 0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  reminderText: { flex: 1 },
  reminderTitle: { ...typography.bodyBold, color: colors.accent, marginBottom: 4 },
  reminderDesc: { ...typography.caption, color: colors.textLight, lineHeight: 18 },
  sectionTitle: { ...typography.h3, color: colors.secondary, marginBottom: 16 },
  timeline: { gap: 0 },
  timelineItem: { flexDirection: 'row', gap: 0 },
  timelineDotCol: { width: 32, alignItems: 'center' },
  timelineDot: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.primary, borderWidth: 3, borderColor: colors.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  timelineDotUpcoming: {
    backgroundColor: colors.white, borderWidth: 2,
    borderColor: colors.accent, borderStyle: 'dashed',
  },
  timelineLine: { width: 2, flex: 1, backgroundColor: colors.border },
  timelineCard: { flex: 1, marginBottom: 16, marginLeft: 8 },
  timelineCardUpcoming: { borderWidth: 2, borderColor: colors.accent, borderStyle: 'dashed' },
  tlTitle: { ...typography.bodyBold, fontSize: 16, color: colors.secondary, marginBottom: 4 },
  tlDate: { ...typography.caption, color: colors.textLight, marginBottom: 8 },
  tlNote: { ...typography.body, color: colors.textMain },
});
