import React, { useMemo, useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, Card, DogAvatar, WalkMap } from '../../components';
import { useWalk } from '../../contexts/WalkContext';
import { useDogs } from '../../contexts/DogContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MOOD_LABELS = {
  energetic: '😄 活力满满', happy: '🙂 心情不错', calm: '😌 平静', tired: '😴 有点累', anxious: '😰 紧张不安',
};

const CHECKIN_LABELS = {
  none: '无', less: '偏少', much: '偏多', normal: '正常',
};

const WEEKDAY = ['周日','周一','周二','周三','周四','周五','周六'];

const BRISTOL_LABELS = {
  B1: 'B1 硬粒', B2: 'B2 硬条', B3: 'B3 偏硬',
  B4: 'B4 正常', B5: 'B5 偏软', B6: 'B6 糊便', B7: 'B7 水便',
};

export default function WalkDetailScreen({ navigation, route }) {
  const walkId = route?.params?.id;
  const { records } = useWalk();
  const { dogs: allDogs } = useDogs();
  const record = useMemo(() => records.find(r => r.id === walkId), [records, walkId]);

  const [currentPage, setCurrentPage] = useState(0);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const [scrollH, setScrollH] = useState(SCREEN_HEIGHT);

  const toggleOverlay = useCallback(() => {
    const toValue = overlayVisible ? 0 : 1;
    Animated.timing(overlayOpacity, {
      toValue, duration: 200, useNativeDriver: true,
    }).start();
    setOverlayVisible(!overlayVisible);
  }, [overlayVisible, overlayOpacity]);

  const handlePageChange = useCallback((e) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentPage(page);
    if (!overlayVisible) {
      setOverlayVisible(true);
      Animated.timing(overlayOpacity, {
        toValue: 1, duration: 200, useNativeDriver: true,
      }).start();
    }
  }, [overlayVisible, overlayOpacity]);

  if (!record) {
    return (
      <View style={styles.screen}>
        <NavBar title="遛狗详情" onBack={() => navigation.goBack()} />
        <View style={styles.empty}>
          <Ionicons name="walk-outline" size={48} color={colors.textLight} />
          <Text style={styles.emptyText}>未找到遛狗记录</Text>
        </View>
      </View>
    );
  }

  const dogs = record.dogs || [];
  const getDogInfo = (dogId) => allDogs.find(d => d.id === dogId) || { name: dogId, image: null };
  const checkins = record.checkins || {};
  const startTime = record.startTime ? new Date(record.startTime) : null;
  const endTime = record.endTime ? new Date(record.endTime) : null;
  const duration = record.duration || 0;
  const m = Math.floor(duration / 60);
  const s = duration % 60;

  const dateStr = startTime
    ? `${startTime.getFullYear()}年${startTime.getMonth() + 1}月${startTime.getDate()}日 ${WEEKDAY[startTime.getDay()]}`
    : (record.dateLabel || record.date || '');
  const timeStr = startTime && endTime
    ? `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')} - ${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`
    : '';
  const durationStr = m > 0 ? `${m} 分钟` : `${s} 秒`;

  const formatCheckinRows = (checkin) => {
    if (!checkin) return [];
    const rows = [];
    if (checkin.pee !== null && checkin.pee !== undefined) {
      rows.push({ label: '排尿', value: CHECKIN_LABELS[checkin.pee] || checkin.pee });
    }
    if (checkin.poop !== null && checkin.poop !== undefined) {
      rows.push({ label: '排便', value: CHECKIN_LABELS[checkin.poop] || checkin.poop });
    }
    if (checkin.bristol) {
      rows.push({ label: '便便状态', value: BRISTOL_LABELS[checkin.bristol] || checkin.bristol });
    }
    if (checkin.mood) {
      rows.push({ label: '精神状态', value: MOOD_LABELS[checkin.mood] || checkin.mood });
    }
    if (checkin.behaviors?.length > 0) {
      rows.push({ label: '异常行为', value: checkin.behaviors.join('、') });
    }
    if (checkin.note) {
      rows.push({ label: '备注', value: checkin.note });
    }
    return rows;
  };

  const getPhotoUri = (photo) => {
    const uri = typeof photo === 'string' ? photo : photo?.uri;
    return uri || null;
  };

  const photos = record.photos || [];

  const heroContent = (page) => (
    <>
      <View style={styles.heroTop}>
        <View style={styles.heroInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={styles.heroDate}>{dateStr + ' '}</Text>
            <Text style={styles.heroTime}>{timeStr}{timeStr ? ' · ' : ''}{durationStr}</Text>
          </View>
          <View style={styles.heroDogInline}>
            {dogs.map((dog, i) => {
              const dogId = dog?.id || dog;
              const info = getDogInfo(dogId);
              return (
                <View key={dogId ?? i} style={styles.heroDogChip}>
                  <DogAvatar size={16} image={info.image} />
                  <Text style={styles.heroDogName}>{info.name}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
      <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 4 }}>
        <View style={styles.statsCapsule}>
          <View style={styles.statCell}>
            <Text style={styles.statCellValue}>{(record.distance || 0).toFixed(1)}</Text>
            <Text style={styles.statCellLabel}>km</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statCellValue}>{m}</Text>
            <Text style={styles.statCellLabel}>min</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statCellValue}>{(record.pace || 0).toFixed(1)}</Text>
            <Text style={styles.statCellLabel}>km/h</Text>
          </View>
        </View>
      </View>
      {photos.length > 1 && (
        <View style={styles.pageDots}>
          {photos.map((_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>
      )}
    </>
  );

  return (
    <View style={styles.screen}>
      <NavBar title="遛狗详情" onBack={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1 }} onLayout={(e) => setScrollH(e.nativeEvent.layout.height)}>
        <View style={{ minHeight: scrollH }}>
          {photos.length > 0 ? (
            <View style={{ height: SCREEN_WIDTH, position: 'relative' }}>
              <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                style={StyleSheet.absoluteFill} nestedScrollEnabled
                onMomentumScrollEnd={handlePageChange}
              >
                {photos.map((photo, i) => {
                  const uri = getPhotoUri(photo);
                  return (
                    <TouchableOpacity key={i} activeOpacity={1} onPress={toggleOverlay}
                      style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
                    >
                      {uri ? (
                        <Image source={{ uri }} style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH, resizeMode: 'cover' }} />
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <Animated.View pointerEvents="none" style={[styles.heroOverlay, StyleSheet.absoluteFill, { opacity: overlayOpacity }]}>
                {heroContent(currentPage)}
              </Animated.View>
            </View>
          ) : (
            <View style={styles.heroPage}>
              <View style={[styles.heroOverlay, styles.heroOverlaySolid]}>
                {heroContent(0)}
              </View>
            </View>
          )}

          <View style={[styles.routeCard, { marginHorizontal: 16, marginTop: 16 }]}> 
            <Text style={styles.sectionTitle}>路线轨迹</Text>
            <View style={{ height: 220, borderRadius: spacing.radiusMd, overflow: 'hidden' }}>
              <WalkMap
                points={record.trackPoints || []}
                interactive={false}
                autoFitRoute
                emptyLabel="这次遛狗没有记录到轨迹"
                style={{ flex: 1 }}
              />
            </View>
          </View>

          <View style={{ paddingHorizontal: 16, paddingBottom: 32, paddingTop: 8 }}>
              <Card>
                <View style={styles.checkinTitle}>
                  <Ionicons name="clipboard" size={16} color={colors.primary} />
                  <Text style={styles.checkinTitleText}>健康打卡记录</Text>
                </View>
                {dogs.length > 0 ? dogs.map((dog, dogIndex) => {
                  const dogId = dog?.id || dog;
                  const info = getDogInfo(dogId);
                  const checkin = checkins[dogId];
                  const rows = formatCheckinRows(checkin);
                  return (
                    <View key={dogId ?? dogIndex}>
                      {(dogIndex > 0) && (
                        <View style={[styles.dogSection, { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }]}>
                          <DogAvatar size={32} image={info.image} />
                          <Text style={styles.dogSectionName}>{info.name}</Text>
                        </View>
                      )}
                      {dogIndex === 0 && (
                        <View style={styles.dogSection}>
                          <DogAvatar size={32} image={info.image} />
                          <Text style={styles.dogSectionName}>{info.name}</Text>
                        </View>
                      )}
                      {rows.length > 0 && rows.map((row, i) => (
                        <View key={i} style={[styles.checkinRow, i < rows.length - 1 && styles.checkinRowBorder]}>
                          <Text style={styles.checkinLabel}>{row.label}</Text>
                          <Text style={styles.checkinValue}>{row.value}</Text>
                        </View>
                      ))}
                      {rows.length === 0 && (
                        <View style={styles.checkinRow}>
                          <Text style={styles.checkinValue}>无记录</Text>
                        </View>
                      )}
                    </View>
                  );
                }) : (
                  <View style={styles.checkinRow}>
                    <Text style={styles.checkinValue}>无狗狗信息</Text>
                  </View>
                )}
              </Card>
            </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#E8EDE4' },
  heroPage: {
    width: SCREEN_WIDTH, height: SCREEN_WIDTH,
    position: 'relative', overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute', top: 0, left: 0,
    width: SCREEN_WIDTH, height: SCREEN_WIDTH,
    resizeMode: 'cover',
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 20, paddingTop: 24,
  },
  heroOverlaySolid: {
    backgroundColor: colors.primary,
  },
  heroTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  heroInfo: {},
  heroDate: { ...typography.h2, color: colors.white, marginBottom: 4 },
  heroTime: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  heroDogInline: {
    flexDirection: 'row', gap: 6, marginBottom: 4, marginTop: 6,
  },
  heroDogChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: spacing.radiusPill,
    paddingVertical: 3, paddingLeft: 3, paddingRight: 8,
  },
  heroDogName: { ...typography.bodyBold, color: colors.secondary, fontSize: 12 },
  statsCapsule: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20, paddingVertical: 8,
    alignSelf: 'center', width: SCREEN_WIDTH - 80,
  },
  statCell: { flex: 1, alignItems: 'center', gap: 1 },
  statCellValue: { color: colors.secondary, fontSize: 15, fontWeight: '700' },
  statCellLabel: { color: colors.textLight, fontSize: 10, fontWeight: '500' },
  statDivider: { width: 1, height: 20, backgroundColor: 'rgba(52,112,72,0.2)' },
  sectionTitle: { ...typography.bodyBold, color: colors.secondary, marginBottom: 12 },
  routeCard: {
    backgroundColor: colors.white, borderRadius: spacing.radiusLg,
    padding: spacing.md,
  },
  mapWrap: {
    borderRadius: spacing.radiusMd, overflow: 'hidden',
    aspectRatio: 1,
  },
  checkinCard: { marginTop: 0 },
  checkinTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  checkinTitleText: { ...typography.bodyBold, color: colors.secondary },
  dogSection: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  dogSectionName: { ...typography.bodyBold, color: colors.secondary },
  checkinRow: {
    flexDirection: 'row',
    paddingVertical: 8, gap: 8,
  },
  checkinRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  checkinLabel: { ...typography.body, color: colors.textLight, minWidth: 72 },
  checkinValue: { ...typography.bodyBold, color: colors.secondary, flexShrink: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { ...typography.body, color: colors.textLight },
  pageDots: {
    flexDirection: 'row', justifyContent: 'center', gap: 6,
    paddingBottom: 3, marginTop: 6,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: colors.white, width: 18, borderRadius: 3,
  },
});
