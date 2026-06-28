import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, Button, CityPickerModal } from '../../components';
import {
  ENTRY_AREAS,
  FACILITIES,
  LOCATION_STATUS,
  CATEGORIES,
} from '../../data/exploreData';
import { findProvinceByCity, formatArea } from '../../data/cityData';
import { useExplore } from '../../contexts/ExploreContext';
import { useAuth } from '../../contexts/AuthContext';
import { pickImagesFromLibrary, takePhoto } from '../../utils/imagePicker';
import { uploadImages } from '../../utils/uploadService';

const TYPE_ITEMS = CATEGORIES.filter(c => c.key !== 'all' && c.key !== 'other');

export default function AddLocationScreen({ route, navigation }) {
  const { addLocation, updateLocation } = useExplore();
  const { user } = useAuth();

  const { selectedName, selectedCity, editLocation } = route.params || {};
  const isEdit = !!editLocation;
  const pickedName = selectedName || editLocation?.name || '';
  const pickedCity = selectedCity || editLocation?.city || null;

  const [name, setName] = useState(pickedName);
  const [city, setCity] = useState(pickedCity);
  const [province, setProvince] = useState(pickedCity ? findProvinceByCity(pickedCity) : null);
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [category, setCategory] = useState(editLocation?.category || null);
  const [entryArea, setEntryArea] = useState(editLocation?.entryArea || null);
  const [facilities, setFacilities] = useState(editLocation?.facilities || []);
  const [photos, setPhotos] = useState(editLocation?.photos || []);
  const [note, setNote] = useState(editLocation?.description || '');

  useEffect(() => {
    if (route.params?.selectedName) {
      setName(route.params.selectedName);
      setCity(route.params.selectedCity || null);
      setProvince(route.params.selectedCity ? findProvinceByCity(route.params.selectedCity) : null);
    } else if (route.params?.editLocation) {
      const loc = route.params.editLocation;
      setName(loc.name);
      setCity(loc.city);
      setProvince(loc.city ? findProvinceByCity(loc.city) : null);
    }
  }, [route.params?.selectedName, route.params?.selectedCity, route.params?.editLocation]);

  useEffect(() => {
    if (!city) { setProvince(null); return; }
    setProvince(findProvinceByCity(city));
  }, [city]);

  useEffect(() => {
    if (city) return;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      const addresses = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (addresses.length > 0 && addresses[0].city) {
        setCity(addresses[0].city);
      }
    })();
  }, []);

  const toggle = (arr, set, item) => set(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);

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

  const removePhoto = (i) => setPhotos(p => p.filter((_, idx) => idx !== i));

  const publish = async () => {
    const entryLabel = ENTRY_AREAS.find(e => e.key === entryArea)?.label;
    const tags = [entryLabel, facilities[0]].filter(Boolean).slice(0, 3);

    let photoUrls = photos;
    const hasNewPhotos = photos.some(p => !p.startsWith('http'));
    if (hasNewPhotos) {
      try {
        const toUpload = photos.filter(p => !p.startsWith('http'));
        const uploaded = await uploadImages(toUpload, `${user.id}/locations`, `loc_${Date.now()}`);
        photoUrls = photos.map(p => !p.startsWith('http') ? uploaded.shift() : p);
      } catch (e) {
        Alert.alert('上传失败', '照片上传失败，请重试');
        return;
      }
    }

    const payload = {
      name: name.trim(),
      category,
      categoryLabel: CATEGORIES.find(c => c.key === category)?.label || '其他',
      city: city || '上海',
      distanceKm: 1.0,
      phone: '',
      hours: '',
      entryArea,
      dogSize: [],
      behaviors: [],
      facilities,
      tags,
      status: LOCATION_STATUS.USER_SUBMITTED,
      verifierCount: 0,
      lastUpdatedLabel: '刚刚发布',
      description: note,
      photos: photoUrls,
    };

    let result;
    if (isEdit) {
      result = await updateLocation({ ...payload, id: editLocation.id });
    } else {
      result = await addLocation(payload);
    }

    if (result.error) {
      Alert.alert(isEdit ? '编辑失败' : '添加失败', JSON.stringify({ code: result.error.code, message: result.error.message, details: result.error.details, hint: result.error.hint }, null, 2));
      return;
    }
    if (isEdit) {
      navigation.goBack();
    } else {
      navigation.replace('AddLocationSuccess', { locationId: result.data.id });
    }
  };

  return (
    <View style={styles.screen}>
      <NavBar title={isEdit ? '修改内容' : '新增地点'} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tipCard}>
          <Ionicons name="information-circle" size={18} color={colors.secondary} />
          <Text style={styles.tipText}>
            请只提交你真实去过、确认可以带狗的地点。信息会直接发布，请尽量填写准确。
          </Text>
        </View>

        {/* 1. 地点定位 — 城市 + 名称一行 */}
        <Text style={styles.sectionTitle}>📍 地点定位</Text>
        <View style={styles.pickedCard}>
          <View style={styles.locRow}>
            <TouchableOpacity style={[styles.locCityCol, city && styles.locCityColActive]} onPress={() => setCityPickerOpen(true)} activeOpacity={0.7}>
              <Text style={[styles.locCityText, city && styles.locCityTextActive]}>{city || '城市'}</Text>
              <Ionicons name="chevron-down" size={12} color={city ? colors.secondary : colors.textLight} />
            </TouchableOpacity>
            <View style={styles.locNameCol}>
              <TextInput
                style={styles.locNameInput}
                value={name}
                onChangeText={setName}
                placeholder="地点名称"
                placeholderTextColor={colors.textLight}
                returnKeyType="done"
                blurOnSubmit
              />
            </View>
          </View>
        </View>

        {/* 2. 地点类型 — 3+3 行，方块图标 */}
        <Text style={styles.sectionTitle}>🏷️ 地点类型 <Text style={styles.req}>*</Text></Text>
        <View style={styles.typeRow}>
          {TYPE_ITEMS.slice(0, 3).map(c => {
            const active = category === c.key;
            return (
              <TouchableOpacity
                key={c.key}
                onPress={() => setCategory(prev => prev === c.key ? null : c.key)}
                style={[styles.typeChip, active && styles.typeChipActive]}
              >
                <Ionicons name={c.icon} size={22} color={active ? colors.accent : colors.textLight} />
                <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.typeRow}>
          {TYPE_ITEMS.slice(3).map(c => {
            const active = category === c.key;
            return (
              <TouchableOpacity
                key={c.key}
                onPress={() => setCategory(prev => prev === c.key ? null : c.key)}
                style={[styles.typeChip, active && styles.typeChipActive]}
              >
                <Ionicons name={c.icon} size={22} color={active ? colors.accent : colors.textLight} />
                <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 3. 狗狗可进入区域 — 3 个一行 */}
        <Text style={styles.sectionTitle}>🐶 可进入区域 <Text style={styles.req}>*</Text></Text>
        <View style={styles.entryAreaRow}>
          {ENTRY_AREAS.slice(0, 3).map(opt => {
            const active = entryArea === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setEntryArea(opt.key)}
                style={[styles.entryAreaCard, active && styles.entryAreaCardActive]}
              >
                <Text style={[styles.entryAreaText, active && styles.entryAreaTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.entryAreaRow}>
          {ENTRY_AREAS.slice(3).map(opt => {
            const active = entryArea === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setEntryArea(opt.key)}
                style={[styles.entryAreaCard, active && styles.entryAreaCardActive]}
              >
                <Text style={[styles.entryAreaText, active && styles.entryAreaTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 4. 配套设施 */}
        <Text style={styles.sectionTitle}>📦 配套设施</Text>
        <Text style={styles.hint}>可多选，选填</Text>
        <View style={styles.checkList}>
          {FACILITIES.map(opt => {
            const active = facilities.includes(opt);
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => toggle(facilities, setFacilities, opt)}
                style={styles.checkItem}
              >
                <Ionicons
                  name={active ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={active ? colors.secondary : colors.textLight}
                />
                <Text style={[styles.checkLabel, active && styles.checkLabelActive]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 5. 照片 */}
        <Text style={styles.sectionTitle}>📸 现场照片 <Text style={styles.req}>*</Text></Text>
        <Text style={styles.hint}>至少 1 张。门店入口 / 室内环境 / 户外座位 / 宠物友好标识等</Text>
        <View style={styles.photoRow}>
          {photos.map((uri, idx) => (
            <View key={uri} style={styles.photoBox}>
              <Image source={{ uri }} style={styles.photoImage} />
              <TouchableOpacity style={styles.removePhoto} onPress={() => removePhoto(idx)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
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

        {/* 6. 补充说明 */}
        <Text style={styles.sectionTitle}>✏️ 补充说明</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={note}
          onChangeText={setNote}
          placeholder="分享一些你对这个地方的真实体验吧～"
          placeholderTextColor={colors.textLight}
          multiline
        />

        <View style={styles.publishWrap}>
          <Button fullWidth onPress={() => {
            const checks = [
              ['地点', !!name.trim()],
              ['城市', !!city],
              ['类别', !!category],
              ['可进入区域', !!entryArea],
              ['照片', photos.length >= 1],
            ];
            const missing = checks.filter(([, ok]) => !ok).map(([label]) => label);
            if (missing.length > 0) {
              Alert.alert('请先完成以下内容', missing.join('\n'));
              return;
            }
            publish();
          }}>
            {isEdit ? '保存修改' : '发布地点'}
          </Button>
        </View>
      </ScrollView>

      <CityPickerModal
        visible={cityPickerOpen}
        province={province}
        city={city}
        onConfirm={({ province: p, city: c }) => {
          setProvince(p);
          setCity(c);
          setCityPickerOpen(false);
        }}
        onCancel={() => setCityPickerOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: spacing.lg },

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

  sectionTitle: {
    ...typography.h3,
    color: colors.secondary,
    marginTop: 8,
    marginBottom: 12,
  },

  // 地点定位 — 城市 + 名称一行
  pickedCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locCityCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: colors.chipDefault,
    borderRadius: spacing.radiusSm,
  },
  locCityColActive: {
    backgroundColor: colors.primary,
  },
  locCityText: { ...typography.caption, color: colors.textMain, fontSize: 13 },
  locCityTextActive: { color: colors.secondary, fontWeight: '700' },
  locNameCol: {
    flex: 1,
  },
  locNameInput: {
    ...typography.body,
    color: colors.textMain,
    lineHeight: undefined,
    height: 36,
    paddingVertical: 0,
    paddingHorizontal: 10,
    backgroundColor: colors.chipDefault,
    borderRadius: spacing.radiusSm,
    fontSize: 14,
    textAlignVertical: 'center',
  },

  // 地点类型 — 方块图标，3+3 行
  typeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  typeChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: spacing.radiusMd,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeChipActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(146, 102, 153, 0.08)',
  },
  typeChipText: { ...typography.caption, color: colors.textLight, fontSize: 12 },
  typeChipTextActive: { color: colors.accent, fontWeight: '800' },

  // 可进入区域 — 3 个一行
  entryAreaRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  entryAreaCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusPill,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  entryAreaCardActive: {
    borderColor: colors.secondary,
    backgroundColor: colors.primary,
  },
  entryAreaText: { ...typography.bodyBold, color: colors.textMain, fontSize: 13 },
  entryAreaTextActive: { color: colors.secondary },

  // 配套设施
  label: { ...typography.bodyBold, color: colors.textMain, marginTop: 8, marginBottom: 4 },
  req: { color: colors.danger },
  hint: { ...typography.caption, color: colors.textLight, marginBottom: 8 },

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

  // 照片
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
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: spacing.radiusMd,
    overflow: 'hidden',
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

  // 补充说明
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
