import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { MapPlaceholder, Button, DogAvatar } from '../../components';

const { width } = Dimensions.get('window');

const MOCK_DOGS = [
  { id: '1', name: '旺财', selected: true },
  { id: '2', name: '小白', selected: true },
  { id: '3', name: '豆豆', selected: false },
];

export default function WalkHomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [dogs, setDogs] = useState(MOCK_DOGS);

  const toggleDog = (id) => {
    setDogs(dogs.map(d => d.id === id ? { ...d, selected: !d.selected } : d));
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

        <View style={[styles.locationDot, {
          top: '50%',
          left: '50%',
        }]} />

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

        <TouchableOpacity style={styles.recenterBtn}>
          <Ionicons name="locate" size={24} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.floatBottom, { paddingBottom: 16 + insets.bottom }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dogSelectRow}
        >
          {dogs.map(dog => (
            <TouchableOpacity
              key={dog.id}
              onPress={() => toggleDog(dog.id)}
              style={[styles.dogChip, dog.selected && styles.dogChipSelected]}
            >
              <DogAvatar size={32} />
              <Text style={styles.dogChipName}>{dog.name}</Text>
              <View style={[styles.checkCircle, dog.selected && styles.checkCircleActive]}>
                {dog.selected && <Ionicons name="checkmark" size={12} color={colors.white} />}
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.addDogChip}
            onPress={() => navigation.navigate('Profile', { screen: 'DogEdit' })}
          >
            <Ionicons name="add" size={14} color={colors.textLight} />
          </TouchableOpacity>
        </ScrollView>

        <Button
          onPress={() => navigation.navigate('WalkTracking')}
          icon={<Ionicons name="play" size={20} color={colors.secondary} />}
          style={styles.startBtn}
        >
          开始遛狗
        </Button>
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
  recenterBtn: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -24,
    width: 48,
    height: 48,
    backgroundColor: colors.white,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    zIndex: 5,
  },
  floatBottom: {
    position: 'absolute',
    bottom: 72,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 12,
    zIndex: 5,
  },
  dogSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dogChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusPill,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 14,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dogChipSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(185, 207, 50, 0.12)',
  },
  dogChipName: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.secondary,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  addDogChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  startBtn: {
    paddingHorizontal: 48,
  },
});
