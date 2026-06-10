import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, StyleSheet, Keyboard, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, Button, Chip, DogAvatar, EmojiSelector } from '../../components';
import { useWalk } from '../../contexts/WalkContext';

const PEE_OPTIONS = [
  { value: 'none', label: '没有' },
  { value: 'normal', label: '正常' },
  { value: 'much', label: '偏多' },
];

const BRISTOL = [
  { level: 'B1', emoji: '🫘', desc: '干硬颗粒' },
  { level: 'B2', emoji: '🌰', desc: '干硬成块' },
  { level: 'B3', emoji: '🥖', desc: '正常偏硬' },
  { level: 'B4', emoji: '🍫', desc: '理想便便' },
  { level: 'B5', emoji: '🍦', desc: '偏软成型' },
  { level: 'B6', emoji: '💧', desc: '软糊不成形' },
  { level: 'B7', emoji: '🌊', desc: '水样拉稀' },
];

const BEHAVIOR_OPTIONS = ['爆冲', '拖行', '对狗吠叫', '扑人', '捡食', '追车', '护食'];

function InlineOption({ options, value, onChange }) {
  return (
    <View style={styles.optionRow}>
      {options.map(opt => {
        const isActive = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[styles.optionBtn, isActive && styles.optionBtnActive]}
            onPress={() => onChange(isActive ? null : opt.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function CompactBristol({ value, onChange, disabled }) {
  return (
    <View style={styles.bristolRow}>
      {BRISTOL.map(b => {
        const isActive = value === b.level;
        return (
          <TouchableOpacity
            key={b.level}
            style={[styles.bristolItem, isActive && styles.bristolItemActive, disabled && styles.bristolItemDisabled]}
            onPress={() => !disabled && onChange(isActive ? null : b.level)}
            activeOpacity={disabled ? 1 : 0.7}
          >
            <Text style={[styles.bristolEmoji, disabled && styles.bristolTextDisabled]}>{b.emoji}</Text>
            <Text style={[styles.bristolLevel, isActive && styles.bristolLevelActive, disabled && styles.bristolTextDisabled]}>{b.level}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function DogCheckinCard({ dog, data, onChange, walkPhotos, onPhotoPreview }) {
  const update = (field, value) => onChange({ ...data, [field]: value });
  const poopDisabled = !data.poop || data.poop === 'none';

  const toggleBehavior = (b) => {
    const list = data.behaviors || [];
    update('behaviors', list.includes(b) ? list.filter(x => x !== b) : [...list, b]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.dogHeader}>
        <DogAvatar size={40} />
        <View style={styles.dogInfo}>
          <Text style={styles.dogName}>{dog.name}</Text>
        </View>
        {walkPhotos.length > 0 && (
          <TouchableOpacity style={styles.photoPreviewBtn} onPress={onPhotoPreview}>
            <Ionicons name="images-outline" size={18} color={colors.secondary} />
            <View style={styles.photoCountBadge}>
              <Text style={styles.photoCountText}>{walkPhotos.length}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.divider} />

      <Text style={styles.fieldLabel}>排尿排便</Text>
      <Text style={styles.subLabel}>排尿</Text>
      <InlineOption options={PEE_OPTIONS} value={data.pee} onChange={(v) => update('pee', v)} />

      <Text style={[styles.subLabel, { marginTop: spacing.md }]}>排便</Text>
      <InlineOption options={PEE_OPTIONS} value={data.poop} onChange={(v) => update('poop', v)} />

      <Text style={[styles.subLabel, { marginTop: spacing.md }]}>粪便形态</Text>
      <CompactBristol value={data.bristol} onChange={(v) => update('bristol', v)} disabled={poopDisabled} />

      <View style={styles.divider} />

      <Text style={styles.fieldLabel}>精神状态</Text>
      <EmojiSelector value={data.mood} onChange={(v) => update('mood', v)} />

      <View style={styles.divider} />

      <Text style={styles.fieldLabel}>异常行为（选填）</Text>
      <View style={styles.chipGrid}>
        {BEHAVIOR_OPTIONS.map(b => (
          <Chip key={b} active={data.behaviors?.includes(b)} onPress={() => toggleBehavior(b)}>
            {b}
          </Chip>
        ))}
      </View>

      <View style={styles.divider} />

      <Text style={styles.fieldLabel}>备注（选填）</Text>
      <TextInput
        style={styles.noteInput}
        placeholder="添加备注"
        placeholderTextColor="#A0B3A2"
        value={data.notes}
        onChangeText={(t) => update('notes', t)}
        multiline
        numberOfLines={2}
        textAlignVertical="top"
        returnKeyType="done"
        blurOnSubmit
        onSubmitEditing={() => Keyboard.dismiss()}
      />
    </View>
  );
}

export default function WalkCheckinScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { saveCheckin, finishWalk, dogs: currentDogs, currentWalk } = useWalk();
  const dogs = currentDogs?.length ? currentDogs : [{ id: '1', name: '旺财' }];
  const walkPhotos = currentWalk?.photos || [];

  const [records, setRecords] = useState(() => {
    const init = {};
    dogs.forEach(dog => {
      init[dog.id] = { pee: null, poop: null, bristol: null, mood: null, behaviors: [], notes: '' };
    });
    return init;
  });
  const [photoPreviewVisible, setPhotoPreviewVisible] = useState(false);

  const updateDog = (dogId, data) => {
    setRecords(prev => ({ ...prev, [dogId]: data }));
  };

  const anyHasData = Object.values(records).some(d =>
    d.pee !== null || d.poop !== null || d.mood !== null || d.behaviors?.length > 0
  );

  const handleSave = () => {
    Keyboard.dismiss();
    Object.entries(records).forEach(([dogId, data]) => {
      saveCheckin(dogId, data);
    });
    finishWalk();
    navigation.replace('WalkResult');
  };

  const handleSkip = () => {
    Keyboard.dismiss();
    finishWalk();
    navigation.replace('WalkResult');
  };

  return (
    <View style={styles.screen}>
      <NavBar title="记录狗狗状态" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => Keyboard.dismiss()}
        >
          {dogs.map((dog, i) => (
            <DogCheckinCard
              key={dog.id}
              dog={dog}
              data={records[dog.id]}
              onChange={(data) => updateDog(dog.id, data)}
              walkPhotos={walkPhotos}
              onPhotoPreview={() => setPhotoPreviewVisible(true)}
            />
          ))}

          <View style={styles.btnRow}>
            <Button variant="secondary" onPress={handleSkip} style={styles.skipBtn}>
              跳过
            </Button>
            <Button
              variant="primary"
              onPress={handleSave}
              disabled={!anyHasData}
              style={[styles.saveBtn, !anyHasData && { opacity: 0.4 }]}
            >
              保存并查看结果
            </Button>
          </View>

          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={photoPreviewVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPhotoPreviewVisible(false)}
        >
          <View style={styles.modalContent}>
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {walkPhotos.map((p, i) => (
                <View key={p.id || i} style={styles.modalPhoto}>
                  <Ionicons name="image-outline" size={48} color={colors.textLight} />
                  <Text style={styles.modalPhotoTime}>{p.time}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scrollContent: { padding: spacing.screenMargin },
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  dogHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  dogInfo: { flex: 1 },
  dogName: { ...typography.h3, fontSize: 16, color: colors.secondary },
  photoPreviewBtn: {
    width: 36, height: 36, borderRadius: spacing.radiusMd,
    backgroundColor: colors.bgLight, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.border,
  },
  photoCountBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.white,
  },
  photoCountText: { fontSize: 8, fontWeight: '800', color: colors.secondary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  fieldLabel: { ...typography.bodyBold, color: colors.secondary, marginBottom: spacing.sm },
  subLabel: { ...typography.captionBold, color: colors.textLight, marginBottom: spacing.xs },
  optionRow: { flexDirection: 'row', gap: spacing.sm },
  optionBtn: {
    flex: 1, paddingVertical: spacing.sm + 2,
    borderRadius: spacing.radiusMd,
    backgroundColor: colors.bgLight,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center',
  },
  optionBtnActive: { backgroundColor: colors.chipActive, borderColor: colors.secondary },
  optionText: { ...typography.captionBold, color: colors.textLight },
  optionTextActive: { color: colors.secondary },
  bristolRow: {
    flexDirection: 'row', gap: 4,
  },
  bristolItem: {
    flex: 1, paddingVertical: 6, borderRadius: spacing.radiusSm,
    backgroundColor: colors.bgLight, borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center',
  },
  bristolItemActive: { backgroundColor: colors.chipActive, borderColor: colors.secondary },
  bristolItemDisabled: { opacity: 0.4 },
  bristolEmoji: { fontSize: 16 },
  bristolLevel: { ...typography.caption, fontSize: 9, fontWeight: '700', color: colors.textLight, marginTop: 2 },
  bristolLevelActive: { color: colors.secondary },
  bristolTextDisabled: { opacity: 0.4 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  noteInput: {
    width: '100%',
    backgroundColor: colors.bgLight,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    fontSize: 14,
    color: colors.textMain,
    height: 64,
    textAlignVertical: 'top',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  btnRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  skipBtn: { flex: 1 },
  saveBtn: { flex: 2 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalContent: { width: '100%', maxHeight: '70%' },
  modalPhoto: {
    width: 300, height: 400, marginHorizontal: spacing.sm,
    borderRadius: spacing.radiusMd, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  modalPhotoTime: {
    position: 'absolute', bottom: spacing.md,
    ...typography.caption, color: colors.textLight,
  },
});
