import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system/legacy';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { MapPlaceholder, DogAvatar } from '../../components';
import { useWalk } from '../../contexts/WalkContext';
import { useDogs } from '../../contexts/DogContext';
import { haversineDistance } from '../../utils/location';
import { takePhoto } from '../../utils/imagePicker';

const MAIN_BTN_SIZE = 72;
const SIDE_BTN_SIZE = 72;

export default function WalkHomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { getWeekStats, 加载完成, startWalk, updateWalk, addPhoto, currentWalk } = useWalk();
  const weekStats = getWeekStats();
  const { dogs: allDogs, 加载完成: 狗加载完成 } = useDogs();

  const [dogs, setDogs] = useState([]);
  const [isWalking, setIsWalking] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gpsDistance, setGpsDistance] = useState(0);
  const [photos, setPhotos] = useState([]);
  const gpsSub = useRef(null);
  const lastPosRef = useRef(null);
  const cumDistRef = useRef(0);
  const trackPointsRef = useRef([]);

  useEffect(() => {
    if (dogs.length === 0 && allDogs.length > 0) {
      setDogs(allDogs.map(d => ({ id: d.id, name: d.name, selected: true })));
    }
  }, [allDogs]);

  const pauseSlide = useRef(new Animated.Value(0)).current;
  const cameraSlide = useRef(new Animated.Value(0)).current;
  const mainBtnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isWalking || isPaused) return;
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isWalking, isPaused]);

  useEffect(() => {
    return () => { if (gpsSub.current) { gpsSub.current.remove(); } };
  }, []);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

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

  const animateGoToStop = useCallback(() => {
    Animated.sequence([
      Animated.timing(mainBtnScale, { toValue: 1.1, duration: 100, useNativeDriver: true }),
      Animated.timing(mainBtnScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    Animated.parallel([
      Animated.spring(pauseSlide, { toValue: 1, tension: 120, friction: 8, useNativeDriver: true }),
      Animated.spring(cameraSlide, { toValue: 1, tension: 120, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [mainBtnScale, pauseSlide, cameraSlide]);

  const handleGo = async () => {
    const selectedDogs = dogs.filter(d => d.selected).map(d => ({ id: d.id, name: d.name }));
    if (selectedDogs.length === 0) {
      if (allDogs.length === 0) {
        Alert.alert('提示', '你还没有添加狗狗，先去「档案」页面添加吧', [
          { text: '取消', style: 'cancel' },
          { text: '去档案', onPress: () => navigation.navigate('Profile') },
        ]);
      } else {
        Alert.alert('提示', '请先选择要遛的狗狗');
      }
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('权限提示', '需要位置权限才能记录遛狗路线');
      return;
    }

    lastPosRef.current = null;
    cumDistRef.current = 0;
    trackPointsRef.current = [];
    setGpsDistance(0);

    startWalk(selectedDogs);
    setIsWalking(true);
    setSeconds(0);
    setPhotos([]);
    animateGoToStop();

    gpsSub.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 3, timeInterval: 5000 },
      (loc) => {
        const { latitude, longitude } = loc.coords;
        const point = { latitude, longitude, timestamp: loc.timestamp };
        trackPointsRef.current = [...trackPointsRef.current, point];

        if (lastPosRef.current) {
          const dist = haversineDistance(
            lastPosRef.current.latitude, lastPosRef.current.longitude,
            latitude, longitude,
          );
          // 过滤 GPS 漂移：低于 5m 不累计距离
          if (dist >= 0.005) {
            cumDistRef.current += dist;
          }
        }
        lastPosRef.current = point;
        setGpsDistance(cumDistRef.current);
      },
    );
  };

  const handleStop = () => {
    if (gpsSub.current) { gpsSub.current.remove(); gpsSub.current = null; }

    Animated.parallel([
      Animated.timing(pauseSlide, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(cameraSlide, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      const distance = cumDistRef.current;
      const pace = seconds > 0 ? (distance / (seconds / 3600)) : 0;
      updateWalk({
        duration: seconds,
        distance: Math.round(distance * 100) / 100,
        pace: Math.round(pace * 10) / 10,
        trackPoints: trackPointsRef.current,
      });
      navigation.navigate('WalkCheckin');
    });
  };

  const handlePause = () => setIsPaused(!isPaused);

  const handleCamera = async () => {
    const uri = await takePhoto();
    if (!uri) return;

    let persistentUri;
    try {
      const photoDir = `${FileSystem.documentDirectory}walk_photos/`;
      await FileSystem.makeDirectoryAsync(photoDir, { intermediates: true });
      persistentUri = `${photoDir}${Date.now()}.jpg`;
      await FileSystem.copyAsync({ from: uri, to: persistentUri });
    } catch (e) {
      console.warn('[WalkHome] failed to persist photo, using temp URI', e);
      persistentUri = uri;
    }

    const newPhoto = {
      id: Date.now(),
      uri: persistentUri,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
    setPhotos(prev => [...prev, newPhoto]);
    addPhoto(newPhoto);
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapArea}>
        <MapPlaceholder
          height="100%"
          label={isWalking ? '实时轨迹绘制区域' : '高德地图 · 全屏区域'}
          sublabel={isWalking ? 'GPS 坐标连续打点 → 折线绘制' : '集成 react-native-amap3d 后替换'}
          style={{ borderRadius: 0 }}
        />

        <View style={[styles.locationDot, { top: '50%', left: '50%' }]} />

        <View style={[styles.floatTop, { paddingTop: insets.top + 8 }]}>
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{isWalking ? '平均配速' : '遛狗次数'}</Text>
              <View style={styles.statValueRow}>
                <Ionicons name={isWalking ? 'speedometer-outline' : 'paw'} size={16} color={colors.primary} />
                <Text style={styles.statVal}>
                  {isWalking ? (gpsDistance > 0 && seconds > 0 ? (gpsDistance / (seconds / 3600)).toFixed(1) : '0.0') : weekStats.count}
                </Text>
                <Text style={styles.statUnit}>{isWalking ? 'km/h' : '次'}</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{isWalking ? '本次时长' : '总时长'}</Text>
              <View style={styles.statValueRow}>
                <Ionicons name="time-outline" size={16} color={colors.primary} />
                <Text style={styles.statVal}>
                  {isWalking ? formatTime(seconds) : `${(weekStats.duration / 3600).toFixed(1)}h`}
                </Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{isWalking ? '本次距离' : '总里程'}</Text>
              <View style={styles.statValueRow}>
                <Ionicons name="trending-up" size={16} color={colors.primary} />
                <Text style={styles.statVal}>
                  {isWalking ? (gpsDistance > 0 ? gpsDistance.toFixed(1) : '0.0') : weekStats.distance.toFixed(1)}
                </Text>
                <Text style={styles.statUnit}>km</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.recenterWrap, { bottom: 102 + insets.bottom }]}>
          <TouchableOpacity style={styles.recenterBtn} activeOpacity={0.7} onPress={() => {}}>
            <Ionicons name="locate" size={22} color={colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.dogAvatarsRow, { bottom: 140 + insets.bottom }]}>
          {(isWalking ? dogs.filter(d => d.selected) : dogs).map(dog => (
            <TouchableOpacity
              key={dog.id}
              style={styles.dogItem}
              onPress={() => !isWalking && toggleDog(dog.id)}
              activeOpacity={isWalking ? 1 : 0.7}
            >
              <View style={[
                styles.avatarRing,
                dog.selected && styles.avatarRingActive,
                isWalking && styles.avatarRingWalking,
              ]}>
                <DogAvatar size={52} />
              </View>
              <Text style={[
                styles.dogName,
                dog.selected && styles.dogNameActive,
                isWalking && styles.dogNameWalking,
              ]}>
                {dog.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.controlsRow, { bottom: 0 }]}>
          {isWalking && (
            <Animated.View style={{ transform: [{ translateY: pauseSlide }], alignItems: 'center' }}>
              <TouchableOpacity style={styles.sideBtn} onPress={handlePause} activeOpacity={0.7}>
                <Ionicons name={isPaused ? 'play' : 'pause'} size={24} color={colors.secondary} />
              </TouchableOpacity>
              <Text style={styles.sideBtnLabel}>{isPaused ? '继续' : '暂停'}</Text>
            </Animated.View>
          )}

          <Animated.View style={{ transform: [{ scale: mainBtnScale }], alignItems: 'center' }}>
            <TouchableOpacity
              style={[styles.mainBtn, isWalking && styles.mainBtnDanger]}
              activeOpacity={0.8}
              onPress={isWalking ? handleStop : handleGo}
            >
              {isWalking ? (
                <Ionicons name="stop" size={28} color={colors.white} />
              ) : (
                <Text style={styles.goText}>GO</Text>
              )}
            </TouchableOpacity>
            {isWalking && <Text style={styles.mainBtnLabel}>结束</Text>}
          </Animated.View>

          {isWalking && (
            <Animated.View style={{ transform: [{ translateY: cameraSlide }], alignItems: 'center' }}>
              <TouchableOpacity style={styles.sideBtn} onPress={handleCamera} activeOpacity={0.7}>
                <Ionicons name="camera" size={24} color={colors.secondary} />
                {photos.length > 0 && (
                  <View style={styles.galleryBadge}>
                    <Text style={styles.galleryBadgeText}>{photos.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.sideBtnLabel}>拍照</Text>
            </Animated.View>
          )}
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8EDE4' },
  mapArea: { flex: 1, position: 'relative' },
  locationDot: {
    position: 'absolute',
    width: 24, height: 24, marginTop: -12, marginLeft: -12,
    backgroundColor: colors.primary, borderRadius: 12,
    borderWidth: 3, borderColor: colors.white,
    shadowColor: colors.secondary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  floatTop: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingHorizontal: 16, zIndex: 5,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: spacing.radiusPill,
    paddingVertical: 14,
    paddingHorizontal: 4,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  statLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textLight,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  statVal: {
    ...typography.bodyBold,
    fontSize: 16,
    color: colors.secondary,
  },
  statUnit: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
  },
  recenterWrap: {
    position: 'absolute',
    right: 16,
    zIndex: 5,
  },
  recenterBtn: {
    width: 48, height: 48,
    backgroundColor: colors.white,
    borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  dogAvatarsRow: {
    position: 'absolute',
    left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    zIndex: 10,
  },
  dogItem: {
    alignItems: 'center',
    gap: 6,
  },
  avatarRing: {
    width: 58, height: 58, borderRadius: 29,
    borderWidth: 2.5,
    borderColor: 'transparent',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarRingActive: {
    borderColor: colors.primary,
  },
  avatarRingWalking: {
    borderColor: 'rgba(185, 207, 50, 0.4)',
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
  dogNameWalking: {
    color: 'rgba(255,255,255,0.8)',
  },
  controlsRow: {
    position: 'absolute',
    left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 20,
    height: 120,
    zIndex: 10,
  },
  sideBtn: {
    width: SIDE_BTN_SIZE, height: SIDE_BTN_SIZE,
    borderRadius: SIDE_BTN_SIZE / 2,
    backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.secondary,
    position: 'relative',
  },
  sideBtnLabel: {
    ...typography.captionBold,
    fontSize: 11,
    color: colors.white,
    backgroundColor: 'rgba(52, 112, 72, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: spacing.radiusPill,
    overflow: 'hidden',
    textAlign: 'center',
    marginTop: 6,
  },
  mainBtn: {
    width: MAIN_BTN_SIZE, height: MAIN_BTN_SIZE,
    borderRadius: MAIN_BTN_SIZE / 2,
    backgroundColor: colors.secondary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  mainBtnDanger: {
    backgroundColor: colors.danger,
    shadowColor: '#C0392B',
    borderWidth: 3,
    borderColor: '#C0392B',
  },
  goText: {
    ...typography.button,
    color: colors.white,
    fontSize: 18,
    letterSpacing: 2,
  },
  mainBtnLabel: {
    ...typography.captionBold,
    fontSize: 11,
    color: colors.white,
    backgroundColor: 'rgba(52, 112, 72, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: spacing.radiusPill,
    overflow: 'hidden',
    textAlign: 'center',
    marginTop: 6,
  },
  galleryBadge: {
    position: 'absolute',
    top: -4, right: -4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.white,
  },
  galleryBadgeText: {
    fontSize: 9, fontWeight: '800', color: colors.secondary,
  },
});
