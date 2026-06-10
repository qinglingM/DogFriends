import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { MapPlaceholder, DogAvatar } from '../../components';
import { useWalk } from '../../contexts/WalkContext';

export default function WalkTrackingScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [photos, setPhotos] = useState([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { updateWalk, addPhoto, currentWalk } = useWalk();
  const dogs = currentWalk?.dogs || [];

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 750, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 750, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleCamera = () => {
    const newPhoto = { id: Date.now(), time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) };
    setPhotos(prev => [...prev, newPhoto]);
    addPhoto(newPhoto);
  };

  const handleStop = () => {
    updateWalk({ duration: seconds, distance: 0, pace: 0 });
    navigation.navigate('WalkCheckin');
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapArea}>
        <MapPlaceholder
          height="100%"
          label="实时轨迹绘制区域"
          sublabel="GPS 坐标连续打点 → 折线绘制"
          style={{ borderRadius: 0 }}
        />

        <View style={styles.locationDot} />

        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <View style={styles.statusRow}>
            <View style={styles.statusPill}>
              <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
              <Text style={styles.statusText}>遛狗中</Text>
            </View>
            <View style={styles.dogPills}>
              {dogs.map((dog, i) => (
                <View key={dog.id || i} style={styles.dogPill}>
                  <DogAvatar size={20} />
                  <Text style={styles.dogPillName}>{dog.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={[styles.statsRow, { top: insets.top + 56 }]}>
          <View style={styles.statBox}>
            <Text style={styles.statTime}>{formatTime(seconds)}</Text>
            <Text style={styles.statTimeLabel}>时间</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>距离</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>配速</Text>
          </View>
        </View>

        <View style={[styles.bottomArea, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.controlRow}>
            <View style={styles.controlGroup}>
              <TouchableOpacity
                style={styles.controlBtn}
                onPress={() => setIsPaused(!isPaused)}
              >
                <Ionicons name={isPaused ? 'play' : 'pause'} size={24} color={colors.secondary} />
              </TouchableOpacity>
              <Text style={styles.controlLabel}>{isPaused ? '继续' : '暂停'}</Text>
            </View>

            <View style={styles.controlGroup}>
              <TouchableOpacity style={styles.controlBtn} onPress={handleStop}>
                <View style={styles.stopCircle}>
                  <Ionicons name="stop" size={26} color={colors.white} />
                </View>
              </TouchableOpacity>
              <Text style={styles.controlLabel}>结束</Text>
            </View>

            <View style={styles.controlGroup}>
              <View style={styles.cameraWrap}>
                <TouchableOpacity style={styles.controlBtn} onPress={handleCamera}>
                  <Ionicons name="camera" size={24} color={colors.secondary} />
                </TouchableOpacity>
                {photos.length > 0 && (
                  <View style={styles.galleryBadge}>
                    <Text style={styles.galleryBadgeText}>{photos.length}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.controlLabel}>拍照</Text>
            </View>
          </View>


        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8EDE4' },
  mapArea: { flex: 1, position: 'relative' },
  locationDot: {
    position: 'absolute', top: '50%', left: '50%',
    width: 24, height: 24, marginTop: -12, marginLeft: -12,
    backgroundColor: colors.primary, borderRadius: 12,
    borderWidth: 3, borderColor: colors.white,
    shadowColor: colors.secondary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingHorizontal: 16, zIndex: 5,
  },
  statusRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary, borderRadius: spacing.radiusPill,
    paddingVertical: 6, paddingHorizontal: 12,
  },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.secondary },
  statusText: { ...typography.captionBold, fontSize: 12, color: colors.secondary },
  dogPills: { flexDirection: 'row', gap: 6 },
  dogPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.white, borderRadius: spacing.radiusPill,
    paddingVertical: 4, paddingLeft: 4, paddingRight: 10,
  },
  dogPillName: { ...typography.caption, fontSize: 12, color: colors.secondary },
  statsRow: {
    position: 'absolute', left: 16, right: 16,
    flexDirection: 'row', gap: 8, zIndex: 5,
  },
  statBox: {
    flex: 1, backgroundColor: colors.white, borderRadius: spacing.radiusMd,
    paddingVertical: 10, alignItems: 'center',
    shadowColor: colors.secondary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  statTime: {
    ...typography.bodyBold, fontSize: 18, color: colors.secondary,
    fontVariant: ['tabular-nums'],
  },
  statTimeLabel: { fontSize: 10, fontWeight: '600', color: colors.textLight, marginTop: 1 },
  statValue: { ...typography.bodyBold, fontSize: 16, color: colors.secondary },
  statLabel: { fontSize: 10, fontWeight: '600', color: colors.textLight, marginTop: 1 },
  bottomArea: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    alignItems: 'center', zIndex: 5,
  },
  controlRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 24,
  },
  controlGroup: { alignItems: 'center', gap: 6 },
  cameraWrap: { position: 'relative' },
  controlBtn: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.secondary,
  },
  stopCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#C0392B',
  },
  controlLabel: {
    ...typography.captionBold, fontSize: 11, color: colors.white,
    backgroundColor: 'rgba(52, 112, 72, 0.7)',
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: spacing.radiusPill,
    overflow: 'hidden',
  },
  galleryBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.white,
  },
  galleryBadgeText: { fontSize: 9, fontWeight: '800', color: colors.secondary },
});
