import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, Button } from '../../components';
import { VISIT_OUTCOMES, VISIT_TAGS } from '../../data/exploreData';
import { useExplore } from '../../contexts/ExploreContext';

export default function UpdateInfoScreen({ route, navigation }) {
  const id = route?.params?.id;
  const { getLocation, addValidation } = useExplore();
  const location = getLocation(id);

  const [outcome, setOutcome] = useState(null);
  const [tags, setTags] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [note, setNote] = useState('');

  const toggleTag = (t) => setTags(arr => arr.includes(t) ? arr.filter(x => x !== t) : [...arr, t]);
  const addMockPhoto = () => setPhotos(p => [...p, Date.now() + Math.random()]);
  const removePhoto = (idx) => setPhotos(p => p.filter((_, i) => i !== idx));

  const canPublish = !!outcome;

  const publish = () => {
    const outcomeObj = VISIT_OUTCOMES.find(o => o.key === outcome);
    const validation = {
      id: `v_${Date.now()}`,
      userName: '我',
      userAvatar: '🙂',
      time: '刚刚',
      outcomeKey: outcome,
      outcomeLabel: outcomeObj?.label || '',
      dogSize: '小型犬',
      tags,
      note,
      photos: photos.length,
      helpfulCount: 0,
    };
    addValidation(id, validation);
    Alert.alert('感谢更新', '你的验证已经发布到这个地点。', [
      { text: '好', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <View style={styles.screen}>
      <NavBar
        title="我去过，更新信息"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {location && (
          <View style={styles.locationCard}>
            <Text style={styles.locName}>{location.name}</Text>
            <Text style={styles.locType}>{location.categoryLabel} · {location.district}</Text>
          </View>
        )}

        <View style={styles.tipCard}>
          <Ionicons name="heart" size={18} color={colors.secondary} />
          <Text style={styles.tipText}>
            你的验证会帮助其他狗主人判断是否适合前往，请基于真实经历填写。
          </Text>
        </View>

        <Text style={styles.label}>你带狗去的情况是？ <Text style={styles.req}>*</Text></Text>
        <View style={styles.optionGrid}>
          {VISIT_OUTCOMES.map(opt => {
            const active = outcome === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setOutcome(opt.key)}
                style={[styles.optionCard, active && styles.optionCardActive]}
              >
                {active && (
                  <Ionicons name="checkmark-circle" size={14} color={colors.secondary} style={{ marginRight: 6 }} />
                )}
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>其他补充</Text>
        <Text style={styles.hint}>可多选，选填</Text>
        <View style={styles.optionGrid}>
          {VISIT_TAGS.map(t => {
            const active = tags.includes(t);
            return (
              <TouchableOpacity
                key={t}
                onPress={() => toggleTag(t)}
                style={[styles.optionCard, active && styles.optionCardActive]}
              >
                {active && (
                  <Ionicons name="checkmark-circle" size={14} color={colors.secondary} style={{ marginRight: 6 }} />
                )}
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>上传照片</Text>
        <Text style={styles.hint}>选填</Text>
        <View style={styles.photoRow}>
          {photos.map((p, idx) => (
            <View key={p} style={styles.photoBox}>
              <Ionicons name="image" size={32} color={colors.secondary} style={{ opacity: 0.5 }} />
              <TouchableOpacity
                style={styles.removePhoto}
                onPress={() => removePhoto(idx)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={[styles.photoBox, styles.addBox]} onPress={addMockPhoto}>
            <Ionicons name="add" size={28} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>补充说明</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={note}
          onChangeText={setNote}
          placeholder="补充一下你的真实体验，帮助其他狗主人判断～"
          placeholderTextColor={colors.textLight}
          multiline
        />
      </ScrollView>

      <View style={styles.bottomAction}>
        <Button fullWidth disabled={!canPublish} onPress={publish}>
          发布验证
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 120 },
  locationCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    marginBottom: 12,
  },
  locName: { ...typography.h3, color: colors.secondary, marginBottom: 4 },
  locType: { ...typography.caption, color: colors.textLight },
  tipCard: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.tipBlue,
    padding: 12,
    borderRadius: spacing.radiusMd,
    marginBottom: 16,
  },
  tipText: { ...typography.caption, color: colors.textMain, flex: 1, lineHeight: 18 },
  label: { ...typography.bodyBold, color: colors.textMain, marginTop: 12, marginBottom: 4 },
  req: { color: colors.danger },
  hint: { ...typography.caption, color: colors.textLight, marginBottom: 8 },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusPill,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  optionCardActive: {
    borderColor: colors.secondary,
    backgroundColor: colors.primary,
  },
  optionText: { ...typography.bodyBold, color: colors.textMain },
  optionTextActive: { color: colors.secondary },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  photoBox: {
    width: 88,
    height: 88,
    borderRadius: spacing.radiusMd,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  addBox: { borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed' },
  removePhoto: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.white,
    color: colors.textMain,
    borderRadius: spacing.radiusMd,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textarea: { minHeight: 96, textAlignVertical: 'top' },
  bottomAction: {
    padding: spacing.md,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
