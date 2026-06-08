import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, Card, DogAvatar } from '../../components';
import { PROFILE_BADGES } from '../../data/profileData';
import { useSquare } from '../../contexts/SquareContext';

const PROFILE = {
  name: '小明',
  area: '上海 · 徐汇滨江',
  signature: '每天晚上都和旺财一起散步。',
  following: 32,
  followers: 128,
  likes: 890,
};

const DOGS = [
  {
    id: '1',
    name: '旺财',
    breed: '金毛寻回犬',
    age: '3岁',
    gender: '男生',
    traits: ['亲人', '爱玩'],
  },
  {
    id: '2',
    name: '小白',
    breed: '萨摩耶',
    age: '2岁',
    gender: '女生',
    traits: ['活泼', '亲狗'],
  },
];

const WALK_DYNAMIC = {
  id: 'walk_dynamic_1',
  title: '和旺财完成了一次遛狗',
  meta: '徐汇滨江 · 42分钟 · 2.3km · 傍晚',
  text: '今天人不多，旺财一路闻闻停停，状态很好。',
  likes: 36,
  comments: 4,
};

export default function PersonalProfileScreen({ navigation }) {
  const { posts } = useSquare();
  const earnedBadges = PROFILE_BADGES.filter(badge => badge.earned).slice(0, 5);
  const publicPosts = useMemo(() => {
    return posts.filter(post => post.authorName === PROFILE.name && post.visibility === 'public');
  }, [posts]);

  return (
    <View style={styles.screen}>
      <NavBar title="个人主页" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.profileCard}>
          <View style={styles.cover} />
          <View style={styles.profileMain}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={34} color={colors.secondary} />
            </View>
            <View style={styles.profileText}>
              <Text style={styles.name}>{PROFILE.name}</Text>
              <Text style={styles.area}>{PROFILE.area}</Text>
              <Text style={styles.signature}>{PROFILE.signature}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{PROFILE.following}</Text>
              <Text style={styles.statLabel}>关注</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{PROFILE.followers}</Text>
              <Text style={styles.statLabel}>粉丝</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{PROFILE.likes}</Text>
              <Text style={styles.statLabel}>获赞</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editProfileBtn} activeOpacity={0.75}>
            <Text style={styles.editProfileText}>编辑资料</Text>
          </TouchableOpacity>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>我的狗狗 2只</Text>
        </View>
        <View style={styles.dogGrid}>
          {DOGS.map(dog => (
            <TouchableOpacity
              key={dog.id}
              style={styles.dogCard}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('DogProfile', { dogId: dog.id })}
            >
              <DogAvatar size={54} />
              <View style={styles.dogInfo}>
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
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>徽章</Text>
          <TouchableOpacity onPress={() => navigation.navigate('BadgeWall')}>
            <Text style={styles.sectionLink}>查看全部 →</Text>
          </TouchableOpacity>
        </View>
        <Card>
          {earnedBadges.length > 0 ? (
            <View style={styles.badgeRow}>
              {earnedBadges.map(badge => (
                <TouchableOpacity
                  key={badge.id}
                  style={styles.badgePill}
                  activeOpacity={0.75}
                  onPress={() => navigation.navigate('BadgeDetail', { id: badge.id })}
                >
                  <Ionicons name={badge.icon} size={16} color={colors.secondary} />
                  <Text style={styles.badgePillText}>{badge.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>完成遛狗、发布动态、完善狗狗档案后，可以获得徽章。</Text>
          )}
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>我的动态</Text>
        </View>
        <WalkDynamicCard dynamic={WALK_DYNAMIC} />
        {publicPosts.map(post => (
          <TouchableOpacity
            key={post.id}
            style={styles.postCard}
            activeOpacity={0.82}
            onPress={() => navigation.getParent()?.navigate('Square', {
              screen: 'PostDetail',
              params: { id: post.id },
            })}
          >
            <Image source={{ uri: post.mediaUrl }} style={styles.postImage} resizeMode="cover" />
            <View style={styles.postBody}>
              {!!post.tag && <Text style={styles.postTag}>#{post.tag}</Text>}
              <Text style={styles.postText} numberOfLines={3}>{post.text}</Text>
              {!!post.location && <Text style={styles.postMeta}>{post.location} · {post.createdAt}</Text>}
              <View style={styles.postActions}>
                <Text style={styles.postActionText}>♡ {post.likes}</Text>
                <Text style={styles.postActionText}>评论 {post.comments.length}</Text>
                <Text style={styles.postActionText}>收藏 {post.favorites}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {publicPosts.length === 0 && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>你还没有发布公开动态</Text>
            <Text style={styles.emptyText}>完成一次遛狗记录后，可以选择公开为动态。</Text>
            <TouchableOpacity
              style={styles.walkBtn}
              activeOpacity={0.75}
              onPress={() => navigation.getParent()?.navigate('Walk')}
            >
              <Text style={styles.walkBtnText}>去遛狗</Text>
            </TouchableOpacity>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

function WalkDynamicCard({ dynamic }) {
  return (
    <Card style={styles.walkDynamicCard}>
      <View style={styles.walkMap}>
        <Ionicons name="map-outline" size={34} color="rgba(52, 112, 72, 0.45)" />
      </View>
      <Text style={styles.walkTitle}>{dynamic.title}</Text>
      <Text style={styles.walkMeta}>{dynamic.meta}</Text>
      <Text style={styles.walkText}>{dynamic.text}</Text>
      <View style={styles.postActions}>
        <Text style={styles.postActionText}>♡ {dynamic.likes}</Text>
        <Text style={styles.postActionText}>评论 {dynamic.comments}</Text>
        <Text style={styles.postActionText}>收藏</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screenMargin, paddingBottom: 48 },
  profileCard: { overflow: 'hidden', padding: 0 },
  cover: {
    height: 92,
    backgroundColor: '#D5E2C9',
  },
  profileMain: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 14,
    paddingHorizontal: spacing.md,
    marginTop: -34,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: colors.white,
    backgroundColor: 'rgba(185, 207, 50, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: { flex: 1, paddingBottom: 4 },
  name: { ...typography.h2, color: colors.secondary },
  area: { ...typography.caption, color: colors.textLight, marginTop: 2 },
  signature: { ...typography.body, color: colors.textMain, marginTop: 8 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 18,
  },
  statItem: { alignItems: 'center', minWidth: 72 },
  statValue: { ...typography.h3, color: colors.secondary },
  statLabel: { ...typography.caption, color: colors.textLight, marginTop: 2 },
  editProfileBtn: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    height: 44,
    borderRadius: spacing.radiusPill,
    borderWidth: 1.5,
    borderColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileText: { ...typography.bodyBold, color: colors.secondary },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { ...typography.h3, color: colors.secondary },
  sectionLink: { ...typography.bodyBold, color: colors.textLight },
  dogGrid: { gap: 12, marginBottom: 20 },
  dogCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
  },
  dogInfo: { flex: 1 },
  dogName: { ...typography.bodyBold, color: colors.textMain, marginBottom: 2 },
  dogMeta: { ...typography.caption, color: colors.textLight, marginBottom: 8 },
  traitRow: { flexDirection: 'row', gap: 8 },
  traitChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.chipDefault,
  },
  traitText: { ...typography.captionBold, color: colors.secondary },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: spacing.radiusPill,
    backgroundColor: 'rgba(185, 207, 50, 0.2)',
  },
  badgePillText: { ...typography.captionBold, color: colors.secondary },
  emptyCard: { alignItems: 'center' },
  emptyTitle: { ...typography.bodyBold, color: colors.textMain, marginBottom: 6 },
  emptyText: { ...typography.body, color: colors.textLight },
  walkBtn: {
    marginTop: 14,
    paddingHorizontal: 28,
    height: 42,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walkBtnText: { ...typography.bodyBold, color: colors.secondary },
  walkDynamicCard: { gap: 9 },
  walkMap: {
    height: 92,
    borderRadius: spacing.radiusSm,
    backgroundColor: '#D5E2C9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walkTitle: { ...typography.bodyBold, color: colors.textMain },
  walkMeta: { ...typography.captionBold, color: colors.textLight },
  walkText: { ...typography.body, color: colors.textMain },
  postCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    marginBottom: spacing.cardGap,
  },
  postImage: {
    width: 92,
    aspectRatio: 3 / 4,
    borderRadius: spacing.radiusSm,
    backgroundColor: '#D5E2C9',
  },
  postBody: { flex: 1, gap: 6 },
  postTag: { ...typography.captionBold, color: colors.secondary },
  postText: { ...typography.body, color: colors.textMain },
  postMeta: { ...typography.caption, color: colors.textLight },
  postActions: { flexDirection: 'row', gap: 14, marginTop: 2 },
  postActionText: { ...typography.caption, color: colors.textLight },
});
