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

        <View style={[styles.topBar, { paddingTop: insets.top + 16 }]}>
          <View style={styles.topRow}>
            <View style={styles.dogPills}>
              <View style={styles.dogPill}>
                <DogAvatar size={32} />
                <Text style={styles.dogPillName}>旺财</Text>
              </View>
              <View style={styles.dogPill}>
                <DogAvatar size={32} />
                <Text style={styles.dogPillName}>小白</Text>
              </View>
            </View>
            <View style={styles.statusPill}>
              <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
              <Text style={styles.statusText}>遛狗中</Text>
            </View>
          </View>
        </View>

        <View style={[styles.timerBar, { top: insets.top + 80 }]}>
          <View style={styles.timerDisplay}>
            <Ionicons name="timer-outline" size={20} color={colors.primary} />
            <Text style={styles.timerText}>{formatTime(seconds)}</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Ionicons name="trending-up" size={16} color={colors.primary} />
              <Text style={styles.statText}>1.8 km</Text>
            </View>
            <View style={styles.statPill}>
              <Ionicons name="speedometer-outline" size={16} color={colors.primary} />
              <Text style={styles.statText}>4.6 km/h</Text>
            </View>
          </View>
        </View>

        <View style={styles.photoStrip}>
          <View style={styles.photoThumb}>
            <Ionicons name="image-outline" size={16} color={colors.secondary} style={{ opacity: 0.6 }} />
            <Text style={styles.thumbTime}>10:23</Text>
          </View>
          <View style={styles.photoThumb}>
            <Ionicons name="image-outline" size={16} color={colors.secondary} style={{ opacity: 0.6 }} />
            <Text style={styles.thumbTime}>10:41</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.cameraBtn}>
          <Ionicons name="camera" size={24} color={colors.secondary} />
          <View style={styles.photoBadge}>
            <Text style={styles.photoBadgeText}>2</Text>
          </View>
        </TouchableOpacity>

        <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => setIsPaused(!isPaused)}
            >
              <View style={styles.pauseCircle}>
                <Ionicons name={isPaused ? 'play' : 'pause'} size={24} color={colors.secondary} />
              </View>
              <Text style={styles.controlLabel}>{isPaused ? '继续' : '暂停'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => navigation.navigate('WalkSummary')}
            >
              <View style={styles.stopCircle}>
                <Ionicons name="stop" size={32} color={colors.white} />
              </View>
              <Text style={styles.controlLabel}>结束</Text>
            </TouchableOpacity>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dogPills: {
    flexDirection: 'row',
    gap: 8,
  },
  dogPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusPill,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 16,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  dogPillName: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.secondary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: spacing.radiusPill,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
  statusText: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.secondary,
  },
  timerBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 8,
    zIndex: 5,
  },
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    paddingVertical: 12,
    paddingHorizontal: 32,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  timerText: {
    ...typography.timer,
    color: colors.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusPill,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  statText: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.secondary,
  },
  photoStrip: {
    position: 'absolute',
    right: 16,
    bottom: 192,
    gap: 8,
    zIndex: 5,
  },
  photoThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#D3E0C8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  thumbTime: {
    position: 'absolute',
    bottom: -2,
    fontSize: 8,
    color: colors.white,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
    overflow: 'hidden',
  },
  cameraBtn: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    zIndex: 5,
  },
  photoBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  photoBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.secondary,
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
    alignItems: 'center',
    gap: 24,
  },
  controlBtn: {
    alignItems: 'center',
    gap: 8,
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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#C0392B',
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
