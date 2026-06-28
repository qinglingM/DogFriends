import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, StyleSheet, Keyboard, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, Button, Chip, DogAvatar, EmojiSelector } from '../../components';
import { useWalk } from '../../contexts/WalkContext';
import { useDogs } from '../../contexts/DogContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 12;

const PEE_OPTIONS = [
  { value: 'none', label: '无' },
  { value: 'less', label: '偏少' },
  { value: 'much', label: '偏多' },
  { value: 'normal', label: '正常' },
];

const BRISTOL = [
  { level: 'B1', emoji: '🫘', desc: '硬粒' },
  { level: 'B2', emoji: '🌰', desc: '硬条' },
  { level: 'B3', emoji: '🥖', desc: '偏硬' },
  { level: 'B4', emoji: '🍫', desc: '正常' },
  { level: 'B5', emoji: '🍦', desc: '偏软' },
  { level: 'B6', emoji: '💧', desc: '糊便' },
  { level: 'B7', emoji: '🌊', desc: '水便' },
];

const BEHAVIOR_OPTIONS = [
  '呕吐反胃', '咳嗽喷嚏', '跛行异常', '拒走趴地',
  '异常喘息', '捡食异物', '频繁吃草', '舔脚挠痒',
  '异常吠叫', '扑人扑狗', '攻击倾向', '受惊躲避',
];

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
            <Text style={[styles.bristolDesc, disabled && styles.bristolTextDisabled]}>{b.desc}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function DogCheckinCard({ dog, data, onChange, sortedBehaviors }) {
  const update = (field, value) => onChange({ ...data, [field]: value });
  const poopDisabled = !data.poop || data.poop === 'none';
  const behaviorCount = data.behaviors?.length || 0;

  const toggleBehavior = (b) => {
    const list = data.behaviors || [];
    update('behaviors', list.includes(b) ? list.filter(x => x !== b) : [...list, b]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.dogHeader}>
        <DogAvatar size={36} image={dog.image} />
        <View style={styles.dogInfo}>
          <Text style={styles.dogName}>{dog.name}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.fieldLabel}>精神状态</Text>
      <EmojiSelector value={data.mood} onChange={(v) => update('mood', v)} />

      <View style={styles.divider} />

      <Text style={styles.fieldLabel}>排尿</Text>
      <InlineOption options={PEE_OPTIONS} value={data.pee} onChange={(v) => update('pee', v)} />

      <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>排便</Text>
      <InlineOption options={PEE_OPTIONS} value={data.poop} onChange={(v) => update('poop', v)} />

      <Text style={[styles.subLabel, { marginTop: spacing.md }]}>粪便形态</Text>
      <CompactBristol value={data.bristol} onChange={(v) => update('bristol', v)} disabled={poopDisabled} />

      <View style={styles.divider} />

      <View style={styles.behaviorHeader}>
        <Text style={styles.fieldLabel}>异常行为</Text>
        {behaviorCount > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{behaviorCount}</Text>
          </View>
        )}
      </View>
      <View style={styles.chipGrid}>
        {sortedBehaviors.map(b => (
          <Chip key={b} active={data.behaviors?.includes(b)} onPress={() => toggleBehavior(b)}>
            {b}
          </Chip>
        ))}
      </View>
    </View>
  );
}

const BEHAVIOR_STORAGE_KEY = '@dogfriends_behavior_history';

export default function WalkCheckinScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { saveCheckin, finishWalk, currentWalk } = useWalk();
  const { dogs: allDogs, updateDog } = useDogs();
  const dogs = currentWalk?.dogs?.length ? currentWalk.dogs : [{ id: '1', name: '旺财' }];

  const [behaviorHistory, setBehaviorHistory] = useState({});
  const [records, setRecords] = useState(() => {
    const init = {};
    dogs.forEach(dog => {
      init[dog.id] = { pee: null, poop: null, bristol: null, mood: null, behaviors: [] };
    });
    return init;
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem(BEHAVIOR_STORAGE_KEY).then(data => {
      if (data) setBehaviorHistory(JSON.parse(data));
    });
  }, []);

  const sortedBehaviors = useMemo(() => {
    return [...BEHAVIOR_OPTIONS].sort((a, b) => {
      const countA = behaviorHistory[a] || 0;
      const countB = behaviorHistory[b] || 0;
      return countB - countA;
    });
  }, [behaviorHistory]);

  const cardWidth = SCREEN_WIDTH * 0.92;
  const sidePadding = (SCREEN_WIDTH - cardWidth) / 2;

  const updateRecord = (dogId, data) => {
    setRecords(prev => ({ ...prev, [dogId]: data }));
  };

  const isFilled = (data) => data.pee !== null || data.poop !== null || data.mood !== null || data.behaviors?.length > 0;
  const dataCount = Object.values(records).filter(isFilled).length;

  const saveBehaviorHistory = (behaviors) => {
    if (!behaviors || behaviors.length === 0) return;
    const updated = { ...behaviorHistory };
    behaviors.forEach(b => {
      updated[b] = (updated[b] || 0) + 1;
    });
    setBehaviorHistory(updated);
    AsyncStorage.setItem(BEHAVIOR_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSave = () => {
    Keyboard.dismiss();

    const checkins = {};
    Object.entries(records).forEach(([dogId, data]) => {
      checkins[dogId] = data;
      saveBehaviorHistory(data.behaviors);
    });

    // 直接构建完整 checkins 传给 finishWalk，避免 React 批处理导致 state 未及时更新
    const lastDog = dogs[dogs.length - 1];
    const fullDog = allDogs.find(d => d.id === lastDog.id);
    if (fullDog) {
      updateDog({
        ...fullDog,
        walkStats: {
          walks: (fullDog.walkStats?.walks || 0) + 1,
          distance: (fullDog.walkStats?.distance || 0) + (currentWalk?.distance || 0),
          duration: (fullDog.walkStats?.duration || 0) + (currentWalk?.duration || 0),
        },
      });
    }
    finishWalk(checkins);
    navigation.replace('WalkResult');
  };

  const handleSkip = () => {
    Keyboard.dismiss();
    const checkins = {};
    Object.entries(records).forEach(([dogId, data]) => {
      checkins[dogId] = data;
      saveBehaviorHistory(data.behaviors);
    });
    finishWalk(checkins);
    navigation.replace('WalkResult');
  };


  const handleNext = () => {
    Keyboard.dismiss();
    const dogId = dogs[currentIndex].id;
    saveCheckin(dogId, records[dogId]);
    saveBehaviorHistory(records[dogId].behaviors);
    const dog = dogs[currentIndex];
    const fullDog = allDogs.find(d => d.id === dog.id);
    if (fullDog) {
      updateDog({
        ...fullDog,
        walkStats: {
          walks: (fullDog.walkStats?.walks || 0) + 1,
          distance: (fullDog.walkStats?.distance || 0) + (currentWalk?.distance || 0),
          duration: (fullDog.walkStats?.duration || 0) + (currentWalk?.duration || 0),
        },
      });
    }
    const nextIndex = currentIndex + 1;
    scrollRef.current?.scrollTo({ x: nextIndex * (cardWidth + CARD_GAP), animated: true });
    setCurrentIndex(nextIndex);
  };

  const onScroll = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / (cardWidth + CARD_GAP));
    setCurrentIndex(Math.min(Math.max(index, 0), dogs.length - 1));
  };

  return (
    <View style={styles.screen}>
      <NavBar title="记录狗狗状态" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={44}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.horizontalScroll, { paddingLeft: sidePadding, paddingRight: sidePadding }]}
          snapToInterval={cardWidth + CARD_GAP}
          decelerationRate="fast"
          onMomentumScrollEnd={onScroll}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => Keyboard.dismiss()}
        >
          {dogs.map((dog) => (
            <View key={dog.id} style={[styles.cardPage, { width: cardWidth }]}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
                contentContainerStyle={styles.cardScrollContent}
              >
                <DogCheckinCard
                  dog={dog}
                  data={records[dog.id]}
                  onChange={(data) => updateRecord(dog.id, data)}
                  sortedBehaviors={sortedBehaviors}
                />
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>

      {dogs.length > 1 && (
        <View style={[styles.dotsBar, { bottom: insets.bottom + 36 }]}>
          {dogs.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
          ))}
        </View>
      )}

      <View style={[styles.buttonRow, { bottom: insets.bottom - 16 }]}>
        {(() => {
          const isSingle = dogs.length === 1;
          const isLast = currentIndex === dogs.length - 1;
          let variant, text, onPressFn;
          if (isSingle || isLast) {
            if (dataCount === dogs.length) {
              variant = 'primary'; text = '保存记录'; onPressFn = handleSave;
            } else {
              variant = 'secondary'; text = isSingle ? '跳过记录' : `跳过记录 ${dataCount}/${dogs.length}`; onPressFn = handleSkip;
            }
          } else {
            variant = 'secondary'; text = '下一只'; onPressFn = handleNext;
          }
          return (
            <Button variant={variant} onPress={onPressFn} size="sm" style={styles.capsule}>
              {text}
            </Button>
          );
        })()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  horizontalScroll: {
    alignItems: 'stretch',
  },
  cardPage: {
    marginRight: CARD_GAP,
  },
  cardScrollContent: {
    paddingVertical: spacing.sm,
    paddingBottom: 8,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  dogHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dogInfo: { flex: 1 },
  dogName: { ...typography.h3, fontSize: 15, color: colors.secondary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  fieldLabel: { ...typography.captionBold, color: colors.secondary, marginBottom: spacing.xs },
  subLabel: { ...typography.captionBold, color: colors.textLight, marginBottom: spacing.xs },
  optionRow: { flexDirection: 'row', gap: spacing.xs },
  optionBtn: {
    flex: 1, paddingVertical: spacing.xs + 1,
    borderRadius: spacing.radiusMd,
    backgroundColor: colors.bgLight,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center',
  },
  optionBtnActive: { backgroundColor: colors.chipActive, borderColor: colors.secondary },
  optionText: { ...typography.caption, fontSize: 12, color: colors.textLight },
  optionTextActive: { color: colors.secondary },
  bristolRow: { flexDirection: 'row', gap: 3 },
  bristolItem: {
    flex: 1, paddingVertical: 4, borderRadius: spacing.radiusSm,
    backgroundColor: colors.bgLight, borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center',
  },
  bristolItemActive: { backgroundColor: colors.chipActive, borderColor: colors.secondary },
  bristolItemDisabled: { opacity: 0.4 },
  bristolEmoji: { fontSize: 14 },
  bristolLevel: { ...typography.caption, fontSize: 8, fontWeight: '700', color: colors.textLight, marginTop: 1 },
  bristolLevelActive: { color: colors.secondary },
  bristolDesc: { fontSize: 8, color: colors.textLight },
  bristolTextDisabled: { opacity: 0.4 },
  behaviorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  countBadge: {
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: { ...typography.caption, fontSize: 11, fontWeight: '700', color: colors.white },
  dotsBar: {
    position: 'absolute',
    left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary, width: 16,
  },
  buttonRow: {
    position: 'absolute',
    left: 24, right: 24,
  },
  capsule: {
    borderRadius: 20,
  },
});
