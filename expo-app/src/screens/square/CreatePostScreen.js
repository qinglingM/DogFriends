import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, Card, Button } from '../../components';
import { SQUARE_TAGS } from '../../data/squareData';
import { useSquare } from '../../contexts/SquareContext';

const MOCK_IMAGE = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80';
const LOCATION_OPTIONS = ['上海 徐汇', '复兴公园', '世纪公园', '徐汇滨江'];
const VISIBILITY_OPTIONS = [
  { key: 'public', label: '公开', icon: 'earth' },
  { key: 'private', label: '仅自己可见', icon: 'lock-closed-outline' },
];

export default function CreatePostScreen({ navigation }) {
  const { addPost } = useSquare();
  const [text, setText] = useState('');
  const [tag, setTag] = useState(null);
  const [location, setLocation] = useState('上海 徐汇');
  const [visibility, setVisibility] = useState('public');
  const [openPicker, setOpenPicker] = useState(null);

  const publish = () => {
    const content = text.trim() || '分享今天的遛狗日常。';
    addPost({
      text: content,
      tag,
      location,
      visibility,
      mediaType: 'image',
      mediaUrl: MOCK_IMAGE,
    });
    navigation.navigate('SquareHome');
  };

  return (
    <View style={styles.screen}>
      <NavBar
        title="发帖"
        onBack={() => navigation.goBack()}
        rightIcon="checkmark"
        rightAction={publish}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <TextInput
            value={text}
            onChangeText={setText}
            multiline
            placeholder="分享你的遛狗日常..."
            placeholderTextColor={colors.textLight}
            style={styles.textInput}
          />
        </Card>

        <TouchableOpacity style={styles.mediaPicker} activeOpacity={0.75}>
          <View style={styles.mediaIconBox}>
            <Ionicons name="image-outline" size={22} color={colors.secondary} />
          </View>
          <View style={styles.mediaTextBlock}>
            <Text style={styles.mediaTitle}>选择图片或视频</Text>
            <Text style={styles.mediaHint}>从手机相册上传</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>标签（可选）</Text>
        <View style={styles.tagWrap}>
          {SQUARE_TAGS.map(item => (
            <TouchableOpacity
              key={item}
              style={[styles.tagOption, tag === item && styles.tagOptionActive]}
              onPress={() => setTag(tag === item ? null : item)}
            >
              <Text style={[styles.tagOptionText, tag === item && styles.tagOptionTextActive]}>#{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.pickerRow}>
          <TouchableOpacity
            style={[styles.pickerBox, openPicker === 'location' && styles.pickerBoxActive]}
            activeOpacity={0.75}
            onPress={() => setOpenPicker(openPicker === 'location' ? null : 'location')}
          >
            <Ionicons name="location" size={16} color={colors.secondary} />
            <Text style={styles.pickerText} numberOfLines={1}>{location}</Text>
            <Ionicons name={openPicker === 'location' ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pickerBox, openPicker === 'visibility' && styles.pickerBoxActive]}
            activeOpacity={0.75}
            onPress={() => setOpenPicker(openPicker === 'visibility' ? null : 'visibility')}
          >
            <Ionicons
              name={VISIBILITY_OPTIONS.find(item => item.key === visibility)?.icon || 'earth'}
              size={16}
              color={colors.secondary}
            />
            <Text style={styles.pickerText} numberOfLines={1}>
              {VISIBILITY_OPTIONS.find(item => item.key === visibility)?.label || '公开'}
            </Text>
            <Ionicons name={openPicker === 'visibility' ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {openPicker && (
          <Card noPadding style={styles.pickerMenu}>
            {(openPicker === 'location' ? LOCATION_OPTIONS : VISIBILITY_OPTIONS).map(option => {
              const key = openPicker === 'location' ? option : option.key;
              const label = openPicker === 'location' ? option : option.label;
              const icon = openPicker === 'location' ? 'location' : option.icon;
              const active = openPicker === 'location' ? location === key : visibility === key;

              return (
                <TouchableOpacity
                  key={key}
                  style={styles.pickerMenuItem}
                  activeOpacity={0.75}
                  onPress={() => {
                    if (openPicker === 'location') setLocation(key);
                    else setVisibility(key);
                    setOpenPicker(null);
                  }}
                >
                  <Ionicons name={icon} size={16} color={colors.secondary} />
                  <Text style={styles.pickerMenuText}>{label}</Text>
                  {active && <Ionicons name="checkmark" size={18} color={colors.secondary} />}
                </TouchableOpacity>
              );
            })}
          </Card>
        )}

        <Button fullWidth onPress={publish}>发布</Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screenMargin, paddingBottom: 48 },
  textInput: {
    minHeight: 120,
    textAlignVertical: 'top',
    ...typography.body,
    color: colors.textMain,
  },
  sectionTitle: { ...typography.bodyBold, color: colors.secondary, marginBottom: 10, marginTop: 4 },
  mediaPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    marginBottom: spacing.cardGap,
    minHeight: 88,
  },
  mediaIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(185, 207, 50, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaTextBlock: { flex: 1 },
  mediaTitle: { ...typography.bodyBold, color: colors.textMain, marginBottom: 2 },
  mediaHint: { ...typography.captionBold, color: colors.textLight },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 8,
    marginBottom: spacing.cardGap,
  },
  tagOption: {
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  tagOptionActive: {
    paddingHorizontal: 8,
    borderRadius: spacing.radiusPill,
    backgroundColor: 'rgba(185, 207, 50, 0.2)',
  },
  tagOptionText: { ...typography.bodyBold, color: colors.textLight },
  tagOptionTextActive: { color: colors.secondary },
  pickerRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  pickerBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: spacing.radiusMd,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerBoxActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(185, 207, 50, 0.12)',
  },
  pickerText: { flex: 1, ...typography.bodyBold, color: colors.textMain },
  pickerMenu: {
    marginTop: -4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  pickerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  pickerMenuText: { flex: 1, ...typography.bodyBold, color: colors.textMain },
});
