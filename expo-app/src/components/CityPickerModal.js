import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { getProvinces, getCitiesByProvince } from '../data/cityData';

export default function CityPickerModal({ visible, province, city, onConfirm, onCancel }) {
  const provinces = useMemo(() => getProvinces(), []);

  const [pendingProvince, setPendingProvince] = useState(province || null);
  const [pendingCity, setPendingCity] = useState(city || null);

  // 打开时回填上次确认的值
  useEffect(() => {
    if (visible) {
      setPendingProvince(province || null);
      setPendingCity(city || null);
    }
  }, [visible, province, city]);

  const cities = useMemo(() => {
    if (!pendingProvince) return [];
    if (pendingProvince === '不展示') return ['不展示'];
    return getCitiesByProvince(pendingProvince);
  }, [pendingProvince]);

  const handleProvincePress = (p) => {
    setPendingProvince(p);
    setPendingCity(null);
  };

  const handleCityPress = (c) => {
    setPendingCity(c);
  };

  const handleReset = () => {
    setPendingProvince(null);
    setPendingCity(null);
  };

  const handleConfirm = () => {
    onConfirm({ province: pendingProvince, city: pendingCity });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestCancel={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>选择城市</Text>
            <TouchableOpacity onPress={onCancel} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={colors.textMain} />
            </TouchableOpacity>
          </View>

          {/* Body: left-right columns */}
          <View style={styles.body}>
            {/* Left: province list */}
            <View style={styles.leftColumn}>
              <FlatList
                data={['不展示', ...provinces]}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
                renderItem={({ item: p }) => {
                  const isActive = p === pendingProvince;
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

            {/* Right: city list */}
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

          {/* Footer */}
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
