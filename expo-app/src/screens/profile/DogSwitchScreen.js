import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { DogAvatar } from '../../components';

const MOCK_DOGS = [
  { id: '1', name: '旺财', breed: '金毛寻回犬 · ♂ · 32kg', active: true },
  { id: '2', name: '小白', breed: '萨摩耶 · ♀ · 22kg', active: false },
  { id: '3', name: '豆豆', breed: '柯基 · ♂ · 12kg', active: false },
];

export default function DogSwitchScreen({ navigation }) {
  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={() => navigation.goBack()} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>切换狗狗</Text>

        <View style={styles.list}>
          {MOCK_DOGS.map(dog => (
            <TouchableOpacity key={dog.id} style={[styles.item, dog.active && styles.itemActive]}>
              <DogAvatar size={48} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{dog.name}</Text>
                <Text style={styles.itemBreed}>{dog.breed}</Text>
              </View>
              <View style={[styles.check, dog.active && styles.checkActive]}>
                {dog.active && <Ionicons name="checkmark" size={14} color={colors.white} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.replace('DogEdit')}
        >
          <Ionicons name="add-circle-outline" size={24} color={colors.textLight} />
          <Text style={styles.addBtnText}>添加新狗狗</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: spacing.radiusLg,
    borderTopRightRadius: spacing.radiusLg,
    padding: spacing.md,
    paddingBottom: 24,
  },
  handle: {
    width: 40, height: 4, backgroundColor: colors.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: 24,
  },
  title: {
    ...typography.h3, color: colors.secondary,
    textAlign: 'center', marginBottom: 24,
  },
  list: { gap: 8, marginBottom: 24 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    padding: spacing.md, backgroundColor: colors.white,
    borderRadius: spacing.radiusMd, borderWidth: 2, borderColor: 'transparent',
  },
  itemActive: { borderColor: colors.primary, backgroundColor: 'rgba(185, 207, 50, 0.08)' },
  itemInfo: { flex: 1 },
  itemName: { ...typography.bodyBold, fontSize: 16, color: colors.secondary, marginBottom: 2 },
  itemBreed: { ...typography.caption, color: colors.textLight },
  check: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: spacing.md,
    backgroundColor: colors.white, borderRadius: spacing.radiusMd,
    borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed',
    minHeight: 56,
  },
  addBtnText: { ...typography.bodyBold, color: colors.textLight },
});
