import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Animated } from 'react-native';
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
  { level: 'B1', desc: '干硬颗粒', emoji: '😐', tone: 'warn' },
  { level: 'B2', desc: '干硬成块', emoji: '🙂', tone: 'warn' },
  { level: 'B3', desc: '正常偏硬', emoji: '😊', tone: 'normal' },
  { level: 'B4', desc: '理想便便', emoji: '😄', tone: 'normal' },
  { level: 'B5', desc: '偏软成型', emoji: '😐', tone: 'normal' },
  { level: 'B6', desc: '软糊不成形', emoji: '😟', tone: 'danger' },
  { level: 'B7', desc: '水样拉稀', emoji: '😣', tone: 'danger' },
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

function DogCheckinCard({ dog, data, onChange }) {
  const update = (field, value) => onChange({ ...data, [field]: value });
  const poopActive = data.poop && data.poop !== 'none';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <DogAvatar size={48} />
        <Text style={styles.cardDogName}>{dog.name}</Text>
      </View>

      <View style={styles.fieldSection}>
        <Text style={styles.sectionLabel}>排尿</Text>
        <View style={styles.optionRow}>
          {['none', 'normal', 'more'].map(v => (
            <TouchableOpacity
              key={v}
              style={[styles.optionBtn, data.pee === v && styles.optionBtnActive]}
              onPress={() => update('pee', v)}
            >
              <Text style={[styles.optionText, data.pee === v && styles.optionTextActive]}>
                {v === 'none' ? '没有' : v === 'normal' ? '正常' : '偏多'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.fieldSection}>
        <Text style={styles.sectionLabel}>排便</Text>
        <View style={styles.optionRow}>
          {['none', 'normal', 'more'].map(v => (
            <TouchableOpacity
              key={v}
              style={[styles.optionBtn, data.poop === v && styles.optionBtnActive]}
              onPress={() => update('poop', v)}
            >
              <Text style={[styles.optionText, data.poop === v && styles.optionTextActive]}>
                {v === 'none' ? '没有' : v === 'normal' ? '正常' : '偏多'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.fieldSection}>
        <Text style={styles.sectionLabel}>便便形态</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bristolRow}
        >
          {BRISTOL_LEVELS.map(item => {
            const isActive = data.bristol === item.level;
            const isDisabled = !poopActive;
            return (
              <TouchableOpacity
                key={item.level}
                style={[
                  styles.bristolCard,
                  isActive && styles.bristolCardActive,
                  isDisabled && styles.bristolCardDisabled,
                  !isActive && !isDisabled && item.tone === 'warn' && styles.bristolCardWarn,
                  !isActive && !isDisabled && item.tone === 'danger' && styles.bristolCardDanger,
                ]}
                onPress={() => !isDisabled && update('bristol', item.level)}
                activeOpacity={isDisabled ? 1 : 0.7}
              >
                <Text style={[styles.bristolEmoji, isDisabled && styles.bristolEmojiDisabled]}>
                  {item.emoji}
                </Text>
                <Text style={[styles.bristolLevel, isDisabled && styles.bristolLevelDisabled]}>
                  {item.level}
                </Text>
                <Text style={[styles.bristolDesc, isDisabled && styles.bristolDescDisabled]}>
                  {item.desc}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.fieldSection}>
        <Text style={styles.sectionLabel}>精神状态</Text>
        <View style={styles.moodRow}>
          {MOODS.map(m => (
            <TouchableOpacity
              key={m.value}
              style={[styles.moodBtn, data.mood === m.value && styles.moodBtnActive]}
              onPress={() => update('mood', m.value)}
            >
              <Text style={styles.moodEmoji}>{m.emoji}</Text>
              <Text style={[styles.moodLabel, data.mood === m.value && styles.moodLabelActive]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.fieldSection}>
        <TouchableOpacity
          style={styles.abnormalToggle}
          onPress={() => update('showAbnormal', !data.showAbnormal)}
        >
          <Text style={styles.sectionLabel}>异常行为</Text>
          <Ionicons
            name={data.showAbnormal ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.textLight}
          />
        </TouchableOpacity>
        {data.showAbnormal && (
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
                <Text style={[styles.chipText, data.abnormal?.includes(opt) && styles.chipTextActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {data.showAbnormal && data.abnormal?.length > 0 && (
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

      <View style={styles.fieldSection}>
        {data.showNote ? (
          <TextInput
            style={styles.noteInput}
            placeholder={`记录${dog.name}的特殊情况...`}
            placeholderTextColor="#A0B3A2"
            multiline
            value={data.note}
            onChangeText={(v) => update('note', v)}
          />
        ) : (
          <TouchableOpacity onPress={() => update('showNote', true)}>
            <Text style={styles.addNoteText}>+ 添加备注</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function WalkCheckinScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const [dogData, setDogData] = useState({
    '1': { pee: null, poop: null, bristol: null, mood: null, abnormal: [], note: '', showAbnormal: false, showNote: false },
    '2': { pee: null, poop: null, bristol: null, mood: null, abnormal: [], note: '', showAbnormal: false, showNote: false },
  });

  const updateDog = (id, data) => setDogData(prev => ({ ...prev, [id]: data }));
  const isLastDog = currentIndex === MOCK_DOGS.length - 1;
  const isSingleDog = MOCK_DOGS.length === 1;

  const handleNext = () => {
    if (!isLastDog) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({ x: nextIndex * spacing.screenMargin * 2 + 300, animated: true });
    }
  };

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

      <View style={styles.cardArea}>
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {MOCK_DOGS.map((dog, index) => (
            <View key={dog.id} style={styles.cardPage}>
              <DogCheckinCard
                dog={dog}
                data={dogData[dog.id]}
                onChange={(data) => updateDog(dog.id, data)}
              />
            </View>
          ))}
        </Animated.ScrollView>

        {MOCK_DOGS.length > 1 && (
          <View style={styles.pagination}>
            {MOCK_DOGS.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === currentIndex && styles.dotActive]}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.bottomBar}>
        {!isSingleDog && !isLastDog ? (
          <Button fullWidth onPress={handleNext}>
            下一只狗 →
          </Button>
        ) : (
          <Button fullWidth onPress={handleSave}>
            保存并查看结果
          </Button>
        )}
      </View>
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
  cardArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrollContent: {
    paddingHorizontal: spacing.screenMargin,
  },
  cardPage: {
    width: 300,
    marginRight: spacing.screenMargin,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    gap: 16,
  },
  cardHeader: {
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cardDogName: { ...typography.h3, fontSize: 16, color: colors.secondary },
  fieldSection: { gap: 8 },
  sectionLabel: { ...typography.captionBold, color: colors.secondary },
  optionRow: { flexDirection: 'row', gap: 8 },
  optionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: spacing.radiusSm,
    backgroundColor: colors.bg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  optionBtnActive: {
    backgroundColor: 'rgba(185, 207, 50, 0.15)',
    borderColor: colors.primary,
  },
  optionText: { ...typography.captionBold, fontSize: 13, color: colors.textMain },
  optionTextActive: { color: colors.secondary },
  bristolRow: { gap: 6, paddingVertical: 4 },
  bristolCard: {
    width: 80,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: spacing.radiusSm,
    backgroundColor: colors.bg,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  bristolCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(185, 207, 50, 0.1)',
  },
  bristolCardDisabled: {
    opacity: 0.4,
  },
  bristolCardWarn: {
    borderColor: 'rgba(146, 102, 153, 0.3)',
  },
  bristolCardDanger: {
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  bristolEmoji: { fontSize: 24 },
  bristolEmojiDisabled: { opacity: 0.5 },
  bristolLevel: { ...typography.captionBold, fontSize: 10, color: colors.secondary },
  bristolLevelDisabled: { color: colors.textLight },
  bristolDesc: { fontSize: 9, color: colors.textLight, textAlign: 'center' },
  bristolDescDisabled: { opacity: 0.5 },
  moodRow: { flexDirection: 'row', gap: 6 },
  moodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: spacing.radiusSm,
    alignItems: 'center',
  },
  moodBtnActive: { backgroundColor: 'rgba(185, 207, 50, 0.15)' },
  moodEmoji: { fontSize: 24 },
  moodLabel: { fontSize: 10, fontWeight: '600', color: colors.textLight, marginTop: 2 },
  moodLabelActive: { color: colors.secondary },
  abnormalToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
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
    width: 44,
    height: 44,
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
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },
  bottomBar: {
    paddingHorizontal: spacing.screenMargin,
    paddingBottom: 32,
    paddingTop: 8,
  },
});
