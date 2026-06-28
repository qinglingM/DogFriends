import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, Button } from '../../components';
import {
  WENT_OPTIONS,
  NOT_WENT_OPTIONS,
  FACILITIES,
} from '../../data/exploreData';
import { useExplore } from '../../contexts/ExploreContext';
import { useAuth } from '../../contexts/AuthContext';
import { pickImagesFromLibrary, takePhoto } from '../../utils/imagePicker';
import { uploadImages } from '../../utils/uploadService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_SIZE = (SCREEN_WIDTH - spacing.screenMargin * 2 - 24) / 4;

export default function UpdateInfoScreen({ route, navigation }) {
  const id = route?.params?.id;
  const { getLocation, getValidations, addValidation } = useExplore();
  const { user } = useAuth();
  const location = getLocation(id);
  const validations = getValidations(id);

  const [went, setWent] = useState(null);
  const [admission, setAdmission] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [notWentReason, setNotWentReason] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [note, setNote] = useState('');

  const toggleFacility = (item) => setFacilities(arr =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]
  );

  const addPhoto = async () => {
    const selectedImages = await pickImagesFromLibrary();
    if (selectedImages.length > 0) {
      setPhotos(prev => [...prev, ...selectedImages]);
    }
  };
  const addPhotoFromCamera = async () => {
    const uri = await takePhoto();
    if (uri) setPhotos(prev => [...prev, uri]);
  };
  const removePhoto = (idx) => setPhotos(p => p.filter((_, i) => i !== idx));

  const selectWent = () => {
    setWent(true);
    setNotWentReason(null);
  };

  const selectNotWent = () => {
    setWent(false);
    setAdmission(null);
    setFacilities([]);
  };

  const canPublish = went === true ? !!admission : went === false ? !!notWentReason : false;

  const publish = async () => {
    const existingToday = validations.some(v =>
      v.profileId === user?.id &&
      new Date(v.time).toDateString() === new Date().toDateString()
    );
    if (existingToday) {
      Alert.alert('今天已反馈', '你今天已经对这个地点反馈过了，明天再来吧～');
      return;
    }

    let outcomeKey, outcomeLabel, tags = [];

    if (went) {
      const opt = WENT_OPTIONS.find(o => o.key === admission);
      outcomeKey = opt?.key || 'success';
      outcomeLabel = opt?.label || '全程顺利';
      tags = [...facilities];
    } else {
      const opt = NOT_WENT_OPTIONS.find(o => o.key === notWentReason);
      outcomeKey = opt?.key || 'other';
      outcomeLabel = opt?.label || '其他情况';
    }

    let photoUrls = photos;
    const hasNewPhotos = photos.some(p => !p.startsWith('http'));
    if (hasNewPhotos) {
      try {
        const toUpload = photos.filter(p => !p.startsWith('http'));
        const uploaded = await uploadImages(toUpload, `${user.id}/validations`, `val_${Date.now()}`);
        photoUrls = photos.map(p => !p.startsWith('http') ? uploaded.shift() : p);
      } catch (e) {
        Alert.alert('上传失败', '照片上传失败，请重试');
        return;
      }
    }

    const validation = {
      outcomeKey,
      outcomeLabel,
      dogSize: '',
      tags,
      note,
      photos: photoUrls,
    };

    const { error } = await addValidation(id, validation);
    if (error) {
      Alert.alert('发布失败', JSON.stringify({ code: error.code, message: error.message, details: error.details, hint: error.hint }, null, 2));
      return;
    }
    Alert.alert('感谢更新', '你的反馈已经发布到这个地点。', [
      { text: '好', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <View style={styles.screen}>
      <NavBar
        title="我来反馈"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {location && (
          <View style={styles.locationCard}>
            <Text style={styles.locName}>{location.name}</Text>
            <Text style={styles.locType}>{location.city} · {location.categoryLabel}</Text>
          </View>
        )}

        <View style={styles.tipCard}>
          <Ionicons name="heart" size={18} color={colors.secondary} />
          <Text style={styles.tipText}>
            你的反馈会帮助其他狗主人判断是否适合前往，请基于真实经历填写。
          </Text>
        </View>

        {/* 步骤 1：你去成了吗？ */}
        <Text style={styles.label}>你去成了吗？ <Text style={styles.req}>*</Text></Text>
        <View style={styles.binaryRow}>
          <TouchableOpacity
            style={[styles.binaryCard, went === true && styles.binaryCardActive]}
            onPress={selectWent}
            activeOpacity={0.7}
          >
            <Ionicons
              name={went === true ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={28}
              color={went === true ? colors.secondary : colors.textLight}
            />
            <Text style={[styles.binaryText, went === true && styles.binaryTextActive]}>
              我去成了
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.binaryCard, went === false && styles.binaryCardRed]}
            onPress={selectNotWent}
            activeOpacity={0.7}
          >
            <Ionicons
              name={went === false ? 'close-circle' : 'close-circle-outline'}
              size={28}
              color={went === false ? colors.danger : colors.textLight}
            />
            <Text style={[styles.binaryText, went === false && styles.binaryTextRed]}>
              我没去成
            </Text>
          </TouchableOpacity>
        </View>

        {/* 步骤 2a：我去成了 */}
        {went === true && (
          <>
            <Text style={styles.label}>准入情况 <Text style={styles.req}>*</Text></Text>
            <View style={styles.fourRow}>
              {WENT_OPTIONS.map(opt => {
                const active = admission === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => setAdmission(opt.key)}
                    style={[styles.fourCard, active && styles.fourCardActive]}
                  >
                    <Text style={[styles.fourText, active && styles.fourTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>配套设施</Text>
            <Text style={styles.hint}>可多选，选填</Text>
            <View style={styles.checkList}>
              {FACILITIES.map(item => {
                const active = facilities.includes(item);
                return (
                  <TouchableOpacity
                    key={item}
                    onPress={() => toggleFacility(item)}
                    style={styles.checkItem}
                  >
                    <Ionicons
                      name={active ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={active ? colors.secondary : colors.textLight}
                    />
                    <Text style={[styles.checkLabel, active && styles.checkLabelActive]}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

          </>
        )}

        {/* 步骤 2b：我没去成 */}
        {went === false && (
          <>
            <Text style={styles.label}>详细原因 <Text style={styles.req}>*</Text></Text>
            <View style={styles.fourRow}>
              {NOT_WENT_OPTIONS.map(opt => {
                const active = notWentReason === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => setNotWentReason(opt.key)}
                    style={[styles.fourCard, active && styles.fourCardRed]}
                  >
                    <Text style={[styles.fourText, active && styles.fourTextRed]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* 步骤 3：上传照片 */}
        <Text style={styles.label}>上传照片</Text>
        <Text style={styles.hint}>选填</Text>
        <View style={styles.photoRow}>
          {photos.map((uri, idx) => (
            <View key={uri} style={styles.photoBox}>
              <Image source={{ uri }} style={styles.photoImage} />
              <TouchableOpacity
                style={styles.removePhoto}
                onPress={() => removePhoto(idx)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={[styles.photoBox, styles.addBox]} onPress={addPhotoFromCamera}>
            <Ionicons name="camera" size={26} color={colors.secondary} />
            <Text style={styles.addText}>拍照</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.photoBox, styles.addBox]} onPress={addPhoto}>
            <Ionicons name="images" size={26} color={colors.secondary} />
            <Text style={styles.addText}>相册</Text>
          </TouchableOpacity>
        </View>

        {/* 步骤 4：补充说明 */}
        <Text style={styles.label}>补充说明</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={note}
          onChangeText={setNote}
          placeholder="分享一下你的真实体验，帮助其他狗主人判断～"
          placeholderTextColor={colors.textLight}
          multiline
        />

        <View style={styles.publishWrap}>
          <Button fullWidth disabled={!canPublish} onPress={publish}>
            发布反馈
          </Button>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.tipBlue,
    padding: 12,
    borderRadius: spacing.radiusMd,
    marginBottom: 16,
  },
  tipText: { ...typography.caption, color: colors.textMain, flex: 1, lineHeight: 18 },

  label: { ...typography.bodyBold, color: colors.textMain, marginTop: 16, marginBottom: 4 },
  req: { color: colors.danger },
  hint: { ...typography.caption, color: colors.textLight, marginBottom: 8 },

  // 二选一
  binaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  binaryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  binaryCardActive: {
    borderColor: colors.secondary,
    backgroundColor: colors.primary,
  },
  binaryCardRed: {
    borderColor: colors.danger,
    backgroundColor: '#FEF0F0',
  },
  binaryText: { ...typography.bodyBold, color: colors.textLight },
  binaryTextActive: { color: colors.secondary },
  binaryTextRed: { color: colors.danger },

  // 4 个一行胶囊
  fourRow: {
    flexDirection: 'row',
    gap: 6,
  },
  fourCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusPill,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  fourCardActive: {
    borderColor: colors.secondary,
    backgroundColor: colors.primary,
  },
  fourCardRed: {
    borderColor: colors.danger,
    backgroundColor: '#FEF0F0',
  },
  fourText: { ...typography.bodyBold, color: colors.textMain, fontSize: 13 },
  fourTextActive: { color: colors.secondary },
  fourTextRed: { color: colors.danger },

  checkList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  checkItem: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    width: '48%', paddingVertical: 10, paddingHorizontal: 10,
    borderRadius: spacing.radiusSm,
    backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.border,
  },
  checkLabel: { ...typography.body, color: colors.textMain, flex: 1, fontSize: 13 },
  checkLabelActive: { color: colors.secondary, fontWeight: '700' },

  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  photoBox: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: spacing.radiusMd,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: spacing.radiusMd,
  },
  addBox: { borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed' },
  addText: { ...typography.caption, color: colors.secondary, marginTop: 4 },
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

  publishWrap: {
    marginTop: spacing.lg,
  },
});
