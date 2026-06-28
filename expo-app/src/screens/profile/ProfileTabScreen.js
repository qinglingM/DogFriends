import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Image, ImageBackground, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useSquare } from '../../contexts/SquareContext';
import { useProfile } from '../../contexts/ProfileContext';
import { useDogs } from '../../contexts/DogContext';
import { useExplore } from '../../contexts/ExploreContext';
import { useAuth } from '../../contexts/AuthContext';
import { StatusBadge } from '../../components';
import FeedCard from '../../components/FeedCard';
import { formatPostTime } from '../../utils/time';
import { uploadImage } from '../../utils/uploadService';
import { imageUrl } from '../../utils/imageUrl';
import { OWNER_PROFILE, USER_PROFILES, OWNER_NAME_CONST } from '../../data/userProfiles';
import { getPostImages } from '../../utils/postHelpers';
import { SIZE_LABELS } from '../../constants/dog';

function calcAge(birthday) {
  if (!birthday) return '';
  const birth = new Date(birthday + 'T00:00:00');
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months--;
  if (months < 0) { years--; months += 12; }
  if (years > 0) return months > 0 ? `${years}岁${months}个月` : `${years}岁`;
  if (months > 0) return `${months}个月`;
  return '不到1个月';
}

function formatCount(n) {
  if (n >= 100000000) return (n / 100000000).toFixed(1) + '亿';
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  return String(n);
}

function getNextBirthday(dog) {
  if (!dog.birthday) return null;
  const parts = dog.birthday.split('-');
  const birthMonth = parseInt(parts[1]) - 1;
  const birthDay = parseInt(parts[2]);
  const birthYear = parseInt(parts[0]);
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const thisYearBday = new Date(today.getFullYear(), birthMonth, birthDay);
  const nextYearBday = new Date(today.getFullYear() + 1, birthMonth, birthDay);
  const next = thisYearBday >= todayStart ? thisYearBday : nextYearBday;
  const days = Math.ceil((next - todayStart) / (1000 * 60 * 60 * 24));
  const turnAge = next.getFullYear() - birthYear;
  return { days, turnAge, date: next };
}

function BirthdayCard({ dogs }) {
  const upcoming = useMemo(() => {
    return dogs
      .map(d => ({ dog: d, info: getNextBirthday(d) }))
      .filter(x => x.info)
      .sort((a, b) => a.info.days - b.info.days);
  }, [dogs]);

  const item = upcoming[0];
  if (!item) return null;

  const isToday = item.info.days === 0;
  return (
    <View style={s.birthdayCard}>
      <View style={s.birthdayHeader}>
        <Ionicons name="gift" size={20} color={colors.accent} />
        <Text style={s.birthdayTitle}>
          {isToday ? '生日快乐 🎉' : '即将到来的生日'}
        </Text>
      </View>
      <View style={s.birthdayBody}>
        <Text style={s.birthdayDog}>{item.dog.name}</Text>
        <Text style={s.birthdayInfo}>
          {isToday
            ? `今天 ${item.info.turnAge} 岁啦！`
            : `还有 ${item.info.days} 天 · 即将满 ${item.info.turnAge} 岁 🐾`}
        </Text>
      </View>
    </View>
  );
}

const MENU_ITEMS = [
  { label: '我的收藏', icon: 'bookmark-outline', bg: 'rgba(185, 207, 50, 0.2)', route: 'FavoriteLocations' },
  { label: '遛狗记录', icon: 'walk-outline', bg: 'rgba(146, 102, 153, 0.15)', route: 'WalkHistory' },
  { label: '互动消息', icon: 'notifications-outline', bg: 'rgba(185, 207, 50, 0.2)', route: 'Notifications' },
];

function StatBlock({ value, label, onPress }) {
  const content = (
    <>
      <Text style={s.statValue}>{formatCount(value)}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </>
  );
  if (onPress) {
    return (
      <TouchableOpacity style={s.statBlock} activeOpacity={0.7} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }
  return <View style={s.statBlock}>{content}</View>;
}

function DogCard({ dog, navigation, isSelf, isExpanded, onToggleExpand, totalCount }) {
  if (!dog) return null;
  const ws = dog.walkStats;
  const genderBorderColor = dog.gender === 'male' ? '#4A90D9' : '#E88BA4';

  if (dog.publicProfile === false) {
    return (
      <View style={s.dogCard}>
        <View style={s.dogCardHeader}>
          <View style={[s.dogCardAvatar, { borderColor: genderBorderColor }]}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.textLight} />
          </View>
          <View style={s.dogCardInfoRow}>
            <Text style={s.dogCardName}>狗狗</Text>
            <View style={{ width: 22 }} />
            <Text style={s.dogCardBreed}>未公开档案</Text>
            <View style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={s.dogCard}
      activeOpacity={0.85}
      onPress={onToggleExpand}
    >
      <View style={s.dogCardHeader}>
        <Image source={{ uri: imageUrl(dog.image) }} style={[s.dogCardAvatar, { borderColor: genderBorderColor }]} />
        <View style={s.dogCardInfoRow}>
          <Text style={s.dogCardName}>{dog.name}</Text>
          <Ionicons name={dog.gender === 'male' ? 'male' : 'female'} size={14} color={colors.textLight} />
          {dog.traits && dog.traits.length > 0 && (
            <View style={s.dogCardTagsInline}>
              {dog.traits.slice(0, 3).map((t, i) => (
                <View key={i} style={s.dogCardTag}>
                  <Text style={s.dogCardTagText}>{t}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={{ flex: 1 }} />
          <Text style={s.dogCardBreed}>{dog.breed}</Text>
        </View>
        <TouchableOpacity
          style={s.dogCardChevron}
          activeOpacity={0.7}
          onPress={onToggleExpand}
        >
          <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      {isExpanded && (
        <View style={s.dogCardBody}>
          <View style={s.dogCardDivider} />
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
            minHeight: spacing.touchTarget,
            paddingLeft: spacing.touchTarget + spacing.sm,
          }}>
            {dog.size ? (
              <Text style={s.dogCardDetailText}>
                {SIZE_LABELS[dog.size]}
              </Text>
            ) : null}
            {dog.size ? <View style={{ width: 14 }} /> : null}
            <Text style={s.dogCardDetailText}>{dog.birthday || ''}</Text>
            <View style={{ flex: 1 }} />
            <Text style={s.dogCardDetailText}>{dog.birthday ? calcAge(dog.birthday) : ''}</Text>
            {isSelf && (
              <TouchableOpacity
                style={s.dogCardEditBtn}
                activeOpacity={0.7}
                onPress={(e) => { e.stopPropagation(); navigation.navigate('DogEdit', { dogId: dog.id }); }}
              >
                <Ionicons name="create-outline" size={16} color={colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ProfileTabScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { posts } = useSquare();
  const { profile: userProfile, updateProfile } = useProfile();
  const { dogs } = useDogs();
  const { contributions, getLocation } = useExplore();
  const { user } = useAuth();

  const userName = route?.params?.userName;
  const isSelf = route.name !== 'PersonalProfile' || !userName || userName === OWNER_NAME_CONST;

  const otherProfile = !isSelf ? USER_PROFILES[userName] : null;
  const displayProfile = isSelf
    ? { ...OWNER_PROFILE, ...Object.fromEntries(Object.entries(userProfile || {}).filter(([_, v]) => v != null)) }
    : otherProfile || OWNER_PROFILE;
  const dogsList = isSelf ? dogs : (otherProfile?.dogs || []);

  const [expandedDogId, setExpandedDogId] = useState(null);
  const sidebarAnim = useRef(new Animated.Value(0)).current;
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [feedTab, setFeedTab] = useState('square');

  const openSidebar = useCallback(() => {
    setSidebarVisible(true);
    Animated.timing(sidebarAnim, {
      toValue: 1, duration: 250, useNativeDriver: true,
    }).start();
  }, []);

  const closeSidebar = useCallback(() => {
    Animated.timing(sidebarAnim, {
      toValue: 0, duration: 200, useNativeDriver: true,
    }).start(() => setSidebarVisible(false));
  }, []);

  const publicPosts = useMemo(() => {
    return posts
      .filter(post => post.userName === displayProfile.name && post.visibility === 'public')
      .map(post => ({
        id: post.id,
        type: '普通图文动态',
        title: post.tag ? `#${post.tag}` : '我的分享',
        meta: `${post.location || displayProfile.area} · ${post.createdAt}`,
        text: post.text,
        createdAt: post.createdAt,
        location: post.location || displayProfile.area,
        likes: post.likes,
        comments: post.comments.length,
        favorites: post.favorites,
        liked: post.liked,
        images: getPostImages(post),
        sourcePostId: post.id,
      }));
  }, [posts]);

  const exploreFeed = useMemo(() => {
    return contributions.map(c => ({
      ...c,
      location: getLocation(c.locationId),
    })).filter(c => c.location);
  }, [contributions]);

  const pickCover = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [2, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.[0]) {
      try {
        const url = await uploadImage(result.assets[0].uri, `${user.id}/covers`, 'cover');
        updateProfile({ cover: url });
      } catch (e) {
        Alert.alert('上传失败', '封面上传失败，请重试');
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!isSelf) {
        const parent = navigation.getParent();
        parent?.setOptions({ tabBarStyle: { display: 'none' } });
        return () => {
          parent?.setOptions({
              tabBarStyle: {
                backgroundColor: colors.white,
                borderTopWidth: 1,
                borderTopColor: colors.border,
                height: spacing.bottomTabHeight + Math.max(insets.bottom + 8, 10) - 14,
                paddingTop: 4,
                paddingBottom: Math.max(insets.bottom + 8, 10),
              },
            });
        };
      }
    }, [navigation, isSelf])
  );

  const genderIcon = displayProfile.gender === 'male' ? 'male' : displayProfile.gender === 'female' ? 'female' : null;
  const hasCover = !!displayProfile.cover;
  const defaultAvatarIcon = !displayProfile.avatar
    ? displayProfile.gender === 'male' ? 'male' : displayProfile.gender === 'female' ? 'female' : 'person'
    : null;
  const defaultAvatarBg = !displayProfile.avatar
    ? displayProfile.gender === 'male' ? colors.secondary : displayProfile.gender === 'female' ? colors.accent : colors.textLight
    : null;

  function ProfileHeroContent() {
    return (
      <View style={s.ownerProfileRow}>
        {displayProfile.avatar ? (
          <Image source={{ uri: imageUrl(displayProfile.avatar) }} style={s.heroAvatar} />
        ) : (
          <View style={[s.heroAvatar, { backgroundColor: defaultAvatarBg, alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons name={defaultAvatarIcon} size={32} color={colors.white} />
          </View>
        )}
        <View style={s.heroNameBlock}>
          <View style={s.heroNameRow}>
            <Text style={s.heroName}>{displayProfile.name}</Text>
            {genderIcon && <Ionicons name={genderIcon} size={16} color={colors.white} />}
            {isSelf ? (
              <TouchableOpacity
                style={s.heroEditBtn}
                activeOpacity={0.75}
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Ionicons name="create-outline" size={16} color={colors.white} />
                <Text style={s.heroEditBtnText}>编辑资料</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[s.heroFollowBtn, isFollowing && s.heroFollowedBtn]}
                activeOpacity={0.75}
                onPress={() => setIsFollowing(!isFollowing)}
              >
                <Text style={s.heroFollowBtnText}>{isFollowing ? '已关注' : '关注'}</Text>
              </TouchableOpacity>
            )}
          </View>
          {displayProfile.signature ? (
            <Text style={s.heroSignature} numberOfLines={2}>{displayProfile.signature}</Text>
          ) : null}

          <View style={s.heroSocialRow}>
            <StatBlock
              value={displayProfile.following}
              label="关注"
              onPress={() => navigation.navigate('FollowList', { type: 'following' })}
            />
            <View style={s.heroStatDivider} />
            <StatBlock
              value={displayProfile.followers}
              label="粉丝"
              onPress={() => navigation.navigate('FollowList', { type: 'follower' })}
            />
            <View style={s.heroStatDivider} />
            <StatBlock value={displayProfile.likes} label="获赞" />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {/* Hero: Cover image + owner profile overlay */}
        {isSelf ? (
          <TouchableOpacity activeOpacity={0.85} onPress={pickCover}>
            {hasCover ? (
              <ImageBackground
                source={{ uri: imageUrl(displayProfile.cover) }}
                style={[s.hero, { paddingTop: insets.top }]}
              >
                <TouchableOpacity
                  style={[s.menuBtn, { top: insets.top + 8 }]}
                  onPress={openSidebar}
                  activeOpacity={0.7}
                >
                  <Ionicons name="menu-outline" size={20} color={colors.white} />
                </TouchableOpacity>
                <View style={s.heroOverlay}>
                  <ProfileHeroContent />
                </View>
              </ImageBackground>
            ) : (
              <View style={[s.hero, s.heroCoverPlaceholder, { paddingTop: insets.top }]}>
                <TouchableOpacity
                  style={[s.menuBtn, { top: insets.top + 8 }]}
                  onPress={openSidebar}
                  activeOpacity={0.7}
                >
                  <Ionicons name="menu-outline" size={20} color={colors.white} />
                </TouchableOpacity>
                <View style={s.coverHintRow}>
                  <Ionicons name="camera-outline" size={16} color="rgba(255,255,255,0.7)" />
                  <Text style={s.coverHintText}>轻点添加相册背景</Text>
                </View>
                <View style={s.heroOverlay}>
                  <ProfileHeroContent />
                </View>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View>
            {hasCover ? (
              <ImageBackground
                source={{ uri: imageUrl(displayProfile.cover) }}
                style={[s.hero, { paddingTop: insets.top }]}
              >
                <TouchableOpacity
                  style={[s.backBtn, { top: insets.top + 8 }]}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={20} color={colors.white} />
                </TouchableOpacity>
                <View style={s.heroOverlay}>
                  <ProfileHeroContent />
                </View>
              </ImageBackground>
            ) : (
              <View style={[s.hero, s.heroCoverPlaceholder, { paddingTop: insets.top }]}>
                <TouchableOpacity
                  style={[s.backBtn, { top: insets.top + 8 }]}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={20} color={colors.white} />
                </TouchableOpacity>
                <View style={s.heroOverlay}>
                  <ProfileHeroContent />
                </View>
              </View>
            )}
          </View>
        )}

        {/* Dog cards section */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>{isSelf ? '我的狗狗' : 'TA的狗狗'} {dogsList.length}只</Text>
            {isSelf && (
              <TouchableOpacity
                style={s.sectionAction}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('DogEdit')}
              >
                <Ionicons name="add-circle" size={28} color={colors.secondary} />
              </TouchableOpacity>
            )}
          </View>

          {dogsList.length > 0 ? (
            <View style={s.dogCardGrid}>
              {dogsList.map(dog => (
                <DogCard
                  key={dog.id}
                  dog={dog}
                  navigation={navigation}
                  isSelf={isSelf}
                  isExpanded={expandedDogId === dog.id}
                  onToggleExpand={() => setExpandedDogId(expandedDogId === dog.id ? null : dog.id)}
                  totalCount={dogsList.length}
                />
              ))}
            </View>
          ) : isSelf ? (
            <TouchableOpacity
              style={s.dogEmptyCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('DogEdit')}
            >
              <Ionicons name="paw-outline" size={40} color={colors.border} />
              <Text style={s.dogEmptyText}>还没有狗狗，点击添加</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Feed section */}
        <View style={s.section}>
          <View style={s.feedTabBar}>
            <TouchableOpacity
              style={[s.feedTab, feedTab === 'square' && s.feedTabActive]}
              onPress={() => setFeedTab('square')}
            >
              <Text style={[s.feedTabText, feedTab === 'square' && s.feedTabTextActive]}>广场</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.feedTab, feedTab === 'explore' && s.feedTabActive]}
              onPress={() => setFeedTab('explore')}
            >
              <Text style={[s.feedTabText, feedTab === 'explore' && s.feedTabTextActive]}>去玩</Text>
            </TouchableOpacity>
          </View>
          <View style={s.feedList}>
            {feedTab === 'square' ? (
              publicPosts.length === 0 ? (
                <View style={s.feedEmpty}>
                  <Ionicons name="images-outline" size={32} color={colors.textLight} />
                  <Text style={s.feedEmptyText}>还没有广场动态</Text>
                </View>
              ) : (
                publicPosts.map(item => (
                  <FeedCard
                    key={item.id}
                    item={item}
                    profile={displayProfile}
                    interactive
                    onPress={() => navigation.navigate('ProfileFeedDetail', { item, profile: displayProfile })}
                  />
                ))
              )
            ) : (
              exploreFeed.length === 0 ? (
                <View style={s.feedEmpty}>
                  <Ionicons name="paw-outline" size={32} color={colors.textLight} />
                  <Text style={s.feedEmptyText}>还没有去玩记录</Text>
                </View>
              ) : (
                exploreFeed.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={s.exploreCard}
                    activeOpacity={0.78}
                    onPress={() => navigation.navigate('LocationDetail', { id: c.locationId })}
                  >
                    <View style={s.exploreCardThumb}>
                      {c.location.photos?.[0] ? (
                        <Image source={{ uri: imageUrl(c.location.photos[0]) }} style={s.exploreCardImage} />
                      ) : (
                        <Ionicons name="image-outline" size={28} color={colors.secondary} style={{ opacity: 0.4 }} />
                      )}
                    </View>
                    <View style={s.exploreCardBody}>
                      <Text style={s.exploreCardName} numberOfLines={1}>{c.locationName}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <View style={[s.contribBadge, {
                          backgroundColor: c.bucket === 'created' ? colors.secondary : '#926699',
                        }]}>
                          <Text style={s.contribBadgeText}>
                            {c.bucket === 'created' ? '开拓' : '验证'}
                          </Text>
                        </View>
                        <Text style={s.exploreCardMeta}>{c.locationLabel}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                        <StatusBadge status={c.status} />
                        <Text style={[s.exploreCardMeta, { marginLeft: 'auto' }]}>{formatPostTime(c.time)}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                  </TouchableOpacity>
                ))
              )
            )}
          </View>
        </View>

      </ScrollView>

      <Modal visible={sidebarVisible} transparent animationType="none" onRequestClose={closeSidebar}>
        <View style={s.sidebarOverlay}>
          <TouchableOpacity style={s.sidebarBackdrop} activeOpacity={1} onPress={closeSidebar} />
          <Animated.View style={[s.sidebar, { transform: [{ translateX: sidebarAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [260, 0],
          }) }] }]}>
            <TouchableOpacity style={s.sidebarClose} onPress={closeSidebar}>
              <Ionicons name="close" size={24} color={colors.secondary} />
            </TouchableOpacity>
            {isSelf && <BirthdayCard dogs={dogs} />}
            {MENU_ITEMS.map(item => (
              <TouchableOpacity
                key={item.route}
                style={s.sidebarItem}
                onPress={() => { closeSidebar(); navigation.navigate(item.route); }}
              >
                <View style={[s.sidebarItemIcon, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon} size={22} color={colors.secondary} />
                </View>
                <Text style={s.sidebarItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={s.sidebarItem}
              onPress={() => { closeSidebar(); navigation.navigate('Settings'); }}
            >
              <View style={[s.sidebarItemIcon, { backgroundColor: 'rgba(106, 128, 108, 0.1)' }]}>
                <Ionicons name="settings-outline" size={22} color={colors.textLight} />
              </View>
              <Text style={s.sidebarItemText}>设置</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { paddingBottom: spacing.xxl },

  /* Hero */
  hero: { height: 360, justifyContent: 'flex-end' },
  heroCoverPlaceholder: {
    backgroundColor: colors.textMain,
    justifyContent: 'flex-end',
  },
  coverHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  coverHintText: {
    ...typography.captionBold,
    color: 'rgba(255,255,255,0.7)',
  },
  heroOverlay: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  ownerProfileRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  heroAvatar: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 2, borderColor: colors.white, backgroundColor: colors.chipDefault,
  },
  heroNameBlock: { flex: 1 },
  heroNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  heroName: { ...typography.h2, color: colors.white, fontSize: 24 },
  heroSignature: { ...typography.caption, color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 22 },
  heroSocialRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: spacing.xs, gap: spacing.md,
  },
  statBlock: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  statValue: { ...typography.captionBold, color: colors.white, fontSize: 14 },
  statLabel: { ...typography.caption, color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  heroStatDivider: { width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.3)' },
  heroEditBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    height: 24, paddingHorizontal: spacing.sm,
    borderRadius: spacing.radiusPill,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)',
  },
  heroEditBtnText: { ...typography.captionBold, color: colors.white, fontSize: 14 },
  heroFollowBtn: {
    height: 24, paddingHorizontal: spacing.sm,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  heroFollowedBtn: { backgroundColor: colors.border },
  heroFollowBtnText: { ...typography.caption, color: colors.white, fontWeight: 600, fontSize: 14 },

  /* Section */
  section: { marginTop: 12 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, marginBottom: spacing.sm,
  },
  sectionTitle: { ...typography.h3, color: colors.secondary },
  sectionAction: { flexDirection: 'row', alignItems: 'center', minHeight: spacing.touchTarget },

  /* Dog empty state */
  dogEmptyCard: {
    marginHorizontal: spacing.md,
    paddingVertical: 36,
    borderRadius: spacing.radiusMd,
    backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed',
  },
  dogEmptyText: { ...typography.body, color: colors.textLight },

  /* Dog card list */
  dogCardGrid: {
    paddingHorizontal: spacing.md, gap: spacing.sm,
  },
  dogCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    paddingVertical: spacing.xs, paddingHorizontal: spacing.sm,
  },
  dogCardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
  },
  dogCardAvatar: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 2, backgroundColor: colors.chipDefault,
    alignItems: 'center', justifyContent: 'center',
  },
  dogCardInfoRow: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
  },
  dogCardName: { ...typography.bodyBold, fontSize: 14, color: colors.secondary },
  dogCardBreed: { ...typography.caption, color: colors.textLight, fontSize: 12 },
  dogCardEditBtn: {
    width: spacing.touchTarget, height: spacing.touchTarget,
    alignItems: 'center', justifyContent: 'center',
  },
  dogCardEditText: { ...typography.caption, color: colors.textLight },
  dogCardTags: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.tightGap, marginTop: 2,
  },
  dogCardTagsInline: {
    flexDirection: 'row', flexWrap: 'nowrap', gap: spacing.tightGap,
  },
  dogCardTag: {
    paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: spacing.radiusPill, backgroundColor: colors.chipDefault,
  },
  dogCardTagText: { ...typography.caption, color: colors.secondary, fontSize: 10 },
  dogCardBody: { marginTop: spacing.sm },
  dogCardDivider: { height: 1, backgroundColor: colors.border, marginBottom: spacing.xs },
  dogCardWalkStats: {
    flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.sm,
  },
  dogCardWalkStat: { alignItems: 'center' },
  dogCardWalkValue: { ...typography.bodyBold, fontSize: 16, color: colors.secondary },
  dogCardWalkLabel: { ...typography.caption, color: colors.textLight },
  dogCardDetailText: { ...typography.caption, color: colors.textLight, fontSize: 13 },
  dogCardChevron: {
    width: spacing.touchTarget, height: spacing.touchTarget,
    alignItems: 'center', justifyContent: 'center',
  },

  /* Feed tab bar */
  feedTabBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  feedTab: {
    flex: 1, alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  feedTabActive: { borderBottomColor: colors.secondary },
  feedTabText: { ...typography.body, color: colors.textLight },
  feedTabTextActive: { color: colors.secondary, ...typography.bodyBold },
  feedEmpty: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  feedEmptyText: { ...typography.body, color: colors.textLight },
  /* Explore card */
  exploreCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: spacing.radiusMd,
    padding: 12,
  },
  exploreCardThumb: {
    width: 72, height: 72,
    backgroundColor: '#D3E0C8', borderRadius: spacing.radiusSm,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  exploreCardImage: { width: '100%', height: '100%' },
  exploreCardBody: { flex: 1 },
  exploreCardName: { ...typography.bodyBold, color: colors.textMain },
  exploreCardMeta: { ...typography.caption, color: colors.textLight, marginTop: 2 },
  contribBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: spacing.radiusPill,
  },
  contribBadgeText: { fontSize: 10, color: colors.white, fontWeight: 600 },
  /* Feed */
  feedList: { paddingHorizontal: spacing.md, gap: 8 },

  /* Hamburger button */
  menuBtn: {
    position: 'absolute', right: 12,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  backBtn: {
    position: 'absolute', left: 12,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },

  /* Sidebar overlay */
  sidebarOverlay: {
    flex: 1,
  },
  sidebarBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sidebar: {
    position: 'absolute', right: 0, top: 0, bottom: 0,
    width: 260,
    backgroundColor: colors.white,
    paddingTop: 60,
    paddingHorizontal: spacing.md,
    shadowColor: '#000', shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 8,
  },
  sidebarClose: {
    alignSelf: 'flex-end',
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  sidebarDivider: { height: 1, backgroundColor: colors.border, marginBottom: spacing.sm },
  sidebarItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  sidebarItemIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  sidebarItemText: {
    flex: 1, ...typography.bodyBold, color: colors.secondary, fontSize: 16,
  },
  birthdayCard: {
    backgroundColor: 'rgba(146, 102, 153, 0.08)',
    borderRadius: spacing.radiusMd,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  birthdayHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  birthdayTitle: { ...typography.captionBold, color: colors.accent, fontSize: 13 },
  birthdayBody: { gap: 2 },
  birthdayDog: { ...typography.bodyBold, color: colors.secondary, fontSize: 16 },
  birthdayInfo: { ...typography.caption, color: colors.textLight },
});
