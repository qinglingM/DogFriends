import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { getProvinces, getCitiesByProvince } from '../data/cityData';

const HOT_CITIES = ['上海', '北京', '广州', '深圳', '杭州', '成都', '武汉', '南京'];
const HOT_ROWS = [HOT_CITIES.slice(0, 4), HOT_CITIES.slice(4, 8)];

export default function CityPickerModal({ visible, province, city, onConfirm, onCancel, mode = 'profile' }) {
  const isExplore = mode === 'explore';
  const provinces = useMemo(() => getProvinces(), []);

  const [pendingProvince, setPendingProvince] = useState(province || null);
  const [pendingCity, setPendingCity] = useState(city || null);

  useEffect(() => {
    if (visible) {
      setPendingProvince(province || null);
      setPendingCity(city || null);
    }
  }, [visible, province, city]);

  const cities = useMemo(() => {
    if (!pendingProvince || pendingProvince === '全部城市') return [];
    return getCitiesByProvince(pendingProvince);
  }, [pendingProvince]);

  const handleProvincePress = (p) => {
    if (p === '全部城市') {
      onConfirm({ province: null, city: null });
      return;
    }
    setPendingProvince(p);
    setPendingCity(null);
  };

  const handleCityPress = (c) => {
    setPendingCity(c);
  };

  const handleConfirm = () => {
    onConfirm({ province: pendingProvince, city: pendingCity });
  };

  const handleHotCity = (c) => {
    onConfirm({ province: null, city: c });
  };

  const handleReset = () => {
    setPendingProvince(null);
    setPendingCity(null);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestCancel={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={[styles.container, isExplore && styles.containerExplore]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>选择城市</Text>
            <TouchableOpacity onPress={onCancel} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={colors.textMain} />
            </TouchableOpacity>
          </View>

          {isExplore && (
            <View style={styles.hotGrid}>
              {HOT_ROWS.map((row, ri) => (
                <View key={ri} style={styles.hotRow}>
                  {row.map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.hotChip, city === c && styles.hotChipActive]}
                      activeOpacity={0.7}
                      onPress={() => handleHotCity(c)}
                    >
                      <Text style={[styles.hotChipText, city === c && styles.hotChipTextActive]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          )}

          <View style={styles.body}>
            <View style={styles.leftColumn}>
              <FlatList
                data={isExplore ? ['全部城市', ...provinces] : provinces}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
                renderItem={({ item: p }) => {
                  const isActive = isExplore ? p === pendingProvince : p === pendingProvince;
                  return (
                    <TouchableOpacity
                      style={[styles.provinceItem, isActive && styles.provinceItemActive]}
                      activeOpacity={0.7}
                      onPress={() => handleProvincePress(p)}
                    >
                      <Text style={[styles.provinceText, isActive && styles.provinceTextActive]}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>

            <View style={styles.rightColumn}>
              {pendingProvince ? (
                <FlatList
                  data={cities}
                  keyExtractor={(item) => item}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item: c }) => {
                    const isActive = c === pendingCity;
                    return (
                      <TouchableOpacity
                        style={[styles.cityItem, isActive && styles.cityItemActive]}
                        activeOpacity={0.7}
                        onPress={() => handleCityPress(c)}
                      >
                        <Text style={[styles.cityText, isActive && styles.cityTextActive]}>
                          {c}
                        </Text>
                        {isActive && <Ionicons name="checkmark" size={16} color={colors.white} />}
                      </TouchableOpacity>
                    );
                  }}
                />
              ) : (
                <View style={styles.cityEmpty}>
                  <Text style={styles.cityEmptyText}>请先选择省份</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetBtn} activeOpacity={0.7} onPress={handleReset}>
              <Text style={styles.resetBtnText}>重置</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, !pendingCity && styles.confirmBtnDisabled]}
              activeOpacity={0.7}
              onPress={handleConfirm}
              disabled={!pendingCity}
            >
              <Text style={styles.confirmBtnText}>确定</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: spacing.radiusLg,
    borderTopRightRadius: spacing.radiusLg,
    height: '70%',
  },
  containerExplore: {
    height: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h3, color: colors.secondary },
  hotGrid: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    gap: 8,
  },
  hotRow: {
    flexDirection: 'row', gap: 8,
  },
  hotChip: {
    flex: 1, alignItems: 'center', paddingVertical: 6,
    borderRadius: spacing.radiusSm,
    backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.border,
  },
  hotChipActive: {
    backgroundColor: colors.secondary, borderColor: colors.secondary,
  },
  hotChipText: { ...typography.caption, color: colors.textMain, fontSize: 12 },
  hotChipTextActive: { color: colors.white },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  leftColumn: {
    width: 140,
    backgroundColor: colors.chipDefault,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  rightColumn: {
    flex: 1,
    backgroundColor: colors.white,
  },
  provinceItem: {
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  provinceItemActive: {
    backgroundColor: colors.secondary,
  },
  provinceText: {
    ...typography.body,
    color: colors.textMain,
  },
  provinceTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cityItemActive: {
    backgroundColor: colors.secondary,
  },
  cityText: {
    ...typography.body,
    color: colors.textMain,
  },
  cityTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  cityEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityEmptyText: {
    ...typography.body,
    color: colors.textLight,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resetBtn: {
    flex: 1,
    height: spacing.touchTarget,
    borderRadius: spacing.radiusMd,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  resetBtnText: { ...typography.bodyBold, color: colors.textLight },
  confirmBtn: {
    flex: 1,
    height: spacing.touchTarget,
    borderRadius: spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
  },
  confirmBtnDisabled: {
    backgroundColor: colors.border,
  },
  confirmBtnText: { ...typography.bodyBold, color: colors.white },
});
