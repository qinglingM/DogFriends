import React, { useState, useEffect } from 'react';
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
import * as Location from 'expo-location';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Button } from '../../components';
import { SQUARE_TAGS } from '../../data/squareData';
import { useSquare } from '../../contexts/SquareContext';
import { useProfile } from '../../contexts/ProfileContext';
import { useAuth } from '../../contexts/AuthContext';
import { uploadImages } from '../../utils/uploadService';


export default function CreatePostScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { addPost } = useSquare();
  const { profile } = useProfile();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [media, setMedia] = useState([]);
  const [tag, setTag] = useState(null);
  const [detectedLocation, setDetectedLocation] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (geocode.length > 0) {
        setDetectedLocation(geocode[0].city || geocode[0].district || '');
      }
    })();
  }, []);

  const addMedia = async () => {
    // 1. 请求相册权限（首次会弹系统弹窗）
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert(
        '需要相册权限',
        '请在系统设置里允许「遛遛」访问你的照片，才能上传图片。',
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

  const publish = async () => {
    if (!title.trim() && !text.trim()) {
      Alert.alert('发布失败', '请填写标题或正文');
      return;
    }
    if (media.length === 0) {
      Alert.alert('发布失败', '请至少选择一张图片');
      return;
    }
    const body = text.trim();
    const imageUris = media.filter(m => m.type === 'image').map(m => m.uri);
    const videoUri = media.find(m => m.type === 'video')?.uri;

    let mediaUrl = null;
    let images = [];
    try {
      if (imageUris.length > 0) {
        const urls = await uploadImages(imageUris, `${user.id}/posts`, `post_${Date.now()}`);
        mediaUrl = urls[0];
        images = urls;
      }
      if (videoUri) {
        mediaUrl = videoUri;
      }
    } catch (e) {
      Alert.alert('上传失败', '图片上传失败，请重试');
      return;
    }

    const { error } = await addPost({
      userName: profile.name || '小明',
      authorAvatar: (profile.avatar?.charAt(0)?.toUpperCase()) || 'M',
      title: title.trim(),
      text: body,
      tag,
      location: detectedLocation,
      mediaType: videoUri ? 'video' : 'image',
      mediaUrl,
      images,
    });
    if (error) {
      Alert.alert('发布失败', error.message || '请稍后再试');
      return;
    }
    navigation.replace('SquareHome');
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
          maxLength={25}
          returnKeyType="done"
          blurOnSubmit
        />

        {/* 正文 */}
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="添加正文"
          placeholderTextColor={colors.textLight}
          multiline
          maxLength={400}
          returnKeyType="done"
          blurOnSubmit
          style={styles.bodyInput}
        />
        <Text style={styles.charCounter}>{`${text.length}/400`}</Text>

        {/* 标签 */}
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
  charCounter: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 12,
  },
});
