import React from 'react';
import { ScrollView, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const BRISTOL_LEVELS = [
  { level: 'B1', desc: '干硬小颗粒', emoji: '😐', hint: '可能饮水不足', tone: 'warn' },
  { level: 'B2', desc: '干硬成块', emoji: '🙂', hint: '注意补充水分', tone: 'warn' },
  { level: 'B3', desc: '正常偏硬', emoji: '😊', hint: '多喝水更好', tone: 'normal' },
  { level: 'B4', desc: '理想便便', emoji: '😄', hint: '✅ 状态很好', tone: 'normal' },
  { level: 'B5', desc: '偏软成型', emoji: '😐', hint: '注意观察', tone: 'normal' },
  { level: 'B6', desc: '软糊不成形', emoji: '😟', hint: '关注饮食', tone: 'danger' },
  { level: 'B7', desc: '水样拉稀', emoji: '😣', hint: '建议就医', tone: 'danger' },
];

export default function BristolScale({ value, onChange }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
      snapToAlignment="center"
      decelerationRate="fast"
    >
      {BRISTOL_LEVELS.map((item) => {
        const isActive = value === item.level;
        const isWarn = item.tone === 'warn';
        const isDanger = item.tone === 'danger';

        return (
          <TouchableOpacity
            key={item.level}
            onPress={() => onChange(item.level)}
            activeOpacity={0.7}
            style={[
              styles.card,
              isActive && styles.cardActive,
              !isActive && isWarn && styles.cardWarn,
              !isActive && isDanger && styles.cardDanger,
            ]}
          >
            <Text style={styles.icon}>💩</Text>
            <Text style={styles.level}>{item.level}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.hint}>{item.hint}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: 8,
    paddingVertical: 4,
  },
  card: {
    width: 104,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(185, 207, 50, 0.1)',
  },
  cardWarn: {
    borderColor: 'rgba(146, 102, 153, 0.3)',
  },
  cardDanger: {
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  icon: {
    fontSize: 32,
  },
  level: {
    ...typography.captionBold,
    color: colors.secondary,
  },
  desc: {
    fontSize: 10,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 14,
  },
  emoji: {
    fontSize: 20,
  },
  hint: {
    fontSize: 9,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 12,
  },
});
