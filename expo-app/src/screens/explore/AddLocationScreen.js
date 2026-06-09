import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, Button } from '../../components';
import {
  ENTRY_AREAS,
  DOG_SIZES,
  BEHAVIOR_REQUIREMENTS,
  FACILITIES,
  DISCOVERY_REASONS,
  LOCATION_STATUS,
  MOCK_DETECTED_LOCATION,
  MOCK_NEARBY_POIS,
  CATEGORIES,
} from '../../data/exploreData';
import { useExplore } from '../../contexts/ExploreContext';

export default function AddLocationScreen({ navigation }) {
  const { addLocation } = useExplore();

  // ---- 地点定位 ----
  const [picked, setPicked] = useState(null);          // {name, category, categoryLabel, city, district, address, source}
  const [detecting, setDetecting] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // ---- 宠物规则 ----
  const [entryArea, setEntryArea] = useState(null);
  const [dogSize, setDogSize] = useState([]);
  const [behaviors, setBehaviors] = useState([]);
  const [facilities, setFacilities] = useState([]);

  // ---- 现场照片 & 补充 ----
  const [photos, setPhotos] = useState([]);
  const [note, setNote] = useState('');
  const [discovery, setDiscovery] = useState(null);
  const [acceptNotice, setAcceptNotice] = useState(true);

  const toggle = (arr, set, item) => set(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);
  const addMockPhoto = () => setPhotos(p => [...p, Date.now() + Math.random()]);
  const removePhoto = (i) => setPhotos(p => p.filter((_, idx) => idx !== i));

  const useCurrentLocation = () => {
    setDetecting(true);
    setTimeout(() => {
      setPicked(MOCK_DETECTED_LOCATION);
      setDetecting(false);
    }, 700);
  };

  const choosePOI = (poi) => {
    setPicked({ ...poi, source: 'poi' });
    setSearchOpen(false);
  };

  const updatePickedName = (name) => setPicked(p => p ? { ...p, name } : p);
  const updatePickedCategory = (key) => {
    const cat = CATEGORIES.find(c => c.key === key);
    setPicked(p => p ? { ...p, category: key, categoryLabel: cat?.label || p.categoryLabel } : p);
  };

  const canPublish =
    picked &&
    picked.name?.trim() &&
    picked.category &&
    entryArea &&
    dogSize.length > 0 &&
    photos.length >= 1;

  const publish = () => {
    const id = `loc_${Date.now()}`;
    const entryLabel = ENTRY_AREAS.find(e => e.key === entryArea)?.label;
    const sizeLabels = dogSize.map(k => DOG_SIZES.find(s => s.key === k)?.label).filter(Boolean);
    const tags = [entryLabel, sizeLabels[0], facilities[0]].filter(Boolean).slice(0, 3);

    addLocation({
      id,
      name: picked.name.trim(),
      category: picked.category,
      categoryLabel: picked.categoryLabel || '其他',
      district: picked.district,
      distanceKm: 1.0,
      address: picked.address,
      phone: '',
      hours: '',
      entryArea,
      dogSize,
      behaviors,
      facilities,
      tags,
      status: LOCATION_STATUS.USER_SUBMITTED,
      verifierCount: 0,
      lastUpdatedLabel: '刚刚发布',
      description: note,
      photos: photos.length,
      discovery,
      acceptNotice,
    });
    navigation.replace('AddLocationSuccess', { locationId: id });
  };

  return (
    <View style={styles.screen}>
      <NavBar title="新增我去过的地点" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tipCard}>
          <Ionicons name="information-circle" size={18} color={colors.secondary} />
          <Text style={styles.tipText}>
            请只提交你真实去过、确认可以带狗的地点。信息会直接发布，请尽量填写准确。
          </Text>
        </View>

        {/* 1. 地点定位 */}
        <Text style={styles.sectionTitle}>📍 地点定位</Text>

        <View style={styles.mapBox}>
          <View style={styles.mapGrid}>
            {[...Array(6)].map((_, r) => (
              <View key={r} style={styles.mapRow}>
                {[...Array(4)].map((_, c) => (
                  <View key={c} style={styles.mapCell} />
                ))}
              </View>
            ))}
          </View>
          <View style={styles.mapPinWrap}>
            <Ionicons name="location" size={44} color={colors.danger} />
          </View>
          <View style={styles.mapBadge}>
            <Ionicons name="navigate-circle" size={12} color={colors.secondary} />
            <Text style={styles.mapBadgeText}>上海 · 徐汇区</Text>
          </View>
        </View>

        <View style={styles.mapActions}>
          <Button
            variant="secondary"
            style={{ flex: 1 }}
            loading={detecting}
            onPress={useCurrentLocation}
            icon={!detecting ? <Ionicons name="locate" size={16} color={colors.secondary} /> : null}
          >
            使用我当前的位置
          </Button>
          <Button
            style={{ flex: 1 }}
            onPress={() => setSearchOpen(true)}
            icon={<Ionicons name="search" size={16} color={colors.secondary} />}
          >
            搜附近地点
          </Button>
        </View>

        {picked ? (
          <View style={styles.pickedCard}>
            <View style={styles.pickedHeader}>
              <View style={styles.pickedDot}>
                <Ionicons name="checkmark" size={14} color={colors.white} />
              </View>
              <Text style={styles.pickedSource}>
                {picked.source === 'current_location' ? '已识别当前位置' : '已选择附近地点'}
              </Text>
              <TouchableOpacity onPress={() => setPicked(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.pickedRetry}>换一个</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.pickedNameInput}
              value={picked.name}
              onChangeText={updatePickedName}
              placeholder="这个地方叫什么？"
              placeholderTextColor={colors.textLight}
            />
            <Text style={styles.pickedAddr}>{picked.address}</Text>

            <Text style={styles.pickedLabel}>类型</Text>
            <View style={styles.typeChipRow}>
              {CATEGORIES.filter(c => c.key !== 'all').map(c => {
                const active = picked.category === c.key;
                return (
                  <TouchableOpacity
                    key={c.key}
                    onPress={() => updatePickedCategory(c.key)}
                    style={[styles.typeChip, active && styles.typeChipActive]}
                  >
                    <Ionicons name={c.icon} size={14} color={active ? colors.secondary : colors.textLight} />
                    <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>{c.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.emptyPicked}>
            <Text style={styles.emptyPickedText}>
              点上方按钮，地图选点或搜索后会自动识别地点名称与地址
            </Text>
          </View>
        )}

        {/* 2. 宠物规则 */}
        <Text style={styles.sectionTitle}>🐶 宠物规则</Text>

        <Text style={styles.label}>狗狗可进入区域 <Text style={styles.req}>*</Text></Text>
        <View style={styles.optionGrid}>
          {ENTRY_AREAS.map(opt => {
            const active = entryArea === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setEntryArea(opt.key)}
                style={[styles.optionCard, active && styles.optionCardActive]}
              >
                {active && <Ionicons name="checkmark-circle" size={14} color={colors.secondary} style={{ marginRight: 6 }} />}
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>适合的狗狗 <Text style={styles.req}>*</Text></Text>
        <View style={styles.optionGrid}>
          {DOG_SIZES.map(opt => {
            const active = dogSize.includes(opt.key);
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => toggle(dogSize, setDogSize, opt.key)}
                style={[styles.optionCard, active && styles.optionCardActive]}
              >
                {active && <Ionicons name="checkmark-circle" size={14} color={colors.secondary} style={{ marginRight: 6 }} />}
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>行为要求</Text>
        <Text style={styles.hint}>可多选，选填</Text>
        <View style={styles.optionGrid}>
          {BEHAVIOR_REQUIREMENTS.map(opt => {
            const active = behaviors.includes(opt);
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => toggle(behaviors, setBehaviors, opt)}
                style={[styles.optionCard, active && styles.optionCardActive]}
              >
                {active && <Ionicons name="checkmark-circle" size={14} color={colors.secondary} style={{ marginRight: 6 }} />}
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>配套设施</Text>
        <Text style={styles.hint}>可多选，选填</Text>
        <View style={styles.optionGrid}>
          {FACILITIES.map(opt => {
            const active = facilities.includes(opt);
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => toggle(facilities, setFacilities, opt)}
                style={[styles.optionCard, active && styles.optionCardActive]}
              >
                {active && <Ionicons name="checkmark-circle" size={14} color={colors.secondary} style={{ marginRight: 6 }} />}
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 3. 现场照片 & 补充 */}
        <Text style={styles.sectionTitle}>📸 现场照片 & 补充</Text>

        <Text style={styles.label}>上传图片 <Text style={styles.req}>*</Text></Text>
        <Text style={styles.hint}>至少 1 张。门店入口 / 室内环境 / 户外座位 / 宠物友好标识等</Text>
        <View style={styles.photoRow}>
          {photos.map((p, idx) => (
            <View key={p} style={styles.photoBox}>
              <Ionicons name="image" size={32} color={colors.secondary} style={{ opacity: 0.5 }} />
              <TouchableOpacity style={styles.removePhoto} onPress={() => removePhoto(idx)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={[styles.photoBox, styles.addBox]} onPress={addMockPhoto}>
            <Ionicons name="add" size={28} color={colors.secondary} />
            <Text style={styles.addText}>添加</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>补充说明</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={note}
          onChangeText={setNote}
          placeholder="分享一些你对这个地方的真实体验吧～"
          placeholderTextColor={colors.textLight}
          multiline
        />

        <Text style={styles.label}>你是如何发现这个地方的？</Text>
        <View style={styles.optionGrid}>
          {DISCOVERY_REASONS.map(opt => {
            const active = discovery === opt;
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => setDiscovery(opt)}
                style={[styles.optionCard, active && styles.optionCardActive]}
              >
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { marginTop: 0 }]}>接收互动提醒</Text>
            <Text style={styles.hint}>开启后收到多人验证、有用反馈、信息争议等提醒</Text>
          </View>
          <Switch
            value={acceptNotice}
            onValueChange={setAcceptNotice}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>
      </ScrollView>

      <View style={styles.bottomAction}>
        <Button fullWidth disabled={!canPublish} onPress={publish}>
          发布地点
        </Button>
      </View>

      {/* 搜附近地点 sheet */}
      <Modal visible={searchOpen} transparent animationType="slide" onRequestClose={() => setSearchOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setSearchOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>搜附近地点</Text>
          <Text style={styles.sheetSub}>选择一个，会自动填入地点名和地址</Text>

          <ScrollView style={{ maxHeight: 400 }}>
            {MOCK_NEARBY_POIS.map(poi => (
              <TouchableOpacity key={poi.poiId} style={styles.poiItem} onPress={() => choosePOI(poi)} activeOpacity={0.7}>
                <View style={styles.poiIconBox}>
                  <Ionicons
                    name={CATEGORIES.find(c => c.key === poi.category)?.icon || 'location'}
                    size={20}
                    color={colors.secondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.poiName}>{poi.name}</Text>
                  <Text style={styles.poiMeta}>{poi.categoryLabel} · {poi.distanceLabel}</Text>
                  <Text style={styles.poiAddr}>{poi.address}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 120 },

  tipCard: {
    flexDirection: 'row',
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

  // map
  mapBox: {
    height: 200,
    borderRadius: spacing.radiusMd,
    backgroundColor: '#DCE5D4',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
  },
  mapGrid: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.4 },
  mapRow: { flexDirection: 'row', flex: 1 },
  mapCell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#B7C7AD',
  },
  mapPinWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -22 }, { translateY: -40 }],
  },
  mapBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: spacing.radiusPill,
  },
  mapBadgeText: { ...typography.captionBold, color: colors.secondary },

  mapActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  pickedCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  pickedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  pickedDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickedSource: { ...typography.captionBold, color: colors.secondary, flex: 1 },
  pickedRetry: { ...typography.captionBold, color: colors.textLight, textDecorationLine: 'underline' },

  pickedNameInput: {
    ...typography.h3,
    color: colors.textMain,
    paddingVertical: 4,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 6,
  },
  pickedAddr: { ...typography.caption, color: colors.textLight, marginBottom: 12 },
  pickedLabel: { ...typography.captionBold, color: colors.textMain, marginBottom: 6 },

  typeChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.chipDefault,
  },
  typeChipActive: {
    backgroundColor: colors.primary,
  },
  typeChipText: { ...typography.captionBold, color: colors.textLight },
  typeChipTextActive: { color: colors.secondary },

  emptyPicked: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 8,
  },
  emptyPickedText: { ...typography.caption, color: colors.textLight, textAlign: 'center' },

  label: { ...typography.bodyBold, color: colors.textMain, marginTop: 16, marginBottom: 4 },
  req: { color: colors.danger },
  hint: { ...typography.caption, color: colors.textLight, marginBottom: 8 },

  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: 12,
    marginTop: 16,
  },

  bottomAction: {
    padding: spacing.md,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  // sheet
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: spacing.radiusLg,
    borderTopRightRadius: spacing.radiusLg,
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center', marginBottom: 12,
  },
  sheetTitle: { ...typography.h3, color: colors.textMain, marginBottom: 4 },
  sheetSub: { ...typography.caption, color: colors.textLight, marginBottom: 12 },
  poiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: 12,
    marginBottom: 8,
  },
  poiIconBox: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  poiName: { ...typography.bodyBold, color: colors.textMain },
  poiMeta: { ...typography.caption, color: colors.textLight, marginTop: 2 },
  poiAddr: { ...typography.caption, color: colors.textLight, marginTop: 2 },
});
