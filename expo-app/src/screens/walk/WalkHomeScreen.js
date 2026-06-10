import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
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
        <View style={styles.dogAvatarsRow}>
          {dogs.map(dog => (
            <TouchableOpacity
              key={dog.id}
              style={styles.dogItem}
              onPress={() => toggleDog(dog.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.avatarRing, dog.selected && styles.avatarRingActive]}>
                <DogAvatar size={52} />
              </View>
              <Text style={[styles.dogName, dog.selected && styles.dogNameActive]}>
                {dog.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.goButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('WalkTracking')}
        >
          <Text style={styles.goText}>GO</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: 'center',
    gap: 16,
    zIndex: 10,
  },
  dogAvatarsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  dogItem: {
    alignItems: 'center',
    gap: 6,
  },
  avatarRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarRingActive: {
    borderColor: colors.primary,
  },
  dogName: {
    ...typography.caption,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  dogNameActive: {
    color: colors.white,
    fontWeight: '700',
  },
  goButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: spacing.radiusPill,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  goText: {
    ...typography.button,
    color: colors.white,
    fontSize: 18,
    letterSpacing: 2,
  },
});
