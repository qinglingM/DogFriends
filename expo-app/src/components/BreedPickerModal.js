import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { BREED_GROUPS } from '../data/breedData';

export default function BreedPickerModal({ visible, breed, onConfirm, onCancel }) {
  const [search, setSearch] = useState('');
  const [pendingBreed, setPendingBreed] = useState(breed || '');

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return BREED_GROUPS;
    const q = search.trim().toLowerCase();
    return BREED_GROUPS.map(g => ({
      ...g,
      breeds: g.breeds.filter(b => b.toLowerCase().includes(q)),
    })).filter(g => g.breeds.length > 0);
  }, [search]);

  const handleConfirm = () => {
    onConfirm(pendingBreed);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestCancel={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>选择品种</Text>
            <TouchableOpacity onPress={onCancel} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={colors.textMain} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={colors.textLight} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="搜索品种"
              placeholderTextColor={colors.textLight}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={colors.textLight} />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filteredGroups}
            keyExtractor={g => g.label}
            contentContainerStyle={styles.listContent}
            renderItem={({ item: group }) => (
              <View>
                <Text style={styles.groupLabel}>{group.label}</Text>
                {group.breeds.map(b => (
                  <TouchableOpacity
                    key={b}
                    style={[styles.breedItem, pendingBreed === b && styles.breedItemActive]}
                    activeOpacity={0.7}
                    onPress={() => setPendingBreed(b)}
                  >
                    <Text style={[styles.breedText, pendingBreed === b && styles.breedTextActive]}>
                      {b}
                    </Text>
                    {pendingBreed === b && (
                      <Ionicons name="checkmark" size={18} color={colors.secondary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.confirmBtn, !pendingBreed && styles.confirmBtnDisabled]}
              disabled={!pendingBreed}
              activeOpacity={0.7}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmText}>确定</Text>
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
    maxHeight: '75%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h3, color: colors.textMain },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: spacing.md,
    marginBottom: 0,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textMain,
    padding: 0,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 0,
  },
  groupLabel: {
    ...typography.captionBold,
    color: colors.textLight,
    marginBottom: 8,
    marginTop: 12,
  },
  breedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    marginBottom: 6,
  },
  breedItemActive: {
    backgroundColor: 'rgba(185, 207, 50, 0.1)',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  breedText: { ...typography.body, color: colors.textMain },
  breedTextActive: { color: colors.secondary, fontWeight: '700' },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  confirmBtn: {
    height: spacing.touchTarget,
    borderRadius: spacing.radiusMd,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: colors.border,
  },
  confirmText: { ...typography.bodyBold, color: colors.white },
});
