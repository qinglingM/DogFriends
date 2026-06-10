import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Button, DogAvatar } from '../../components';

const ABNORMAL_OPTIONS = [
  '跛行', '过度喘气', '不愿走', '异常嗅探', '频繁挠痒', '呕吐迹象',
  '吠叫不止', '打架/攻击', '过度兴奋', '捡食异物', '拉拽严重', '其他',
];

const BRISTOL_LEVELS = [
  { level: 'B1', emoji: '😐' },
  { level: 'B2', emoji: '🙂' },
  { level: 'B3', emoji: '😊' },
  { level: 'B4', emoji: '😄' },
  { level: 'B5', emoji: '😐' },
  { level: 'B6', emoji: '😟' },
  { level: 'B7', emoji: '😣' },
];

const MOODS = [
  { value: 'energetic', emoji: '😄', label: '活力' },
  { value: 'happy', emoji: '🙂', label: '不错' },
  { value: 'calm', emoji: '😐', label: '平静' },
  { value: 'tired', emoji: '😴', label: '疲惫' },
  { value: 'unwell', emoji: '🤒', label: '不舒服' },
];

const MOCK_DOGS = [
  { id: '1', name: '旺财' },
  { id: '2', name: '小白' },
];

function DogCheckinBlock({ dog, data, onChange }) {
  const update = (field, value) => onChange({ ...data, [field]: value });

  return (
    <View style={styles.dogBlock}>
      <View style={styles.dogBlockHeader}>
        <DogAvatar size={32} />
        <Text style={styles.dogBlockName}>{dog.name}</Text>
      </View>

      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>💧 排尿</Text>
        <View style={styles.numRow}>
          {[0, 1, 2, '3+'].map(v => (
            <TouchableOpacity
              key={v}
              style={[styles.numBtn, data.pee === v && styles.numBtnActive]}
              onPress={() => update('pee', v)}
            >
              <Text style={[styles.numText, data.pee === v && styles.numTextActive]}>{v}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>💩 排便</Text>
        <View style={styles.numRow}>
          {[0, 1, 2, '3+'].map(v => (
            <TouchableOpacity
              key={v}
              style={[styles.numBtn, data.poop === v && styles.numBtnActive]}
              onPress={() => update('poop', v)}
            >
              <Text style={[styles.numText, data.poop === v && styles.numTextActive]}>{v}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {data.poop !== 0 && (
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>便便</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiRow}>
            {BRISTOL_LEVELS.map(b => (
              <TouchableOpacity
                key={b.level}
                style={[styles.emojiBtn, data.bristol === b.level && styles.emojiBtnActive]}
                onPress={() => update('bristol', b.level)}
              >
                <Text style={styles.emoji}>{b.emoji}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>精神</Text>
        <View style={styles.emojiRow}>
          {MOODS.map(m => (
            <TouchableOpacity
              key={m.value}
              style={[styles.emojiBtn, data.mood === m.value && styles.emojiBtnActive]}
              onPress={() => update('mood', m.value)}
            >
              <Text style={styles.emoji}>{m.emoji}</Text>
              <Text style={[styles.emojiLabel, data.mood === m.value && styles.emojiLabelActive]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.fieldCol}>
        <Text style={styles.fieldLabel}>异常行为</Text>
        <View style={styles.chipWrap}>
          {ABNORMAL_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, data.abnormal?.includes(opt) && styles.chipActive]}
              onPress={() => {
                const list = data.abnormal || [];
                const newList = list.includes(opt) ? list.filter(x => x !== opt) : [...list, opt];
                update('abnormal', newList);
              }}
            >
              <Text style={[styles.chipText, data.abnormal?.includes(opt) && styles.chipTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {data.abnormal?.length > 0 && (
          <View style={styles.mediaRow}>
            <TouchableOpacity style={styles.mediaThumb}>
              <Ionicons name="image-outline" size={16} color={colors.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaThumb}>
              <Ionicons name="videocam-outline" size={16} color={colors.secondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {data.showNote ? (
        <View style={styles.fieldCol}>
          <TextInput
            style={styles.noteInput}
            placeholder={`记录${dog.name}的特殊情况...`}
            placeholderTextColor="#A0B3A2"
            multiline
            value={data.note}
            onChangeText={(v) => update('note', v)}
          />
        </View>
      ) : (
        <TouchableOpacity onPress={() => update('showNote', true)}>
          <Text style={styles.addNoteText}>+ 添加备注</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function WalkCheckinScreen({ navigation }) {
  const [dogData, setDogData] = useState({
    '1': { pee: 1, poop: 2, bristol: 'B4', mood: 'energetic', abnormal: [], note: '', showNote: false },
    '2': { pee: 1, poop: 0, bristol: null, mood: 'happy', abnormal: [], note: '', showNote: false },
  });

  const updateDog = (id, data) => setDogData(prev => ({ ...prev, [id]: data }));

  const handleSave = () => {
    navigation.replace('WalkResult');
  };

  const handleSkip = () => {
    navigation.replace('WalkResult');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerPlaceholder} />
        <Text style={styles.headerTitle}>记录狗狗状态</Text>
        <TouchableOpacity onPress={handleSkip} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.skipText}>跳过</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {MOCK_DOGS.map(dog => (
          <DogCheckinBlock
            key={dog.id}
            dog={dog}
            data={dogData[dog.id]}
            onChange={(data) => updateDog(dog.id, data)}
          />
        ))}

        <Button fullWidth onPress={handleSave} style={{ marginTop: 8 }}>
          保存并查看结果
        </Button>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerPlaceholder: { width: 60 },
  headerTitle: { ...typography.bodyBold, fontSize: 16, color: colors.secondary },
  skipText: { ...typography.bodyBold, fontSize: 14, color: colors.textLight },
  content: { padding: spacing.screenMargin },
  dogBlock: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    marginBottom: 16,
    gap: 12,
  },
  dogBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dogBlockName: { ...typography.bodyBold, fontSize: 15, color: colors.secondary },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fieldCol: { gap: 8 },
  fieldLabel: { ...typography.captionBold, color: colors.secondary, width: 48 },
  numRow: { flexDirection: 'row', gap: 6, flex: 1 },
  numBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: spacing.radiusSm,
    backgroundColor: colors.bg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  numBtnActive: {
    backgroundColor: 'rgba(185, 207, 50, 0.15)',
    borderColor: colors.primary,
  },
  numText: { ...typography.bodyBold, fontSize: 13, color: colors.textMain },
  numTextActive: { color: colors.secondary },
  emojiRow: { flexDirection: 'row', gap: 6, flex: 1 },
  emojiBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: spacing.radiusSm,
    alignItems: 'center',
    minWidth: 36,
  },
  emojiBtnActive: { backgroundColor: 'rgba(185, 207, 50, 0.15)' },
  emoji: { fontSize: 22 },
  emojiLabel: { fontSize: 9, fontWeight: '600', color: colors.textLight, marginTop: 1 },
  emojiLabelActive: { color: colors.secondary },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.chipDefault,
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { ...typography.caption, color: colors.textMain },
  chipTextActive: { color: colors.secondary, fontWeight: '700' },
  mediaRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  mediaThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addNoteText: { ...typography.caption, color: colors.textLight },
  noteInput: {
    width: '100%',
    backgroundColor: colors.bg,
    borderRadius: spacing.radiusSm,
    padding: 10,
    fontSize: 13,
    color: colors.textMain,
    height: 60,
    textAlignVertical: 'top',
  },
});
