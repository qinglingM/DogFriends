import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { MapPlaceholder, DogAvatar } from '../../components';

const MOCK_DOGS = [
  { id: '1', name: '旺财', selected: true },
  { id: '2', name: '小白', selected: true },
  { id: '3', name: '豆豆', selected: false },
];

export default function WalkHomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [dogs, setDogs] = useState(MOCK_DOGS);

  const toggleDog = (id) => {
    setDogs(prev => {
      const dog = prev.find(d => d.id === id);
      if (dog && dog.selected) {
        const selectedCount = prev.filter(d => d.selected).length;
        if (selectedCount <= 1) return prev;
      }
      return prev.map(d => d.id === id ? { ...d, selected: !d.selected } : d);
    });
  };

  const selectedDogs = dogs.filter(d => d.selected);

  return (
    <View style={styles.container}>
      <View style={styles.mapArea}>
        <MapPlaceholder
          height="100%"
          label="高德地图 · 全屏区域"
          sublabel="集成 react-native-amap3d 后替换"
          style={{ borderRadius: 0 }}
        />

        <View style={[styles.locationDot, { top: '50%', left: '50%' }]} />

        <View style={[styles.floatTop, { paddingTop: insets.top + 8 }]}>
          <View style={styles.weekBar}>
            <View style={styles.weekItem}>
              <Ionicons name="paw" size={14} color={colors.primary} />
              <Text style={styles.weekVal}>5</Text>
              <Text style={styles.weekUnit}>次</Text>
            </View>
            <View style={[styles.weekItem, styles.weekDivider]}>
              <Ionicons name="trending-up" size={14} color={colors.primary} />
              <Text style={styles.weekVal}>12.6</Text>
              <Text style={styles.weekUnit}>km</Text>
            </View>
            <View style={[styles.weekItem, styles.weekDivider]}>
              <Ionicons name="time-outline" size={14} color={colors.primary} />
              <Text style={styles.weekVal}>3.5</Text>
              <Text style={styles.weekUnit}>h</Text>
            </View>
          </View>
        </View>

        <View style={styles.mapBottomRight}>
          <TouchableOpacity style={styles.recenterBtn} activeOpacity={0.7}>
            <Ionicons name="locate" size={22} color={colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.floatBottom, { paddingBottom: 16 + insets.bottom }]}>
        <TouchableOpacity
          style={styles.startButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('WalkTracking')}
        >
          <View style={styles.dogAvatarsRow}>
            {selectedDogs.slice(0, 3).map((dog, i) => (
              <TouchableOpacity
                key={dog.id}
                style={[styles.avatarWrapper, i > 0 && { marginLeft: -8 }]}
                onPress={(e) => { e.stopPropagation?.(); toggleDog(dog.id); }}
                activeOpacity={0.7}
              >
                <DogAvatar size={48} />
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={10} color={colors.white} />
                </View>
              </TouchableOpacity>
            ))}
            {selectedDogs.length > 3 && (
              <View style={[styles.avatarOverflow, { marginLeft: -8 }]}>
                <Text style={styles.avatarOverflowText}>+{selectedDogs.length - 3}</Text>
              </View>
            )}
          </View>
          <Text style={styles.startLabel}>开始遛狗</Text>
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dogToggleRow}
        >
          {dogs.map(dog => (
            <TouchableOpacity
              key={dog.id}
              onPress={() => toggleDog(dog.id)}
              activeOpacity={0.7}
              style={[styles.dogToggle, dog.selected && styles.dogToggleActive]}
            >
              <DogAvatar size={20} />
              <Text style={[styles.dogToggleName, dog.selected && styles.dogToggleNameActive]}>
                {dog.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EDE4',
  },
  mapArea: {
    flex: 1,
    position: 'relative',
  },
  locationDot: {
    position: 'absolute',
    width: 24,
    height: 24,
    marginTop: -12,
    marginLeft: -12,
    backgroundColor: colors.primary,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 5,
  },
  weekBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: spacing.radiusPill,
    paddingVertical: 6,
    paddingHorizontal: 8,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  weekItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  weekDivider: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  weekVal: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.secondary,
  },
  weekUnit: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textLight,
  },
  mapBottomRight: {
    position: 'absolute',
    right: 16,
    bottom: 140,
    zIndex: 5,
  },
  recenterBtn: {
    width: 48,
    height: 48,
    backgroundColor: colors.white,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  floatBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: 'center',
    gap: 10,
    zIndex: 10,
  },
  startButton: {
    width: '100%',
    backgroundColor: colors.secondary,
    borderRadius: spacing.radiusLg,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 8,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  dogAvatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  avatarOverflow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOverflowText: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.white,
  },
  startLabel: {
    ...typography.button,
    color: colors.white,
    fontSize: 16,
  },
  dogToggleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dogToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: spacing.radiusPill,
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  dogToggleActive: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
  },
  dogToggleName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
  },
  dogToggleNameActive: {
    color: colors.secondary,
  },
});
