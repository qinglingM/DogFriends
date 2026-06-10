import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Card, Button } from '../../components';
import { SQUARE_TAGS } from '../../data/squareData';
import { useSquare } from '../../contexts/SquareContext';

const MOCK_IMAGE = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80';
const LOCATION_OPTIONS = ['上海 徐汇', '复兴公园', '世纪公园', '徐汇滨江'];
const VISIBILITY_OPTIONS = [
  { key: 'public', label: '公开', icon: 'earth' },
  { key: 'private', label: '仅自己可见', icon: 'lock-closed-outline' },
];

export default function CreatePostScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { addPost } = useSquare();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [media, setMedia] = useState([]);
  const [tag, setTag] = useState(null);
  const [location, setLocation] = useState('上海 徐汇');
  const [visibility, setVisibility] = useState('public');
  const [openPicker, setOpenPicker] = useState(null);

  const addMedia = async () => {
    // 1. 请求相册权限（首次会弹系统弹窗）
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert(
        '需要相册权限',
        '请在系统设置里允许「狗友」访问你的照片，才能上传图片。',
        [
          { text: '取消', style: 'cancel' },
          { text: '去设置', onPress: () => Linking.openSettings?.() },
        ]
      );
      return;
    }
    // 2. 调起系统相册选择器
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: Platform.OS !== 'android', // Android 多选需 13+，统一保守
        quality: 0.85,
      });
      if (result.canceled) return;
      const newAssets = (result.assets || []).map(a => ({
        id: a.assetId || `m_${Date.now()}_${Math.random()}`,
        type: a.type === 'video' ? 'video' : 'image',
        uri: a.uri,
      }));
      setMedia(prev => [...prev, ...newAssets]);
    } catch (err) {
      Alert.alert('选择失败', err?.message || '请稍后再试');
    }
  };
  const removeMedia = (id) => setMedia(prev => prev.filter(m => m.id !== id));

  const publish = () => {
    const body = text.trim();
    const content = title.trim()
      ? (body ? `${title.trim()}\n${body}` : title.trim())
      : (body || '分享今天的遛狗日常。');
    const cover = media[0];
    addPost({
      text: content,
      tag,
      location,
      visibility,
      mediaType: cover?.type === 'video' ? 'video' : 'image',
      mediaUrl: cover?.uri || MOCK_IMAGE,
    });
    navigation.navigate('SquareHome');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={28} color={colors.textMain} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 媒体格子（横向滑动） */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mediaScroll}
        >
          {media.map(m => (
            <View key={m.id} style={styles.mediaTile}>
              {m.uri ? (
                <Image source={{ uri: m.uri }} style={styles.mediaImage} resizeMode="cover" />
              ) : (
                <Ionicons name="image" size={36} color={colors.secondary} style={{ opacity: 0.5 }} />
              )}
              {m.type === 'video' && (
                <View style={styles.videoMarker}>
                  <Ionicons name="play" size={14} color={colors.white} />
                </View>
              )}
              <TouchableOpacity
                style={styles.removeMediaBtn}
                onPress={() => removeMedia(m.id)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="close-circle" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={[styles.mediaTile, styles.addTile]} onPress={addMedia} activeOpacity={0.7}>
            <Ionicons name="add" size={40} color={colors.textLight} />
          </TouchableOpacity>
        </ScrollView>

        {/* 标题 */}
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="添加标题"
          placeholderTextColor={colors.textLight}
          style={styles.titleInput}
          maxLength={50}
        />

        {/* 正文 */}
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="添加正文"
          placeholderTextColor={colors.textLight}
          multiline
          style={styles.bodyInput}
        />

        {/* 以下保留：标签 / 位置 / 可见性 / 发布 */}
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
  header: {
    paddingHorizontal: spacing.screenMargin,
    paddingVertical: 12,
  },
  content: { padding: spacing.screenMargin, paddingBottom: 48 },

  // 媒体格子
  mediaScroll: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
    marginBottom: 16,
  },
  mediaTile: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoMarker: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTile: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  removeMediaBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.white,
    borderRadius: 12,
  },

  // 标题
  titleInput: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textMain,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },

  // 正文
  bodyInput: {
    ...typography.body,
    color: colors.textMain,
    textAlignVertical: 'top',
    minHeight: 80,
    paddingVertical: 14,
    paddingHorizontal: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    marginBottom: 20,
  },

  // 以下保留原样式
  sectionTitle: { ...typography.bodyBold, color: colors.secondary, marginBottom: 10, marginTop: 4 },
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
