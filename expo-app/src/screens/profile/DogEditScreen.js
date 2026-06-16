import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DatePickerModal from '../../components/DatePickerModal';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar } from '../../components';
import { useDogs } from '../../contexts/DogContext';
import BreedPickerModal from '../../components/BreedPickerModal';
import { TRAIT_PRESETS } from '../../data/breedData';

const DOG_SIZES = [
  { key: 'small', label: '小型犬', range: '< 10kg' },
  { key: 'medium', label: '中型犬', range: '10-25kg' },
  { key: 'large', label: '大型犬', range: '> 25kg' },
];

export default function DogEditScreen({ navigation, route }) {
  const { dogs, addDog, updateDog } = useDogs();
  const dogId = route?.params?.dogId;
  const existingDog = dogId ? dogs.find(d => d.id === dogId) : null;
  const isEdit = !!existingDog;

  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('male');
  const [size, setSize] = useState('large');
  const [birthday, setBirthday] = useState('');
  const [weight, setWeight] = useState('');
  const [traits, setTraits] = useState([]);
  const [image, setImage] = useState('');
  const [publicProfile, setPublicProfile] = useState(true);
  const [publicWalkStats, setPublicWalkStats] = useState(true);
  const [neutered, setNeutered] = useState(false);
  const [showBreedPicker, setShowBreedPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (existingDog) {
      setName(existingDog.name || '');
      setBreed(existingDog.breed || '');
      setGender(existingDog.gender || 'male');
      setSize(existingDog.size || 'large');
      setBirthday(existingDog.birthday || '');
      setWeight(existingDog.weight ? String(existingDog.weight) : '');
      setTraits(existingDog.traits || []);
      setImage(existingDog.image || '');
      setPublicProfile(existingDog.publicProfile !== false);
      setPublicWalkStats(existingDog.publicWalkStats !== false);
      setNeutered(existingDog.neutered === true);
    }
  }, [existingDog]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const toggleTrait = (trait) => {
    setTraits(prev => {
      if (prev.includes(trait)) return prev.filter(t => t !== trait);
      if (prev.length >= 5) {
        Alert.alert('提示', '性格标签最多选择5个');
        return prev;
      }
      return [...prev, trait];
    });
  };

  const birthdayDate = birthday ? birthday : '';

  const formatWeight = (w) => {
    if (!w) return '';
    const num = Number(w);
    return num % 1 === 0 ? num.toFixed(1) : String(w);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const dogData = {
      name: name.trim(),
      breed: breed || '未知品种',
      gender,
      size,
      birthday: birthday.trim(),
      weight: Number(weight) || 0,
      traits,
      image,
      publicProfile,
      publicWalkStats,
      neutered,
    };

    if (isEdit) {
      updateDog({ id: dogId, ...dogData });
    } else {
      addDog(dogData);
    }
    navigation.goBack();
  };

  const genderBorderColor = gender === 'male' ? '#4A90D9' : '#E88BA4';

  return (
    <View style={styles.screen}>
      <NavBar
        title={isEdit ? '编辑狗狗' : '添加狗狗'}
        onBack={() => navigation.goBack()}
        rightLabel="保存"
        rightOnPress={handleSave}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* ===== Tier 1: 公开档案 ===== */}
        <Text style={styles.sectionTitle}>公开档案</Text>
        <Text style={styles.sectionHint}>其他用户可以看到的信息</Text>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={[styles.avatarWrap, { borderColor: genderBorderColor }]}
            onPress={pickImage}
            activeOpacity={0.7}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="camera" size={32} color={colors.border} />
              </View>
            )}
            <View style={[styles.avatarBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={12} color={colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>点击上传头像</Text>
        </View>

        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>名字 <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="给狗狗起个名字"
            placeholderTextColor="#A0B3A2"
          />
        </View>

        {/* Breed */}
        <View style={styles.field}>
          <Text style={styles.label}>品种 <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity
            style={styles.pickerBtn}
            activeOpacity={0.7}
            onPress={() => setShowBreedPicker(true)}
          >
            <Text style={[styles.pickerText, !breed && { color: '#A0B3A2' }]}>
              {breed || '选择品种'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Gender */}
        <View style={styles.field}>
          <Text style={styles.label}>性别 <Text style={styles.required}>*</Text></Text>
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[styles.genderBtn, gender === 'male' && styles.genderBtnMale]}
              onPress={() => setGender('male')}
            >
              <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>♂ 公</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderBtn, gender === 'female' && styles.genderBtnFemale]}
              onPress={() => setGender('female')}
            >
              <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>♀ 母</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Size */}
        <View style={styles.field}>
          <Text style={styles.label}>犬型</Text>
          <View style={styles.sizeRow}>
            {DOG_SIZES.map(s => (
              <TouchableOpacity
                key={s.key}
                style={[styles.sizeBtn, size === s.key && styles.sizeBtnActive]}
                onPress={() => setSize(s.key)}
              >
                <Text style={[styles.sizeLabel, size === s.key && styles.sizeLabelActive]}>{s.label}</Text>
                <Text style={[styles.sizeRange, size === s.key && styles.sizeRangeActive]}>{s.range}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Birthday */}
        <View style={styles.field}>
          <Text style={styles.label}>生日</Text>
          <TouchableOpacity
            style={styles.pickerBtn}
            activeOpacity={0.7}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.pickerText, !birthday && { color: '#A0B3A2' }]}>
              {birthday || '选择生日'}
            </Text>
            <Ionicons name="calendar-outline" size={18} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        <DatePickerModal
          visible={showDatePicker}
          date={birthdayDate}
          onConfirm={(d) => { setBirthday(d); setShowDatePicker(false); }}
          onCancel={() => setShowDatePicker(false)}
        />

        {/* Traits */}
        <View style={styles.field}>
          <Text style={styles.label}>性格标签</Text>
          <View style={styles.traitGrid}>
            {TRAIT_PRESETS.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.traitChip, traits.includes(t) && styles.traitChipActive]}
                activeOpacity={0.7}
                onPress={() => toggleTrait(t)}
              >
                <Text style={[styles.traitText, traits.includes(t) && styles.traitTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Public toggle */}
        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => setPublicProfile(!publicProfile)}
        >
          <View style={styles.toggleLeft}>
            <View style={[styles.toggleIcon, { backgroundColor: 'rgba(185, 207, 50, 0.2)' }]}>
              <Ionicons name={publicProfile ? 'earth' : 'lock-closed-outline'} size={20} color={colors.secondary} />
            </View>
            <View>
              <Text style={styles.toggleText}>公开档案</Text>
              <Text style={styles.toggleSub}>{publicProfile ? '其他用户可以看到' : '仅自己可见'}</Text>
            </View>
          </View>
          <View style={[styles.toggle, !publicProfile && styles.toggleOff]}>
            <View style={[styles.toggleKnob, !publicProfile && styles.toggleKnobOff]} />
          </View>
        </TouchableOpacity>

        {/* ===== Divider ===== */}
        <View style={styles.divider} />

        {/* ===== Tier 2: 遛狗记录 ===== */}
        <Text style={styles.sectionTitle}>遛狗记录</Text>
        <Text style={styles.sectionHint}>仅展示，不可编辑</Text>

        {existingDog && existingDog.walkStats ? (
          <View style={styles.walkStatsPreview}>
            <View style={styles.walkStatItem}>
              <Ionicons name="paw" size={20} color={colors.primary} />
              <Text style={styles.walkStatValue}>{existingDog.walkStats.walks}</Text>
              <Text style={styles.walkStatLabel}>次</Text>
            </View>
            <View style={styles.walkStatItem}>
              <Ionicons name="trending-up" size={20} color={colors.primary} />
              <Text style={styles.walkStatValue}>{existingDog.walkStats.distance}</Text>
              <Text style={styles.walkStatLabel}>km</Text>
            </View>
            <View style={styles.walkStatItem}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={styles.walkStatValue}>{existingDog.walkStats.duration}</Text>
              <Text style={styles.walkStatLabel}>h</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noWalkData}>暂无遛狗记录</Text>
        )}

        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => setPublicWalkStats(!publicWalkStats)}
        >
          <View style={styles.toggleLeft}>
            <View style={[styles.toggleIcon, { backgroundColor: 'rgba(185, 207, 50, 0.2)' }]}>
              <Ionicons name={publicWalkStats ? 'eye' : 'eye-off'} size={20} color={colors.secondary} />
            </View>
            <View>
              <Text style={styles.toggleText}>公开遛狗记录</Text>
              <Text style={styles.toggleSub}>{publicWalkStats ? '其他用户可以看到' : '仅自己可见'}</Text>
            </View>
          </View>
          <View style={[styles.toggle, !publicWalkStats && styles.toggleOff]}>
            <View style={[styles.toggleKnob, !publicWalkStats && styles.toggleKnobOff]} />
          </View>
        </TouchableOpacity>

        {/* ===== Divider ===== */}
        <View style={styles.divider} />

        {/* ===== Tier 3: 私密档案 ===== */}
        <Text style={[styles.sectionTitle, { color: colors.accent }]}>私密档案</Text>
        <Text style={styles.sectionHint}>仅自己可见</Text>

        {/* Weight */}
        <View style={styles.field}>
          <Text style={styles.label}>体重</Text>
          <View style={styles.weightRow}>
            <TouchableOpacity
              style={styles.weightBtn}
              onPress={() => setWeight(String(Math.max(0, Math.round((Number(weight || 0) - 0.5) * 10) / 10)))}
            >
              <Ionicons name="remove" size={24} color={colors.secondary} />
            </TouchableOpacity>
            <TextInput
              style={styles.weightInput}
              value={formatWeight(weight)}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
            <Text style={styles.weightUnit}>kg</Text>
            <TouchableOpacity
              style={styles.weightBtn}
              onPress={() => setWeight(String(Math.round((Number(weight || 0) + 0.5) * 10) / 10))}
            >
              <Ionicons name="add" size={24} color={colors.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Neutered toggle */}
        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => setNeutered(!neutered)}
        >
          <View style={styles.toggleLeft}>
            <View style={[styles.toggleIcon, { backgroundColor: 'rgba(146, 102, 153, 0.15)' }]}>
              <Ionicons name="cut-outline" size={20} color={colors.accent} />
            </View>
            <View>
              <Text style={styles.toggleText}>绝育状态</Text>
              <Text style={styles.toggleSub}>{neutered ? '已绝育' : '未绝育'}</Text>
            </View>
          </View>
          <View style={[styles.toggle, !neutered && styles.toggleOff]}>
            <View style={[styles.toggleKnob, !neutered && styles.toggleKnobOff]} />
          </View>
        </TouchableOpacity>

        {/* Vaccine link */}
        <TouchableOpacity
          style={styles.vaccineLink}
          onPress={() => navigation.navigate('Vaccine')}
        >
          <View style={styles.toggleLeft}>
            <View style={[styles.toggleIcon, { backgroundColor: 'rgba(146, 102, 153, 0.15)' }]}>
              <Ionicons name="medkit-outline" size={20} color={colors.accent} />
            </View>
            <View>
              <Text style={styles.toggleText}>疫苗记录</Text>
              <Text style={styles.vaccineSub}>点击查看</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
        </TouchableOpacity>
      </ScrollView>

      <BreedPickerModal
        visible={showBreedPicker}
        breed={breed}
        onConfirm={(b) => { setBreed(b); setShowBreedPicker(false); }}
        onCancel={() => setShowBreedPicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screenMargin, paddingBottom: 24 },

  /* Section headers */
  sectionTitle: { ...typography.h3, color: colors.secondary, marginBottom: 4, marginTop: 8 },
  sectionHint: { ...typography.caption, color: colors.textLight, marginBottom: 16 },

  /* Avatar */
  avatarSection: { alignItems: 'center', paddingVertical: 16, gap: 8, position: 'relative' },
  avatarWrap: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 4, backgroundColor: colors.chipDefault,
    overflow: 'visible',
  },
  avatarImg: { width: 88, height: 88, borderRadius: 44 },
  avatarPlaceholder: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarBadge: {
    position: 'absolute', bottom: -4, right: -4,
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.bg,
  },
  avatarHint: { ...typography.caption, color: colors.textLight },

  /* Fields */
  field: { marginBottom: 20 },
  label: { ...typography.bodyBold, fontSize: 16, color: colors.secondary, marginBottom: 8 },
  required: { color: colors.danger },
  input: {
    backgroundColor: colors.white, borderRadius: spacing.radiusMd,
    padding: spacing.md, fontSize: 16, color: colors.textMain,
  },

  /* Breed picker */
  pickerBtn: {
    backgroundColor: colors.white, borderRadius: spacing.radiusMd,
    padding: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  pickerText: { fontSize: 16, color: colors.textMain },

  /* Gender */
  genderRow: { flexDirection: 'row', gap: 16 },
  genderBtn: {
    flex: 1, backgroundColor: colors.white, borderRadius: spacing.radiusMd,
    paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  genderBtnMale: { borderColor: '#4A90D9', backgroundColor: 'rgba(74, 144, 217, 0.08)' },
  genderBtnFemale: { borderColor: '#E88BA4', backgroundColor: 'rgba(232, 139, 164, 0.08)' },
  genderText: { ...typography.bodyBold, fontSize: 15, color: colors.textLight },
  genderTextActive: { color: colors.secondary, fontWeight: '800' },

  /* Size */
  sizeRow: { flexDirection: 'row', gap: 10 },
  sizeBtn: {
    flex: 1, backgroundColor: colors.white, borderRadius: spacing.radiusMd,
    padding: spacing.md, alignItems: 'center', gap: 4, minHeight: 72,
    borderWidth: 2, borderColor: 'transparent',
  },
  sizeBtnActive: { borderColor: colors.primary, backgroundColor: 'rgba(185, 207, 50, 0.1)' },
  sizeLabel: { ...typography.bodyBold, color: colors.textLight },
  sizeLabelActive: { color: colors.secondary, fontWeight: '800' },
  sizeRange: { ...typography.caption, color: colors.textLight },
  sizeRangeActive: { color: colors.secondary },

  /* Weight */
  weightRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  weightBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.white, borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  weightInput: {
    flex: 1, backgroundColor: colors.white, borderRadius: spacing.radiusMd,
    padding: spacing.md, fontSize: 24, fontWeight: '800',
    color: colors.secondary, textAlign: 'center',
  },
  weightUnit: { ...typography.bodyBold, fontSize: 16, color: colors.secondary },

  /* Toggle */
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: spacing.radiusMd,
    padding: spacing.md, marginBottom: 16,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  toggleText: { ...typography.bodyBold, color: colors.textMain },
  toggleSub: { ...typography.caption, color: colors.textLight, marginTop: 2 },
  toggle: {
    width: 48, height: 28, borderRadius: 14,
    backgroundColor: colors.primary, position: 'relative',
  },
  toggleOff: { backgroundColor: colors.border },
  toggleKnob: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.white, position: 'absolute', top: 2, right: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 2,
  },
  toggleKnobOff: { right: 'auto', left: 2 },

  /* Traits */
  traitGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  traitChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: spacing.radiusPill, backgroundColor: colors.white,
    borderWidth: 1.5, borderColor: colors.border,
  },
  traitChipActive: {
    backgroundColor: 'rgba(185, 207, 50, 0.1)', borderColor: colors.primary,
  },
  traitText: { ...typography.caption, color: colors.textLight },
  traitTextActive: { color: colors.secondary, fontWeight: '700' },

  /* Walk stats preview */
  walkStatsPreview: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: colors.white, borderRadius: spacing.radiusMd,
    padding: spacing.md, marginBottom: 16,
  },
  walkStatItem: { alignItems: 'center', gap: 4 },
  walkStatValue: { ...typography.bodyBold, fontSize: 20, color: colors.secondary },
  walkStatLabel: { ...typography.caption, color: colors.textLight },
  noWalkData: { ...typography.body, color: colors.textLight, textAlign: 'center', marginBottom: 16 },

  /* Divider */
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },

  /* Vaccine */
  vaccineLink: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: spacing.radiusMd, padding: spacing.md,
    marginBottom: 16,
  },
  vaccineSub: { ...typography.caption, color: colors.textLight, marginTop: 2 },
});
