import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, StyleSheet, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { DogAvatar, TipCard } from '../../components';
import { useWalk } from '../../contexts/WalkContext';

const BRISTOL_OPTIONS = [
  { key: '1', label: '硬球', emoji: '🫘' },
  { key: '2', label: '香肠', emoji: '🥖' },
  { key: '3', label: '裂纹', emoji: '🧱' },
  { key: '4', label: '光滑', emoji: '🐍' },
  { key: '5', label: '软块', emoji: '☁️' },
  { key: '6', label: '糊状', emoji: '💧' },
  { key: '7', label: '水样', emoji: '🌊' },
];

const MOOD_OPTIONS = ['😊', '😐', '😔', '焦躁', '攻击性', '嗜睡', '分离焦虑'];

const BEHAVIOR_OPTIONS = ['爆冲', '拖行', '对狗吠叫', '扑人', '捡食', '追车', '护食'];

export default function WalkCheckinScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { saveCheckin, finishWalk, dogs: currentDogs } = useWalk();
  const dogs = currentDogs?.length ? currentDogs : [{ id: '1', name: '旺财' }];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [records, setRecords] = useState({});
  const [showBristol, setShowBristol] = useState(true);
  const [showBehavior, setShowBehavior] = useState(false);

  const currentDog = dogs[currentIndex];
  const currentId = currentDog?.id || '0';
  const current = records[currentId] || { pee: null, poop: null, bristol: null, mood: null, behaviors: [], notes: '' };

  const update = (field, value) => {
    setRecords(prev => ({ ...prev, [currentId]: { ...prev[currentId], [field]: value } }));
  };

  const toggleBehavior = (b) => {
    const list = current.behaviors || [];
    update('behaviors', list.includes(b) ? list.filter(x => x !== b) : [...list, b]);
  };

  const hasData = current.pee !== null || current.poop !== null || current.mood !== null || current.behaviors?.length > 0;

  const handleSave = () => {
    Keyboard.dismiss();
    saveCheckin(current);
    if (currentIndex < dogs.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishWalk();
      navigation.replace('WalkResult');
    }
  };

  const handleSkip = () => {
    Keyboard.dismiss();
    if (currentIndex < dogs.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishWalk();
      navigation.replace('WalkResult');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Text style={styles.headerTitle}>记录狗狗状态</Text>
          <Text style={styles.headerSub}>
            {dogs.length > 1 ? `${currentIndex + 1} / ${dogs.length}` : '可跳过'}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => Keyboard.dismiss()}
        >
          <View style={styles.dogCard}>
            <View style={styles.dogHeader}>
              <DogAvatar size={44} />
              <View style={styles.dogInfo}>
                <Text style={styles.dogName}>{currentDog?.name || '未知'}</Text>
                <Text style={styles.dogBreed}>刚才遛了多久</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>排尿排便</Text>
            <View style={styles.bwRow}>
              <TouchableOpacity
                style={[styles.bwBtn, current.pee === 'normal' && styles.bwBtnActive]}
                onPress={() => update('pee', current.pee === 'normal' ? null : 'normal')}
              >
                <Text style={[styles.bwBtnText, current.pee === 'normal' && styles.bwBtnTextActive]}>排尿</Text>
                <Text style={[styles.bwBtnSub, current.pee === 'normal' && styles.bwBtnSubActive]}>正常</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bwBtn, current.pee === 'much' && styles.bwBtnActive]}
                onPress={() => update('pee', current.pee === 'much' ? null : 'much')}
              >
                <Text style={[styles.bwBtnText, current.pee === 'much' && styles.bwBtnTextActive]}>排尿</Text>
                <Text style={[styles.bwBtnSub, current.pee === 'much' && styles.bwBtnSubActive]}>偏多</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.bwRow}>
              <TouchableOpacity
                style={[styles.bwBtn, current.poop === 'normal' && styles.bwBtnActive]}
                onPress={() => update('poop', current.poop === 'normal' ? null : 'normal')}
              >
                <Text style={[styles.bwBtnText, current.poop === 'normal' && styles.bwBtnTextActive]}>排便</Text>
                <Text style={[styles.bwBtnSub, current.poop === 'normal' && styles.bwBtnSubActive]}>正常</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bwBtn, current.poop === 'much' && styles.bwBtnActive]}
                onPress={() => update('poop', current.poop === 'much' ? null : 'much')}
              >
                <Text style={[styles.bwBtnText, current.poop === 'much' && styles.bwBtnTextActive]}>排便</Text>
                <Text style={[styles.bwBtnSub, current.poop === 'much' && styles.bwBtnSubActive]}>偏多</Text>
              </TouchableOpacity>
            </View>

            {current.poop !== null && (
              <View style={styles.bristolSection}>
                <Text style={styles.bristolTitle}>粪便形态 (Bristol)</Text>
                <View style={styles.bristolGrid}>
                  {BRISTOL_OPTIONS.map(b => (
                    <TouchableOpacity
                      key={b.key}
                      style={[styles.bristolCard, current.bristol === b.key && styles.bristolCardActive]}
                      onPress={() => update('bristol', current.bristol === b.key ? null : b.key)}
                    >
                      <Text style={styles.bristolEmoji}>{b.emoji}</Text>
                      <Text style={[styles.bristolLabel, current.bristol === b.key && styles.bristolLabelActive]}>{b.key}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <Text style={styles.sectionTitle}>精神状态</Text>
            <View style={styles.moodRow}>
              {MOOD_OPTIONS.map((m, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.moodItem, current.mood === m && styles.moodItemActive]}
                  onPress={() => update('mood', current.mood === m ? null : m)}
                >
                  <Text style={styles.moodEmoji}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.collapseToggle}
              onPress={() => setShowBehavior(!showBehavior)}
            >
              <Text style={styles.collapseText}>
                {showBehavior ? '收起异常行为 ▲' : '记录异常行为 ▼'}
              </Text>
            </TouchableOpacity>

            {showBehavior && (
              <View style={styles.chipGrid}>
                {BEHAVIOR_OPTIONS.map(b => (
                  <TouchableOpacity
                    key={b}
                    style={[styles.chip, current.behaviors?.includes(b) && styles.chipActive]}
                    onPress={() => toggleBehavior(b)}
                  >
                    <Text style={[styles.chipText, current.behaviors?.includes(b) && styles.chipTextActive]}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.notesSection}>
              <TextInput
                style={styles.notesInput}
                placeholder="添加备注"
                placeholderTextColor={colors.textLight}
                value={current.notes}
                onChangeText={(t) => update('notes', t)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={() => Keyboard.dismiss()}
              />
            </View>
          </View>
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.bottomBtns}>
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
              <Text style={styles.skipText}>跳过</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, !hasData && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!hasData}
            >
              <Text style={[styles.saveText, !hasData && styles.saveTextDisabled]}>
                {currentIndex < dogs.length - 1 ? '下一只' : '保存并查看结果'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight },
  screen: { flex: 1 },
  header: { alignItems: 'center', paddingBottom: 8 },
  headerTitle: { ...typography.h2, color: colors.secondary },
  headerSub: { ...typography.caption, color: colors.textLight, marginTop: 2 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg, paddingBottom: 160 },
  dogCard: {
    backgroundColor: colors.white, borderRadius: spacing.radiusLg, padding: spacing.lg,
    shadowColor: colors.secondary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  dogHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  dogInfo: { flex: 1 },
  dogName: { ...typography.bodyBold, color: colors.secondary },
  dogBreed: { ...typography.caption, color: colors.textLight },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  sectionTitle: { ...typography.bodyBold, color: colors.secondary, marginTop: spacing.md, marginBottom: spacing.sm },
  bwRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  bwBtn: {
    flex: 1, paddingVertical: 10, borderRadius: spacing.radiusSm,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.bgLight,
    alignItems: 'center',
  },
  bwBtnActive: { borderColor: colors.primary, backgroundColor: '#F0F5E6' },
  bwBtnText: { ...typography.captionBold, color: colors.textLight, fontSize: 12 },
  bwBtnTextActive: { color: colors.secondary },
  bwBtnSub: { ...typography.caption, color: colors.textLight, fontSize: 11, marginTop: 1 },
  bwBtnSubActive: { color: colors.primary },
  bristolSection: { marginTop: spacing.sm },
  bristolTitle: { ...typography.caption, color: colors.textLight, marginBottom: 6 },
  bristolGrid: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  bristolCard: {
    width: 52, height: 56, borderRadius: spacing.radiusSm, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F7F7F7', borderWidth: 1, borderColor: '#EEE',
  },
  bristolCardActive: { backgroundColor: '#D3E0C8', borderColor: colors.primary },
  bristolEmoji: { fontSize: 18 },
  bristolLabel: { ...typography.caption, color: colors.textLight, fontSize: 9, marginTop: 2 },
  bristolLabelActive: { color: colors.secondary },
  moodRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  moodItem: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.bgLight, alignItems: 'center', justifyContent: 'center',
  },
  moodItemActive: { borderColor: colors.primary, backgroundColor: '#D3E0C8' },
  moodEmoji: { fontSize: 20 },
  collapseToggle: { marginTop: spacing.md, paddingVertical: 4, alignItems: 'center' },
  collapseText: { ...typography.caption, color: colors.textLight, fontWeight: '500' },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.sm },
  chip: {
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: spacing.radiusPill,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.bgLight,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.textLight, fontWeight: '500' },
  chipTextActive: { color: colors.secondary, fontWeight: '600' },
  notesSection: { marginTop: spacing.md },
  notesInput: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: spacing.radiusMd,
    padding: spacing.md, ...typography.body, color: colors.secondary,
    minHeight: 80, maxHeight: 120, backgroundColor: colors.bgLight,
  },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  bottomBtns: {
    flexDirection: 'row', gap: 12, paddingHorizontal: spacing.lg,
  },
  skipBtn: {
    flex: 1, paddingVertical: 14, borderRadius: spacing.radiusPill,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.bgLight,
    alignItems: 'center',
  },
  skipText: { ...typography.bodyBold, color: colors.textLight, fontSize: 14 },
  saveBtn: {
    flex: 2, paddingVertical: 14, borderRadius: spacing.radiusPill,
    backgroundColor: colors.primary, alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveText: { ...typography.bodyBold, color: colors.secondary, fontSize: 14 },
  saveTextDisabled: { color: colors.textLight },
});
