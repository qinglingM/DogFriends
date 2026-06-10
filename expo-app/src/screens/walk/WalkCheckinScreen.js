import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, StyleSheet, Keyboard, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, Button, Chip, DogAvatar, NumberSelector, BristolScale, EmojiSelector } from '../../components';
import { useWalk } from '../../contexts/WalkContext';

const PEE_POOP_OPTIONS = [
  { value: 'none', label: '没有' },
  { value: 'normal', label: '正常' },
  { value: 'much', label: '偏多' },
];

const BEHAVIOR_OPTIONS = ['爆冲', '拖行', '对狗吠叫', '扑人', '捡食', '追车', '护食'];

export default function WalkCheckinScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { saveCheckin, finishWalk, dogs: currentDogs, currentWalk } = useWalk();
  const dogs = currentDogs?.length ? currentDogs : [{ id: '1', name: '旺财' }];
  const walkPhotos = currentWalk?.photos || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [records, setRecords] = useState({});
  const [showBehavior, setShowBehavior] = useState(false);
  const [photoPreviewVisible, setPhotoPreviewVisible] = useState(false);

  const currentDog = dogs[currentIndex];
  const currentId = currentDog?.id || '0';
  const current = records[currentId] || {
    pee: null, poop: null, bristol: null,
    mood: null, behaviors: [], notes: '',
  };

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
      <NavBar title="记录狗狗状态" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={() => Keyboard.dismiss()}
      >
        <View style={styles.dogHeader}>
          <DogAvatar size={44} />
          <View style={styles.dogInfo}>
            <Text style={styles.dogName}>{currentDog?.name || '未知'}</Text>
          </View>
          {walkPhotos.length > 0 && (
            <TouchableOpacity style={styles.photoPreviewBtn} onPress={() => setPhotoPreviewVisible(true)}>
              <Ionicons name="images-outline" size={20} color={colors.secondary} />
              <View style={styles.photoCountBadge}>
                <Text style={styles.photoCountText}>{walkPhotos.length}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.divider} />

        <Text style={styles.fieldLabel}>排尿排便</Text>

        <Text style={styles.subLabel}>排尿</Text>
        <NumberSelector
          value={current.pee}
          onChange={(v) => update('pee', v)}
          labels={PEE_POOP_OPTIONS}
        />

        <Text style={[styles.subLabel, { marginTop: spacing.md }]}>排便</Text>
        <NumberSelector
          value={current.poop}
          onChange={(v) => update('poop', v)}
          labels={PEE_POOP_OPTIONS}
        />

        {current.poop && current.poop !== 'none' && (
          <View style={styles.bristolSection}>
            <Text style={styles.subLabel}>粪便形态</Text>
            <BristolScale
              value={current.bristol}
              onChange={(v) => update('bristol', v)}
            />
          </View>
        )}

        <View style={styles.divider} />

        <Text style={styles.fieldLabel}>精神状态</Text>
        <EmojiSelector
          value={current.mood}
          onChange={(v) => update('mood', v)}
        />

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.collapseToggle}
          onPress={() => setShowBehavior(!showBehavior)}
        >
          <Text style={styles.collapseLabel}>异常行为（选填）</Text>
          <Ionicons
            name={showBehavior ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textLight}
          />
        </TouchableOpacity>

        {showBehavior && (
          <View style={styles.chipGrid}>
            {BEHAVIOR_OPTIONS.map(b => (
              <Chip
                key={b}
                active={current.behaviors?.includes(b)}
                onPress={() => toggleBehavior(b)}
              >
                {b}
              </Chip>
            ))}
          </View>
        )}

        <View style={styles.divider} />

        <Text style={styles.fieldLabel}>备注（选填）</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="添加备注"
          placeholderTextColor="#A0B3A2"
          value={current.notes}
          onChangeText={(t) => update('notes', t)}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
          returnKeyType="done"
          blurOnSubmit
          onSubmitEditing={() => Keyboard.dismiss()}
        />

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <Button variant="secondary" onPress={handleSkip} style={styles.skipBtn}>
          跳过
        </Button>
        <Button
          variant="primary"
          onPress={handleSave}
          disabled={!hasData}
          style={[styles.saveBtn, !hasData && { opacity: 0.4 }]}
        >
          {currentIndex < dogs.length - 1 ? '下一只' : '保存并查看结果'}
        </Button>
      </View>

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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { padding: spacing.screenMargin },
  dogHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.white, borderRadius: spacing.radiusMd,
    padding: spacing.md,
  },
  dogInfo: { flex: 1 },
  dogName: { ...typography.h3, fontSize: 16, color: colors.secondary },
  photoPreviewBtn: {
    width: 40, height: 40, borderRadius: spacing.radiusMd,
    backgroundColor: colors.bgLight, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.border,
  },
  photoCountBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.white,
  },
  photoCountText: { fontSize: 9, fontWeight: '800', color: colors.secondary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  fieldLabel: {
    ...typography.bodyBold, color: colors.secondary,
    marginBottom: spacing.sm,
  },
  subLabel: {
    ...typography.captionBold, color: colors.textLight,
    marginBottom: spacing.xs,
  },
  bristolSection: { marginTop: spacing.md },
  collapseToggle: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  collapseLabel: { ...typography.bodyBold, color: colors.secondary },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  noteInput: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    fontSize: 14,
    color: colors.textMain,
    height: 64,
    textAlignVertical: 'top',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: spacing.sm,
    paddingHorizontal: spacing.screenMargin,
    backgroundColor: colors.white,
    borderTopWidth: 1, borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
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
