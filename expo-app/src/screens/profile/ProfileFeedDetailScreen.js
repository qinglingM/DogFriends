import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar } from '../../components';
import { formatPostTime } from '../../utils/time';
import { formatLocation } from '../../utils/location';

export default function ProfileFeedDetailScreen({ navigation, route }) {
  const item = route.params?.item;
  const profile = route.params?.profile;
  if (!item || !profile) return null;

  const images = item.images || [];
  const [imageRatios, setImageRatios] = useState({});

  useEffect(() => {
    images.forEach(url => {
      Image.getSize(url, (w, h) => {
        setImageRatios(prev => ({ ...prev, [url]: w / h }));
      }, () => {
        setImageRatios(prev => ({ ...prev, [url]: 4 / 3 }));
      });
    });
  }, []);

  return (
    <View style={styles.screen}>
      <NavBar title="动态详情" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.authorRow}
          activeOpacity={0.75}
          onPress={() => navigation.navigate('PersonalProfile', { userName: profile.name })}
        >
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          <View style={styles.authorMain}>
            <Text style={styles.userName}>{profile.name}</Text>
            <Text style={styles.feedTime}>{formatPostTime(item.createdAt)} · {formatLocation(item.location)}</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body}>{item.text}</Text>

        {item.walkRecord ? (
          <WalkRecordDetail record={item.walkRecord} />
        ) : (
          <View style={styles.imageGrid}>
            {images.map((url, index) => (
              <Image
                key={`${item.id}_${index}`}
                source={{ uri: url }}
                style={[styles.image, { aspectRatio: imageRatios[url] || 4 / 3 }]}
              />
            ))}
          </View>
        )}

        <View style={styles.actionRow}>
          <View style={styles.action}>
            <Ionicons name={item.liked ? 'heart' : 'heart-outline'} size={22} color={item.liked ? colors.danger : colors.secondary} />
            <Text style={styles.actionText}>{item.likes}</Text>
          </View>
          <View style={styles.action}>
            <Ionicons name="chatbubble-outline" size={21} color={colors.secondary} />
            <Text style={styles.actionText}>{item.comments}</Text>
          </View>
          <View style={styles.action}>
            <Ionicons name="bookmark-outline" size={22} color={colors.secondary} />
            <Text style={styles.actionText}>{item.favorites}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function WalkRecordDetail({ record }) {
  return (
    <View style={styles.walkCard}>
      <View style={styles.mapCanvas}>
        <View style={[styles.mapPatch, styles.mapPatchOne]} />
        <View style={[styles.mapPatch, styles.mapPatchTwo]} />
        <View style={styles.routeLine} />
        <View style={[styles.routePoint, styles.routeStart]} />
        <View style={[styles.routePoint, styles.routeEnd]} />
        <Text style={styles.mapArea}>{record.area}</Text>
      </View>
      <View style={styles.walkStats}>
        <Metric value={record.distance} unit="km" label="距离" />
        <View style={styles.metricDivider} />
        <Metric value={record.duration} label="时长" />
        <View style={styles.metricDivider} />
        <Metric value={record.pace} label="配速" />
      </View>
    </View>
  );
}

function Metric({ value, unit, label }) {
  return (
    <View style={styles.metric}>
      <View style={styles.metricValueRow}>
        <Text style={styles.metricValue}>{value}</Text>
        {!!unit && <Text style={styles.metricUnit}>{unit}</Text>}
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screenMargin, paddingBottom: spacing.xxl },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  avatar: {
    width: spacing.touchTarget,
    height: spacing.touchTarget,
    borderRadius: 24,
    backgroundColor: colors.chipDefault,
  },
  authorMain: { flex: 1 },
  userName: { ...typography.bodyBold, color: colors.textMain },
  feedTime: { ...typography.caption, color: colors.textLight },
  title: { ...typography.h3, color: colors.textMain, marginBottom: spacing.sm },
  body: { ...typography.body, color: colors.textMain, marginBottom: spacing.md },
  imageGrid: { gap: spacing.sm, marginBottom: spacing.md },
  image: {
    width: '100%',
    borderRadius: spacing.radiusMd,
    backgroundColor: colors.chipDefault,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    paddingVertical: spacing.md,
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  actionText: { ...typography.bodyBold, color: colors.secondary },
  walkCard: {
    borderRadius: spacing.radiusMd,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  mapCanvas: {
    height: 220,
    backgroundColor: '#DDEBD3',
    overflow: 'hidden',
    position: 'relative',
  },
  mapPatch: {
    position: 'absolute',
    borderRadius: spacing.radiusPill,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  mapPatchOne: {
    width: 220,
    height: 96,
    left: -32,
    top: 36,
    transform: [{ rotate: '-18deg' }],
  },
  mapPatchTwo: {
    width: 260,
    height: 110,
    right: -48,
    bottom: 8,
    transform: [{ rotate: '16deg' }],
  },
  routeLine: {
    position: 'absolute',
    left: '16%',
    right: '14%',
    top: '50%',
    height: 10,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.secondary,
    transform: [{ rotate: '-10deg' }],
  },
  routePoint: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: colors.white,
    backgroundColor: colors.primary,
  },
  routeStart: { left: '14%', top: '52%' },
  routeEnd: { right: '12%', top: '38%' },
  mapArea: {
    position: 'absolute',
    left: spacing.md,
    top: spacing.md,
    ...typography.captionBold,
    color: colors.secondary,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.radiusPill,
  },
  walkStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  metric: { flex: 1, alignItems: 'center' },
  metricValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  metricValue: { ...typography.h3, color: colors.textMain },
  metricUnit: { ...typography.captionBold, color: colors.textMain },
  metricLabel: { ...typography.caption, color: colors.textLight, marginTop: spacing.xs },
  metricDivider: { width: 1, height: 32, backgroundColor: colors.border },
});
