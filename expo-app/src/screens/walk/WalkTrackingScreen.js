import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { MapPlaceholder, DogAvatar } from '../../components';

export default function WalkTrackingScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [photos, setPhotos] = useState([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
    setPhotos(prev => [...prev, { id: Date.now(), time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }]);
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
              <View style={styles.dogPill}>
                <DogAvatar size={20} />
                <Text style={styles.dogPillName}>旺财</Text>
              </View>
              <View style={styles.dogPill}>
                <DogAvatar size={20} />
                <Text style={styles.dogPillName}>小白</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.statsRow, { top: insets.top + 56 }]}>
          <View style={styles.statBox}>
            <Text style={styles.statTime}>{formatTime(seconds)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>1.8</Text>
            <Text style={styles.statLabel}>km</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>4.6</Text>
            <Text style={styles.statLabel}>km/h</Text>
          </View>
        </View>

        <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.controlRow}>
            <View style={styles.controlGroup}>
              <TouchableOpacity
                style={styles.controlBtn}
                onPress={() => setIsPaused(!isPaused)}
              >
                <View style={styles.pauseCircle}>
                  <Ionicons name={isPaused ? 'play' : 'pause'} size={22} color={colors.secondary} />
                </View>
              </TouchableOpacity>
              <Text style={styles.controlLabel}>{isPaused ? '继续' : '暂停'}</Text>
            </View>

            <View style={styles.controlGroup}>
              <TouchableOpacity
                style={styles.controlBtn}
                onPress={() => navigation.navigate('WalkCheckin')}
              >
                <View style={styles.stopCircle}>
                  <Ionicons name="stop" size={24} color={colors.white} />
                </View>
              </TouchableOpacity>
              <Text style={styles.controlLabel}>结束</Text>
            </View>

            <View style={styles.controlGroup}>
              <TouchableOpacity style={styles.controlBtn} onPress={handleCamera}>
                <View style={styles.cameraCircle}>
                  <Ionicons name="camera" size={22} color={colors.secondary} />
                  {photos.length > 0 && (
                    <View style={styles.photoBadge}>
                      <Text style={styles.photoBadgeText}>{photos.length}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              <Text style={styles.controlLabel}>拍照</Text>
            </View>

            {photos.length > 0 && (
              <TouchableOpacity style={styles.galleryThumb} activeOpacity={0.7}>
                <View style={styles.galleryInner}>
                  <Ionicons name="images-outline" size={18} color={colors.secondary} />
                </View>
                <View style={styles.galleryBadge}>
                  <Text style={styles.galleryBadgeText}>{photos.length}</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
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
    top: '50%',
    left: '50%',
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
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 5,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: spacing.radiusPill,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.secondary,
  },
  statusText: {
    ...typography.captionBold,
    fontSize: 12,
    color: colors.secondary,
  },
  dogPills: {
    flexDirection: 'row',
    gap: 6,
  },
  dogPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusPill,
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: 10,
  },
  dogPillName: {
    ...typography.caption,
    fontSize: 12,
    color: colors.secondary,
  },
  statsRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
    zIndex: 5,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statTime: {
    ...typography.bodyBold,
    fontSize: 18,
    color: colors.secondary,
    fontVariant: ['tabular-nums'],
  },
  statValue: {
    ...typography.bodyBold,
    fontSize: 16,
    color: colors.secondary,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textLight,
    marginTop: 1,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
  },
  controlGroup: {
    alignItems: 'center',
    gap: 6,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  pauseCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  stopCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#C0392B',
  },
  cameraCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  controlLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  photoBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  photoBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.secondary,
  },
  galleryThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
    marginLeft: 4,
  },
  galleryInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D3E0C8',
  },
  galleryBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  galleryBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.secondary,
  },
});
