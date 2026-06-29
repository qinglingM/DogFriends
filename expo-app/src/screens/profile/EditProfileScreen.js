import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar } from '../../components';
import { useProfile } from '../../contexts/ProfileContext';
import { useAuth } from '../../contexts/AuthContext';
import CityPickerModal from '../../components/CityPickerModal';
import { formatArea } from '../../data/cityData';
import AvatarCropper from '../../components/AvatarCropper';
import { uploadImage } from '../../utils/uploadService';
import { imageUrl } from '../../utils/imageUrl';

const GENDER_OPTIONS = [
  { key: 'male', label: '男' },
  { key: 'female', label: '女' },
  { key: 'hidden', label: '不展示' },
];

export default function EditProfileScreen({ navigation }) {
  const { profile, updateProfile } = useProfile();
  const { user } = useAuth();
  const [name, setName] = useState(profile.name);
  const [signature, setSignature] = useState(profile.signature);
  const [province, setProvince] = useState(profile.province || null);
  const [city, setCity] = useState(profile.city || null);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [gender, setGender] = useState(profile.gender);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [cropperVisible, setCropperVisible] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState(null);

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setPendingAvatar(result.assets[0].uri);
      setCropperVisible(true);
    }
  };

  const handleCropConfirm = (uri) => {
    setAvatar(uri);
    setCropperVisible(false);
    setPendingAvatar(null);
  };

  const handleCropCancel = () => {
    setCropperVisible(false);
    setPendingAvatar(null);
  };

  const handleCityConfirm = ({ province: p, city: c }) => {
    setProvince(p);
    setCity(c);
    setShowCityPicker(false);
  };

  const handleSave = async () => {
    let avatarUrl = avatar;
    if (avatar && avatar !== profile.avatar && !avatar.startsWith('http')) {
      try {
        avatarUrl = await uploadImage(avatar, `${user.id}/avatars`, 'avatar');
      } catch (e) {
        Alert.alert('上传失败', '头像上传失败，请重试');
        return;
      }
    }
    const { error } = await updateProfile({
      name,
      signature,
      province,
      city,
      area: formatArea(province, city),
      avatar: avatarUrl,
      gender,
    });
    if (error) {
      Alert.alert('保存失败', error.message || '请稍后再试');
      return;
    }
    navigation.goBack();
  };

  return (
    <View style={styles.screen}>
      <NavBar
        title="编辑资料"
        onBack={() => navigation.goBack()}
        rightLabel="保存"
        rightOnPress={handleSave}
      />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickAvatar} activeOpacity={0.7}>
            <Image source={{ uri: imageUrl(avatar) }} style={styles.avatar} />
            <View style={styles.avatarBadge}>
              <Ionicons name="camera" size={14} color={colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>点击更换头像</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>昵称</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="输入你的昵称"
            placeholderTextColor="#A0B3A2"
            maxLength={10}
            returnKeyType="done"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>签名</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={signature}
            onChangeText={setSignature}
            placeholder="写一句介绍自己"
            placeholderTextColor="#A0B3A2"
            multiline
            numberOfLines={3}
            maxLength={50}
            returnKeyType="done"
            blurOnSubmit
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>性别</Text>
          <View style={styles.genderRow}>
            {GENDER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.genderBtn, gender === opt.key && styles.genderBtnActive]}
                activeOpacity={0.7}
                onPress={() => setGender(opt.key)}
              >
                <Text style={[styles.genderText, gender === opt.key && styles.genderTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>地区</Text>
          <TouchableOpacity
            style={styles.select}
            activeOpacity={0.7}
            onPress={() => setShowCityPicker(true)}
          >
            <Text style={styles.selectText}>
              {formatArea(province, city) || '选择地区'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.textLight} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CityPickerModal
        visible={showCityPicker}
        province={province}
        city={city}
        onConfirm={handleCityConfirm}
        onCancel={() => setShowCityPicker(false)}
      />

      <AvatarCropper
        visible={cropperVisible}
        imageUri={pendingAvatar}
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
        onReselect={pickAvatar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screenMargin, paddingBottom: 24 },
  avatarSection: { alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.sm, position: 'relative' },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: colors.chipDefault,
  },
  avatarBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.bg,
  },
  avatarHint: { ...typography.caption, color: colors.textLight },
  field: { marginBottom: spacing.lg },
  label: { ...typography.bodyBold, fontSize: 16, color: colors.secondary, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.white, borderRadius: spacing.radiusMd,
    padding: spacing.md, fontSize: 16, color: colors.textMain,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderBtn: {
    flex: 1,
    height: spacing.touchTarget,
    borderRadius: spacing.radiusMd,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  genderBtnActive: {
    borderColor: colors.secondary,
    backgroundColor: colors.white,
  },
  genderText: {
    ...typography.body,
    color: colors.textMain,
  },
  genderTextActive: {
    color: colors.secondary,
    fontWeight: '700',
  },
  select: {
    backgroundColor: colors.white, borderRadius: spacing.radiusMd,
    padding: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  selectText: { fontSize: 16, color: colors.textMain },
});
