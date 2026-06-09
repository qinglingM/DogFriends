import React, { useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useSquare } from '../../contexts/SquareContext';

const PROFILE = {
  name: '小明',
  level: 'Lv.6',
  area: '上海 · 徐汇区',
  signature: '每天和旺财、小白一起散步，记录生活的小确幸。',
  habit: '晚上常去徐汇滨江遛狗',
  following: 32,
  followers: 128,
  likes: 890,
  cover:
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80',
  avatar:
    'https://images.unsplash.com/photo-1601758177266-bc599de87707?auto=format&fit=crop&w=300&q=80',
};

const DOGS = [
  {
    id: '1',
    name: '旺财',
    breed: '金毛寻回犬',
    age: '3岁',
    gender: '男生',
    traits: ['亲人', '爱玩'],
    image:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '2',
    name: '小白',
    breed: '萨摩耶',
    age: '2岁',
    gender: '女生',
    traits: ['活泼', '亲狗'],
    image:
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
  },
];

const BADGES = [
  { id: 'real_owner', name: '真实狗主', icon: 'paw', color: colors.primary, description: '已完成狗狗档案创建，并发布过公开动态。' },
  { id: 'walk_7', name: '连续遛狗7天', icon: 'calendar', color: colors.secondary, description: '连续 7 天记录遛狗。' },
  { id: 'explorer', name: '地点探索家', icon: 'location', color: colors.accent, description: '贡献过宠物友好地点体验。' },
  { id: 'family', name: '金毛家长', icon: 'shield-checkmark', color: colors.primary, description: '公开展示金毛犬档案。' },
];

const PROFILE_FEED = [
  {
    id: 'feed_plain_1',
    type: '普通图文动态',
    title: '旺财今天认识了新朋友',
    meta: '上海 徐汇区 · 日常分享',
    text: '傍晚在小区附近散步，旺财遇到一只很温柔的边牧，两个小朋友闻了半天，最后一起走了一小段。',
    createdAt: '今天 18:40',
    location: '上海 徐汇区',
    likes: 54,
    comments: 7,
    favorites: 12,
    liked: false,
    images: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=500&q=80',
    ],
  },
  {
    id: 'feed_walk_1',
    type: '公开遛狗动态',
    title: '和旺财完成了一次傍晚遛狗',
    meta: '徐汇滨江 · 42分钟 · 2.3km · 傍晚',
    text: '今天风很舒服，路线只展示大致区域，不展示起终点。旺财一路闻闻停停，状态很好。',
    createdAt: '今天 19:20',
    location: '上海 徐汇滨江',
    walkRecord: {
      distance: '2.3',
      duration: '42:18',
      pace: "18'20\"",
      area: '徐汇滨江',
    },
    likes: 128,
    comments: 16,
    favorites: 32,
    liked: true,
    images: [
      'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=500&q=80',
    ],
  },
  {
    id: 'feed_place_1',
    type: '地点体验动态',
    title: '这家咖啡店户外对狗狗很友好',
    meta: 'BLOOM Coffee · 咖啡店 · 徐汇区',
    text: '户外座位宽，店员会主动给水碗。大型犬建议避开周末高峰，平日下午更舒服。',
    createdAt: '昨天 15:30',
    location: '上海 BLOOM Coffee',
    likes: 96,
    comments: 8,
    favorites: 24,
    liked: false,
    images: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1601758177266-bc599de87707?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=500&q=80',
    ],
  },
];

const USER_PROFILES = {
  小明: {},
  豆豆妈妈: {
    name: '豆豆妈妈',
    level: 'Lv.5',
    area: '上海 · 黄浦区',
    signature: '周末最喜欢带豆豆去公园晒太阳。',
    habit: '常去复兴公园散步',
    following: 48,
    followers: 236,
    likes: 1260,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    cover: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80',
    dogs: [
      { id: 'doudou', name: '豆豆', breed: '柴犬', age: '2岁', gender: '男生', traits: ['亲人', '慢热'], image: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  可乐姐姐: {
    name: '可乐姐姐',
    level: 'Lv.4',
    area: '上海 · 徐汇滨江',
    signature: '出门包里永远有水碗和小零食。',
    habit: '常去滨江夜间遛狗',
    following: 21,
    followers: 98,
    likes: 642,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    dogs: [
      { id: 'kele', name: '可乐', breed: '柯基', age: '3岁', gender: '女生', traits: ['活泼', '贪吃'], image: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  布丁爸: {
    name: '布丁爸',
    level: 'Lv.3',
    area: '上海 · 徐汇区',
    signature: '布丁比较胆小，正在慢慢练习社交。',
    habit: '偏爱安静小公园',
    following: 16,
    followers: 74,
    likes: 318,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    cover: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=80',
    dogs: [
      { id: 'buding', name: '布丁', breed: '比熊', age: '4岁', gender: '男生', traits: ['胆小', '亲人'], image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  栗子: {
    name: '栗子',
    level: 'Lv.6',
    area: '上海 · 浦东新区',
    signature: '想给栗子找稳定的散步搭子。',
    habit: '周末常去世纪公园',
    following: 67,
    followers: 312,
    likes: 1548,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    dogs: [
      { id: 'lizi', name: '栗子', breed: '柯基', age: '2岁', gender: '男生', traits: ['稳定', '亲人'], image: 'https://images.unsplash.com/photo-1557973557-ddfa9ee8c9c3?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  阿黄爸爸: {
    name: '阿黄爸爸',
    level: 'Lv.7',
    area: '上海 · 长宁区',
    signature: '更关心夏天、雨天和大型犬出门攻略。',
    habit: '早晚错峰遛狗',
    following: 39,
    followers: 420,
    likes: 2210,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    cover: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1000&q=80',
    dogs: [
      { id: 'ahuang', name: '阿黄', breed: '拉布拉多', age: '5岁', gender: '男生', traits: ['温顺', '大型犬'], image: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=600&q=80' },
    ],
  },
};

function getProfile(userName) {
  const override = USER_PROFILES[userName] || {};
  return {
    ...PROFILE,
    ...override,
    dogs: override.dogs || DOGS,
    badges: override.badges || BADGES,
    feed: override.feed || PROFILE_FEED,
  };
}

export default function PersonalProfileScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { posts } = useSquare();
  const profile = getProfile(route?.params?.userName || PROFILE.name);
  const isSelf = profile.name === PROFILE.name;
  const dogs = profile.dogs;
  const badges = profile.badges;
  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({ tabBarStyle: { display: 'none' } });
      return () => {
        parent?.setOptions({
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            height: spacing.bottomTabHeight,
            paddingBottom: 8,
            paddingTop: 8,
          },
        });
      };
    }, [navigation])
  );

  const publicPosts = useMemo(() => {
    return posts
      .filter(post => post.authorName === profile.name && post.visibility === 'public')
      .map(post => ({
        id: post.id,
        type: '普通图文动态',
        title: post.tag ? `#${post.tag}` : '我的分享',
        meta: `${post.location || profile.area} · ${post.createdAt}`,
        text: post.text,
        createdAt: post.createdAt,
        location: post.location || profile.area,
        likes: post.likes,
        comments: post.comments.length,
        favorites: post.favorites,
        liked: post.liked,
        images: [post.mediaUrl],
        sourcePostId: post.id,
      }));
  }, [posts, profile.area, profile.name]);
  const feed = [...publicPosts, ...profile.feed];

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ImageBackground source={{ uri: profile.cover }} style={[styles.hero, { paddingTop: insets.top + 12 }]}>
          <View style={styles.heroNav}>
            <CircleButton icon="chevron-back" onPress={() => navigation.goBack()} />
            <View style={styles.heroActions}>
              <CircleButton icon="share-social-outline" />
              <CircleButton icon="ellipsis-horizontal" />
            </View>
          </View>
        </ImageBackground>

        <View style={styles.profilePanel}>
          <View style={styles.profileTop}>
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            <View style={styles.nameBlock}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{profile.name}</Text>
                <Ionicons name="female" size={16} color={colors.accent} />
                <View style={styles.levelPill}>
                  <Text style={styles.levelText}>{profile.level}</Text>
                </View>
              </View>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color={colors.textLight} />
                <Text style={styles.locationText}>{profile.area}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.signature}>{profile.signature}</Text>
          <View style={styles.habitPill}>
            <Ionicons name="paw" size={16} color={colors.secondary} />
            <Text style={styles.habitText}>{profile.habit}</Text>
          </View>

          <View style={styles.socialRow}>
            <StatBlock value={profile.following} label="关注" />
            <View style={styles.statDivider} />
            <StatBlock value={profile.followers} label="粉丝" />
            <View style={styles.statDivider} />
            <StatBlock value={profile.likes} label="获赞" />
            <TouchableOpacity style={styles.followBtn} activeOpacity={0.75}>
              <Text style={styles.followText}>{isSelf ? '编辑资料' : '关注'}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.secondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.profileBadgeStrip}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('EarnedBadges', { badges })}
          >
            {badges.slice(0, 5).map(badge => (
              <View key={badge.id} style={styles.badgeItem}>
                <View style={[styles.badgeIcon, { backgroundColor: badge.color }]}>
                  <Ionicons name={badge.icon} size={18} color={colors.white} />
                </View>
              </View>
            ))}
            {badges.length > 5 && (
              <View style={styles.moreBadge}>
                <Text style={styles.moreBadgeText}>+{badges.length - 5}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <SectionHeader title={isSelf ? '我的狗狗' : 'TA 的狗狗'} suffix={`${dogs.length}只`} />
        {dogs.length === 1 ? (
          <View style={styles.singleDogRow}>
            <DogCard dog={dogs[0]} navigation={navigation} fullWidth />
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dogRow}
          >
            {dogs.map(dog => (
              <DogCard key={dog.id} dog={dog} navigation={navigation} />
            ))}
          </ScrollView>
        )}

        <SectionHeader title={isSelf ? '我的动态' : 'TA 的动态'} />
        <View style={styles.feedList}>
          {feed.map(item => (
            <FeedCard
              key={item.id}
              item={item}
              profile={profile}
              onPress={() => {
                navigation.navigate('ProfileFeedDetail', { item, profile });
              }}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function CircleButton({ icon, onPress }) {
  return (
    <TouchableOpacity style={styles.circleButton} activeOpacity={0.75} onPress={onPress}>
      <Ionicons name={icon} size={23} color={colors.white} />
    </TouchableOpacity>
  );
}

function StatBlock({ value, label }) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SectionHeader({ title, suffix, action, onPress }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>
        {title} {!!suffix && <Text style={styles.sectionSuffix}>{suffix}</Text>}
      </Text>
      {!!action && (
        <TouchableOpacity style={styles.sectionAction} activeOpacity={0.75} onPress={onPress}>
          <Text style={styles.sectionActionText}>{action}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function DogCard({ dog, navigation, fullWidth }) {
  return (
    <TouchableOpacity
      style={[styles.dogCard, fullWidth && styles.singleDogCard]}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('DogProfile', { dogId: dog.id })}
    >
      <Image source={{ uri: dog.image }} style={styles.dogImage} />
      <View style={styles.dogBody}>
        <Text style={styles.dogName}>{dog.name}</Text>
        <Text style={styles.dogMeta}>{dog.breed} · {dog.age} · {dog.gender}</Text>
        <View style={styles.traitRow}>
          {dog.traits.map(trait => (
            <View key={trait} style={styles.traitChip}>
              <Text style={styles.traitText}>{trait}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function FeedCard({ item, profile, onPress }) {
  return (
    <TouchableOpacity style={styles.feedCard} activeOpacity={0.82} onPress={onPress}>
      <View style={styles.feedAuthor}>
        <Image source={{ uri: profile.avatar }} style={styles.feedAvatar} />
        <View style={styles.feedAuthorText}>
          <Text style={styles.feedName}>{profile.name}</Text>
          <Text style={styles.feedTime}>{item.createdAt} · {item.location}</Text>
        </View>
      </View>
      <Text style={styles.feedTitle}>{item.title}</Text>
      <View style={styles.feedMetaRow}>
        <Ionicons name="location-outline" size={16} color={colors.textLight} />
        <Text style={styles.feedMeta}>{item.meta}</Text>
      </View>
      <Text style={styles.feedText}>{item.text}</Text>
      {item.walkRecord ? (
        <WalkRecordPreview record={item.walkRecord} />
      ) : (
        <View style={styles.photoRow}>
          {item.images.slice(0, 3).map((image, index) => (
            <Image key={`${item.id}_${index}`} source={{ uri: image }} style={styles.feedPhoto} />
          ))}
        </View>
      )}
      <View style={styles.feedActions}>
        <View style={styles.feedAction}>
          <Ionicons name={item.liked ? 'heart' : 'heart-outline'} size={24} color={item.liked ? colors.danger : colors.textLight} />
          <Text style={styles.feedActionText}>{item.likes}</Text>
        </View>
        <View style={styles.feedAction}>
          <Ionicons name="chatbubble-outline" size={24} color={colors.textLight} />
          <Text style={styles.feedActionText}>{item.comments}</Text>
        </View>
        <View style={styles.feedAction}>
          <Ionicons name="star-outline" size={24} color={colors.textLight} />
          <Text style={styles.feedActionText}>{item.favorites}</Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={24} color={colors.textLight} />
      </View>
    </TouchableOpacity>
  );
}

function WalkRecordPreview({ record }) {
  return (
    <View style={styles.walkRecordCard}>
      <View style={styles.walkMapCanvas}>
        <View style={[styles.mapPatch, styles.mapPatchOne]} />
        <View style={[styles.mapPatch, styles.mapPatchTwo]} />
        <View style={styles.routeLine} />
        <View style={[styles.routePoint, styles.routeStart]} />
        <View style={[styles.routePoint, styles.routeEnd]} />
        <Text style={styles.mapArea}>{record.area}</Text>
      </View>
      <View style={styles.walkRecordStats}>
        <WalkMetric value={record.distance} unit="km" label="距离" />
        <View style={styles.walkMetricDivider} />
        <WalkMetric value={record.duration} label="时长" />
        <View style={styles.walkMetricDivider} />
        <WalkMetric value={record.pace} label="配速" />
      </View>
    </View>
  );
}

function WalkMetric({ value, unit, label }) {
  return (
    <View style={styles.walkMetric}>
      <Text style={styles.walkMetricValue}>
        {value}{!!unit && <Text style={styles.walkMetricUnit}> {unit}</Text>}
      </Text>
      <Text style={styles.walkMetricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: spacing.xxl },
  hero: {
    height: 288,
    justifyContent: 'flex-start',
  },
  heroNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  heroActions: { flexDirection: 'row', gap: spacing.sm },
  circleButton: {
    width: spacing.touchTarget,
    height: spacing.touchTarget,
    borderRadius: spacing.radiusPill,
    backgroundColor: 'rgba(52, 112, 72, 0.86)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePanel: {
    marginTop: -56,
    backgroundColor: colors.white,
    borderTopLeftRadius: spacing.radiusLg,
    borderTopRightRadius: spacing.radiusLg,
    paddingHorizontal: spacing.md,
    paddingTop: 0,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: colors.white,
    marginTop: -24,
    backgroundColor: colors.chipDefault,
  },
  nameBlock: { flex: 1, paddingBottom: spacing.sm },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  name: { ...typography.h1, color: colors.textMain },
  levelPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.accent,
  },
  levelText: { ...typography.captionBold, color: colors.white },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  locationText: { ...typography.caption, color: colors.textLight },
  signature: {
    ...typography.body,
    color: colors.textMain,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  habitPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.chipDefault,
    marginBottom: spacing.md,
  },
  habitText: { ...typography.caption, color: colors.textLight },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBlock: { width: 64, alignItems: 'center' },
  statValue: { ...typography.h2, color: colors.secondary },
  statLabel: { ...typography.caption, color: colors.textLight },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  followBtn: {
    marginLeft: 'auto',
    minWidth: 128,
    height: spacing.touchTarget,
    borderRadius: spacing.radiusPill,
    borderWidth: 2,
    borderColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
  },
  followText: { ...typography.bodyBold, color: colors.secondary },
  sectionHeader: {
    minHeight: spacing.xxl,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
  },
  sectionTitle: { ...typography.h3, color: colors.secondary },
  sectionSuffix: { ...typography.body, color: colors.textLight },
  sectionAction: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  sectionActionText: { ...typography.caption, color: colors.textLight },
  dogRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
  },
  singleDogRow: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
  },
  dogCard: {
    width: 220,
    borderRadius: spacing.radiusMd,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  singleDogCard: {
    width: '100%',
  },
  dogImage: {
    width: '100%',
    height: 128,
    backgroundColor: colors.chipDefault,
  },
  dogBody: { padding: spacing.md },
  dogName: { ...typography.bodyBold, fontSize: 16, color: colors.textMain, marginBottom: spacing.xs },
  dogMeta: { ...typography.caption, color: colors.textLight, marginBottom: spacing.sm },
  traitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  traitChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.chipDefault,
  },
  traitText: { ...typography.captionBold, color: colors.secondary },
  profileBadgeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: spacing.radiusMd,
    backgroundColor: colors.chipDefault,
  },
  badgeItem: {
    width: 40,
    height: 40,
    borderRadius: spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  moreBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.chipDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreBadgeText: { ...typography.captionBold, color: colors.secondary },
  feedList: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  feedCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  feedAuthor: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  feedAvatar: { width: spacing.touchTarget, height: spacing.touchTarget, borderRadius: 24, backgroundColor: colors.chipDefault },
  feedAuthorText: { flex: 1 },
  feedName: { ...typography.bodyBold, color: colors.textMain },
  feedTime: { ...typography.caption, color: colors.textLight },
  feedTitle: { ...typography.bodyBold, fontSize: 16, color: colors.textMain, marginBottom: spacing.sm },
  feedMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  feedMeta: { ...typography.caption, color: colors.textLight },
  feedText: { ...typography.body, color: colors.textMain, marginBottom: spacing.md },
  photoRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  feedPhoto: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: spacing.radiusSm,
    backgroundColor: colors.chipDefault,
  },
  walkRecordCard: {
    borderRadius: spacing.radiusMd,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
  },
  walkMapCanvas: {
    height: 128,
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
    width: 160,
    height: 72,
    left: -24,
    top: 18,
    transform: [{ rotate: '-18deg' }],
  },
  mapPatchTwo: {
    width: 190,
    height: 86,
    right: -32,
    bottom: -8,
    transform: [{ rotate: '16deg' }],
  },
  routeLine: {
    position: 'absolute',
    left: '18%',
    right: '16%',
    top: '48%',
    height: 8,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.secondary,
    transform: [{ rotate: '-10deg' }],
  },
  routePoint: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: colors.white,
    backgroundColor: colors.primary,
  },
  routeStart: { left: '16%', top: '51%' },
  routeEnd: { right: '14%', top: '36%' },
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
  walkRecordStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  walkMetric: { flex: 1, alignItems: 'center' },
  walkMetricValue: { ...typography.h3, color: colors.textMain },
  walkMetricUnit: { ...typography.captionBold, color: colors.textMain },
  walkMetricLabel: { ...typography.caption, color: colors.textLight, marginTop: spacing.xs },
  walkMetricDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  feedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feedAction: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minWidth: 64 },
  feedActionText: { ...typography.body, color: colors.textLight },
});
