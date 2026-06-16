import React, { useState, useMemo, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Animated, Image, ImageBackground, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Card, DogAvatar } from '../../components';
import { useSquare } from '../../contexts/SquareContext';
import { useProfile } from '../../contexts/ProfileContext';
import { useDogs, getPublicDogName } from '../../contexts/DogContext';
import FeedCard from '../../components/FeedCard';

const SIZE_LABELS = { small: '小型犬', medium: '中型犬', large: '大型犬' };

function calcAge(birthday) {
  if (!birthday) return '';
  const birth = new Date(birthday + 'T00:00:00');
  const now = new Date();
  const totalMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  const years = totalMonths / 12;
  const rounded = Math.round(years * 2) / 2;
  if (rounded <= 0) return '不到半岁';
  return rounded % 1 === 0 ? `${rounded}岁` : `${rounded}岁`;
}
import { OWNER_PROFILE, USER_PROFILES, OWNER_NAME_CONST } from '../../data/userProfiles';

const PROFILE_FEED = [
  {
    id: 'feed_plain_1', type: '普通图文动态', title: '旺财今天认识了新朋友',
    meta: '上海 · 日常分享',
    text: '傍晚在小区附近散步，旺财遇到一只很温柔的边牧，两个小朋友闻了半天，最后一起走了一小段。',
    createdAt: '今天 18:40', location: '上海',
    likes: 54, comments: 7, favorites: 12, liked: false,
    images: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=500&q=80',
    ],
  },
  {
    id: 'feed_walk_1', type: '公开遛狗动态', title: '和旺财完成了一次傍晚遛狗',
    meta: '上海 · 42分钟 · 2.3km · 傍晚',
    text: '今天风很舒服，路线只展示大致区域，不展示起终点。旺财一路闻闻停停，状态很好。',
    createdAt: '今天 19:20', location: '上海',
    walkRecord: { distance: '2.3', duration: '42:18', pace: "18'20\"", area: '滨江步道' },
    likes: 128, comments: 16, favorites: 32, liked: true,
    images: [
      'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=500&q=80',
    ],
  },
];

const PERSONAL_FEED = [
  {
    id: 'feed_plain_1', type: '普通图文动态', title: '旺财今天认识了新朋友',
    meta: '上海 · 日常分享',
    text: '傍晚在小区附近散步，旺财遇到一只很温柔的边牧，两个小朋友闻了半天，最后一起走了一小段。',
    createdAt: '今天 18:40', location: '上海',
    likes: 54, comments: 7, favorites: 12, liked: false,
    images: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=500&q=80',
    ],
  },
  {
    id: 'feed_walk_1', type: '公开遛狗动态', title: '和旺财完成了一次傍晚遛狗',
    meta: '上海 · 42分钟 · 2.3km · 傍晚',
    text: '今天风很舒服，路线只展示大致区域，不展示起终点。旺财一路闻闻停停，状态很好。',
    createdAt: '今天 19:20', location: '上海',
    walkRecord: { distance: '2.3', duration: '42:18', pace: "18'20\"", area: '滨江步道' },
    likes: 128, comments: 16, favorites: 32, liked: true,
    images: [
      'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=500&q=80',
    ],
  },
  {
    id: 'feed_place_1', type: '地点体验动态', title: '这家咖啡店户外对狗狗很友好',
    meta: 'BLOOM Coffee · 咖啡店',
    text: '户外座位宽，店员会主动给水碗。大型犬建议避开周末高峰，平日下午更舒服。',
    createdAt: '昨天 15:30', location: '上海',
    likes: 96, comments: 8, favorites: 24, liked: false,
    images: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1601758177266-bc599de87707?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=500&q=80',
    ],
  },
];

const MENU_ITEMS = [
  { label: '我的收藏', icon: 'bookmark-outline', bg: 'rgba(185, 207, 50, 0.2)', route: 'FavoriteLocations' },
  { label: '我分享过', icon: 'clipboard-outline', bg: 'rgba(185, 207, 50, 0.2)', route: 'ContributionHistory' },
];

function StatBlock({ value, label }) {
  return (
    <View style={s.statBlock}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function SectionHeader({ title, suffix, action, onPress }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>
        {title} {!!suffix && <Text style={s.sectionSuffix}>{suffix}</Text>}
      </Text>
      {!!action && (
        <TouchableOpacity style={s.sectionAction} activeOpacity={0.75} onPress={onPress}>
          <Text style={s.sectionActionText}>{action}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function CircleButton({ icon, onPress }) {
  return (
    <TouchableOpacity style={s.circleButton} activeOpacity={0.75} onPress={onPress}>
      <Ionicons name={icon} size={23} color={colors.white} />
    </TouchableOpacity>
  );
}

function OwnerContent({ navigation, feed, profile }) {
  const genderIcon = profile.gender === 'male' ? 'male' : profile.gender === 'female' ? 'female' : null;
  return (
    <View style={s.ownerContent}>
      {/* Profile header */}
      <View style={s.profileHeader}>
        <Image source={{ uri: profile.avatar }} style={s.avatar} />
        <View style={s.nameBlock}>
          <View style={s.nameRow}>
            <Text style={s.name}>{profile.name}</Text>
            {genderIcon && <Ionicons name={genderIcon} size={16} color={colors.accent} />}
            <TouchableOpacity
              style={s.editBtn}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text style={s.editBtnText}>编辑</Text>
            </TouchableOpacity>
          </View>
          <View style={s.locationRow}>
            <Ionicons name="location-outline" size={16} color={colors.textLight} />
            <Text style={s.locationText}>{profile.area}</Text>
          </View>
          <Text style={s.signature}>{profile.signature}</Text>
        </View>
      </View>
      <View style={s.socialRow}>
        <StatBlock value={profile.following} label="关注" />
        <View style={s.statDivider} />
        <StatBlock value={profile.followers} label="粉丝" />
        <View style={s.statDivider} />
        <StatBlock value={profile.likes} label="获赞" />
      </View>

      {/* Feed */}
      <View style={s.feedList}>
        {feed.map(item => (
          <FeedCard
            key={item.id}
            item={item}
            profile={profile}
            onPress={() => navigation.navigate('ProfileFeedDetail', { item, profile })}
          />
        ))}
      </View>

      {/* Menu */}
      <View style={s.menuSection}>
        {MENU_ITEMS.map((entry, index) => (
          <TouchableOpacity
            key={entry.route}
            style={[s.menuItem, index === MENU_ITEMS.length - 1 && s.menuItemLast]}
            onPress={() => navigation.navigate(entry.route)}
            activeOpacity={0.75}
          >
            <View style={[s.menuIcon, { backgroundColor: entry.bg }]}>
              <Ionicons name={entry.icon} size={20} color={colors.secondary} />
            </View>
            <Text style={s.menuText}>{entry.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={s.settingsItem}
        onPress={() => navigation.navigate('Settings')}
        activeOpacity={0.75}
      >
        <View style={[s.menuIcon, { backgroundColor: 'rgba(106, 128, 108, 0.1)' }]}>
          <Ionicons name="settings-outline" size={20} color={colors.textLight} />
        </View>
        <Text style={s.menuText}>设置</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
      </TouchableOpacity>
    </View>
  );
}

function DogContent({ dog, navigation, isSelf = true }) {
  if (!dog) return null;
  const ws = dog.walkStats;
  const genderBorderColor = dog.gender === 'male' ? '#4A90D9' : '#E88BA4';
  return (
    <View style={s.dogContent}>
      {/* Dog header */}
      <View style={s.dogHeader}>
        <View style={[s.dogAvatarWrap, { borderColor: genderBorderColor }]}>
          <Image source={{ uri: dog.image }} style={s.dogAvatar} />
        </View>
        <View style={s.dogNameBlock}>
          <View style={s.dogNameRow}>
            <Text style={s.dogName}>{dog.name}</Text>
            {isSelf && (
              <TouchableOpacity
                style={s.editBtn}
                activeOpacity={0.75}
                onPress={() => navigation.navigate('DogEdit', { dogId: dog.id })}
              >
                <Text style={s.editBtnText}>编辑</Text>
              </TouchableOpacity>
            )}
          </View>
          {dog.traits && dog.traits.length > 0 && (
            <View style={s.traitRow}>
              {dog.traits.map((t, i) => (
                <View key={i} style={s.traitChip}>
                  <Text style={s.traitChipText}>{t}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      <Card>
        {[
          { icon: 'paw', label: '品种', value: dog.breed },
          { icon: dog.gender === 'female' ? 'female' : 'male', label: '性别', value: dog.gender === 'male' ? '♂ 公' : '♀ 母' },
          calcAge(dog.birthday) && { icon: 'time', label: '年龄', value: calcAge(dog.birthday) },
          dog.birthday && { icon: 'calendar', label: '生日', value: dog.birthday },
        ].filter(Boolean).map((row, i, arr) => (
          <View key={i} style={[s.infoRow, i < arr.length - 1 && s.infoRowBorder]}>
            <View style={s.infoLabel}>
              <Ionicons name={row.icon} size={16} color={colors.primary} />
              <Text style={s.infoLabelText}>{row.label}</Text>
            </View>
            <Text style={s.infoValue}>{row.value}</Text>
          </View>
        ))}
      </Card>

      {(isSelf || dog.publicWalkStats !== false) && (
        <>
          <SectionHeader title="遛狗统计" action={isSelf ? "查看全部 →" : undefined} onPress={isSelf ? () => navigation.navigate('WalkHistory') : undefined} />
          <Card>
            <View style={s.walkStatsRow}>
              <View style={s.walkStat}>
                <Ionicons name="paw" size={24} color={colors.primary} style={{ marginBottom: 8 }} />
                <Text style={s.walkStatValue}>{ws.walks} <Text style={s.walkStatUnit}>次</Text></Text>
                <Text style={s.walkStatLabel}>累计遛狗</Text>
              </View>
              <View style={s.walkStat}>
                <Ionicons name="trending-up" size={24} color={colors.primary} style={{ marginBottom: 8 }} />
                <Text style={s.walkStatValue}>{ws.distance} <Text style={s.walkStatUnit}>km</Text></Text>
                <Text style={s.walkStatLabel}>累计距离</Text>
              </View>
              <View style={s.walkStat}>
                <Ionicons name="time-outline" size={24} color={colors.primary} style={{ marginBottom: 8 }} />
                <Text style={s.walkStatValue}>{ws.duration} <Text style={s.walkStatUnit}>h</Text></Text>
                <Text style={s.walkStatLabel}>累计时长</Text>
              </View>
            </View>
          </Card>
        </>
      )}
    </View>
  );
}

export default function ProfileTabScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { posts } = useSquare();
  const { profile: userProfile, updateProfile } = useProfile();
  const { dogs, removeDog } = useDogs();

  const userName = route?.params?.userName;
  const isSelf = !userName || userName === OWNER_NAME_CONST;

  const otherProfile = !isSelf ? USER_PROFILES[userName] : null;
  const displayProfile = isSelf
    ? { ...OWNER_PROFILE, ...userProfile }
    : otherProfile || OWNER_PROFILE;
  const dogsList = isSelf ? dogs : (otherProfile?.dogs || []);

  const [activeTab, setActiveTab] = useState('owner');
  const [editingTabs, setEditingTabs] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const screenWidth = Dimensions.get('window').width;
  const contentScrollRef = useRef(null);

  const pages = useMemo(() => {
    const list = [{ key: 'owner', label: '主人' }];
    dogs.forEach(dog => list.push({ key: dog.id, label: dog.name }));
    return list;
  }, [dogs]);

  const handleTabPress = useCallback((key) => {
    const idx = pages.findIndex(p => p.key === key);
    if (idx >= 0 && contentScrollRef.current) {
      contentScrollRef.current.scrollTo({ x: idx * screenWidth, animated: true });
    }
    setActiveTab(key);
  }, [pages, screenWidth]);

  const handleContentScroll = useCallback((e) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const idx = Math.round(offsetX / screenWidth);
    if (idx >= 0 && idx < pages.length && pages[idx].key !== activeTab) {
      setActiveTab(pages[idx].key);
    }
  }, [pages, screenWidth, activeTab]);

  const handleDeleteDog = useCallback((dog) => {
    const shouldSwitchToOwner = dogs.length <= 1;
    Alert.alert('删除狗狗', `确定要删除「${dog.name}」吗？删除后不可恢复。`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除', style: 'destructive', onPress: () => {
          removeDog(dog.id);
          if (shouldSwitchToOwner) {
            setEditingTabs(false);
            setActiveTab('owner');
          }
        }
      },
    ]);
  }, [removeDog, dogs.length]);

  const pickCover = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [2, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.[0]) {
      updateProfile({ cover: result.assets[0].uri });
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
              height: spacing.bottomTabHeight,
              paddingBottom: 14,
              paddingTop: 4,
            },
          });
        };
      }
    }, [navigation, isSelf])
  );

  const navBarHeight = insets.top;
  const tabBarStopScroll = 288 - navBarHeight;

  const navBgOpacity = scrollY.interpolate({
    inputRange: [tabBarStopScroll - 120, tabBarStopScroll],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const fixedTabOpacity = scrollY.interpolate({
    inputRange: [tabBarStopScroll - 1, tabBarStopScroll],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const publicPosts = useMemo(() => {
    return posts
      .filter(post => post.authorName === displayProfile.name && post.visibility === 'public')
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
        images: [post.mediaUrl],
        sourcePostId: post.id,
      }));
  }, [posts]);
  const feed = [...publicPosts, ...(isSelf ? PROFILE_FEED : PERSONAL_FEED)];

  const subTabs = [
    { key: 'owner', label: '主人' },
    ...dogs.map(dog => ({ key: dog.id, label: dog.name })),
  ];

  const listData = [
    { type: 'hero' },
    { type: 'tabs' },
    { type: 'content' },
  ];

  if (!isSelf) {
    const otherPages = [
      { key: 'owner', label: '主人' },
      ...dogsList.map(dog => ({ key: dog.id, label: dog.publicProfile !== false ? dog.name : '小狗' })),
    ];

    return (
      <View style={s.screen}>
        <ImageBackground source={{ uri: displayProfile.cover }} style={[s.hero, { paddingTop: insets.top + 12, justifyContent: 'flex-start' }]}>
          <View style={s.heroNav}>
            <CircleButton icon="chevron-back" onPress={() => navigation.goBack()} />
            <View style={s.heroActions}>
              <CircleButton icon="share-social-outline" />
              <CircleButton icon="ellipsis-horizontal" />
            </View>
          </View>
        </ImageBackground>

        <View style={s.subTabRow}>
          <View style={s.subTabContent}>
            {otherPages.map(tab => {
              const isActive = tab.key === activeTab;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={s.subTab}
                  activeOpacity={0.7}
                  onPress={() => setActiveTab(tab.key)}
                >
                  <Text style={[s.subTabText, isActive && s.subTabTextActive]}>
                    {tab.label}
                  </Text>
                  {isActive && <View style={s.subTabIndicator} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          {activeTab === 'owner' ? (
            <View style={s.ownerContent}>
              <View style={s.profileHeader}>
                <Image source={{ uri: displayProfile.avatar }} style={s.avatar} />
                <View style={s.nameBlock}>
                  <View style={s.nameRow}>
                    <Text style={s.name}>{displayProfile.name}</Text>
                    <TouchableOpacity
                      style={s.followBtnInline}
                      activeOpacity={0.75}
                    >
                      <Text style={s.followTextInline}>关注</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={s.locationRow}>
                    <Ionicons name="location-outline" size={16} color={colors.textLight} />
                    <Text style={s.locationText}>{displayProfile.area}</Text>
                  </View>
                  <Text style={s.signature}>{displayProfile.signature}</Text>
                </View>
              </View>

              <View style={s.socialRow}>
                <StatBlock value={displayProfile.following} label="关注" />
                <View style={s.statDivider} />
                <StatBlock value={displayProfile.followers} label="粉丝" />
                <View style={s.statDivider} />
                <StatBlock value={displayProfile.likes} label="获赞" />
              </View>

              <View style={s.personalFeedList}>
                {feed.map(item => (
                  <FeedCard
                    key={item.id}
                    item={item}
                    profile={displayProfile}
                    onPress={() => {
                      navigation.navigate('ProfileFeedDetail', { item, profile: displayProfile });
                    }}
                  />
                ))}
              </View>
            </View>
          ) : (
            (() => {
              const dog = dogsList.find(d => d.id === activeTab);
              if (!dog) return null;
              if (dog.publicProfile === false) {
                return (
                  <View style={s.privateDogPlaceholder}>
                    <Ionicons name="lock-closed-outline" size={48} color={colors.textLight} />
                    <Text style={s.privateDogText}>此用户未公开爱犬档案</Text>
                  </View>
                );
              }
              return <DogContent dog={dog} navigation={navigation} isSelf={false} />;
            })()
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <Animated.FlatList
        data={listData}
        keyExtractor={item => item.type}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        renderItem={({ item }) => {
          if (item.type === 'hero') {
            return (
              <TouchableOpacity activeOpacity={0.9} onPress={pickCover}>
                {displayProfile.cover ? (
                  <ImageBackground
                    source={{ uri: displayProfile.cover }}
                    style={[s.hero, { paddingTop: insets.top + 12 }]}
                  />
                ) : (
                  <View style={[s.hero, s.heroPlaceholder, { paddingTop: insets.top + 12 }]}>
                    <Ionicons name="add-circle-outline" size={40} color="rgba(255,255,255,0.6)" />
                    <Text style={s.heroPlaceholderText}>轻点更换封面</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }
          if (item.type === 'tabs') {
            return (
              <View style={s.subTabRow}>
                <View style={s.subTabContent}>
                  {subTabs.map(tab => {
                    const isDog = tab.key !== 'owner';
                    const isActive = tab.key === activeTab;
                    const dogData = isDog ? dogs.find(d => d.id === tab.key) : null;
                    return (
                      <TouchableOpacity
                        key={tab.key}
                        style={s.subTab}
                        activeOpacity={0.7}
                        onPress={() => handleTabPress(tab.key)}
                      >
                        <Text style={[s.subTabText, isActive && s.subTabTextActive]}>
                          {tab.label}
                        </Text>
                        {isActive && <View style={s.subTabIndicator} />}
                        {editingTabs && isDog && dogData && (
                          <TouchableOpacity
                            style={s.subTabDeleteBadge}
                            activeOpacity={0.7}
                            onPress={(e) => { e.stopPropagation(); handleDeleteDog(dogData); }}
                          >
                            <Ionicons name="close" size={10} color={colors.white} />
                          </TouchableOpacity>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                  {editingTabs && (
                    <TouchableOpacity style={s.subTabAddBtn} activeOpacity={0.7} onPress={() => navigation.navigate('DogEdit')}>
                      <Ionicons name="add" size={16} color={colors.secondary} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={s.subTabEditBtn}
                    activeOpacity={0.7}
                    onPress={() => setEditingTabs(!editingTabs)}
                  >
                    <Ionicons name={editingTabs ? 'checkmark' : 'pencil-outline'} size={18} color={colors.secondary} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }
          return (
            <ScrollView
              ref={contentScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleContentScroll}
              contentContainerStyle={{ width: screenWidth * pages.length }}
            >
              {pages.map(page => (
                <View key={page.key} style={{ width: screenWidth }}>
                  {page.key === 'owner' ? (
                    <OwnerContent navigation={navigation} feed={feed} profile={displayProfile} />
                  ) : (
                    <DogContent dog={dogs.find(d => d.id === page.key)} navigation={navigation} />
                  )}
                </View>
              ))}
            </ScrollView>
          );
        }}
      />

      {/* Fixed nav bar: covers safe area only */}
      <View style={[s.navBar, { height: navBarHeight }]}>
        <Animated.View style={[s.navBarBg, { opacity: navBgOpacity }]} />
      </View>

      {/* Fixed tab bar: appears when in-list tab reaches nav bar bottom */}
      <Animated.View style={[s.fixedTabBar, { top: navBarHeight, opacity: fixedTabOpacity }]}>
        <Animated.View style={[s.fixedTabBarBg, { opacity: fixedTabOpacity }]} />
        <View style={s.fixedTabBarContent}>
          {subTabs.map(tab => {
            const isDog = tab.key !== 'owner';
            const isActive = tab.key === activeTab;
            const dogData = isDog ? dogs.find(d => d.id === tab.key) : null;
            return (
              <TouchableOpacity
                key={tab.key}
                style={s.subTab}
                activeOpacity={0.7}
                onPress={() => handleTabPress(tab.key)}
              >
                <Text style={[s.subTabText, isActive && s.subTabTextActive]}>
                  {tab.label}
                </Text>
                {isActive && <View style={s.subTabIndicator} />}
                {editingTabs && isDog && dogData && (
                  <TouchableOpacity
                    style={s.subTabDeleteBadge}
                    activeOpacity={0.7}
                    onPress={(e) => { e.stopPropagation(); handleDeleteDog(dogData); }}
                  >
                    <Ionicons name="close" size={10} color={colors.white} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
          {editingTabs && (
            <TouchableOpacity style={s.subTabAddBtn} activeOpacity={0.7} onPress={() => navigation.navigate('DogEdit')}>
              <Ionicons name="add" size={16} color={colors.secondary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={s.subTabEditBtn}
            activeOpacity={0.7}
            onPress={() => setEditingTabs(!editingTabs)}
          >
            <Ionicons name={editingTabs ? 'checkmark' : 'pencil-outline'} size={18} color={colors.secondary} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { paddingBottom: spacing.xxl },

  /* Hero */
  hero: { height: 288, justifyContent: 'flex-end' },
  heroPlaceholder: {
    backgroundColor: colors.chipDefault,
    alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
  },
  heroPlaceholderText: { ...typography.body, color: 'rgba(255,255,255,0.7)' },
  heroNav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  heroActions: { flexDirection: 'row', gap: spacing.sm },
  circleButton: {
    width: spacing.touchTarget, height: spacing.touchTarget,
    borderRadius: spacing.radiusPill,
    backgroundColor: 'rgba(52, 112, 72, 0.86)',
    alignItems: 'center', justifyContent: 'center',
  },

  /* Sub-tabs row */
  subTabRow: {
    backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  subTabContent: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md,
  },

  /* Fixed nav bar */
  navBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
  },
  navBarBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white,
  },

  /* Fixed tab bar */
  fixedTabBar: {
    position: 'absolute', left: 0, right: 0,
    height: 56,
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  fixedTabBarBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white,
  },
  fixedTabBarContent: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md,
  },

  subTab: { paddingVertical: 18, marginRight: 32, position: 'relative' },
  subTabText: { ...typography.bodyBold, fontSize: 17, letterSpacing: 1, color: colors.textLight },
  subTabTextActive: { ...typography.bodyBold, fontSize: 17, letterSpacing: 1, color: colors.textMain, fontWeight: '800' },
  subTabIndicator: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 3, backgroundColor: colors.primary, borderRadius: 1.5,
  },
  subTabDeleteBadge: {
    position: 'absolute', top: 6, right: -10,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center', justifyContent: 'center',
  },
  subTabAddBtn: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1.5, borderColor: colors.secondary, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 16,
  },
  subTabEditBtn: {
    marginLeft: 'auto',
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },

  /* Owner content */
  ownerContent: { paddingTop: spacing.md },
  profileHeader: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
    paddingHorizontal: spacing.md, marginBottom: spacing.sm,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 3, borderColor: colors.white, backgroundColor: colors.chipDefault,
  },
  nameBlock: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  name: { ...typography.h2, color: colors.textMain },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  locationText: { ...typography.caption, color: colors.textLight },
  signature: { ...typography.caption, color: colors.textLight },
  socialRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.md, marginBottom: spacing.sm, marginTop: spacing.xs,
  },
  statBlock: { flex: 1, alignItems: 'center' },
  statValue: { ...typography.bodyBold, color: colors.secondary },
  statLabel: { ...typography.caption, color: colors.textLight, marginTop: 1 },
  statDivider: { width: 1, height: 16, backgroundColor: colors.border },
  editBtn: {
    paddingHorizontal: spacing.md, height: 28,
    borderRadius: spacing.radiusPill, borderWidth: 1.5, borderColor: colors.secondary,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.white, marginLeft: 'auto',
  },
  editBtnText: { ...typography.captionBold, color: colors.secondary, fontSize: 12 },

  /* Feed & menu */
  feedList: { paddingHorizontal: spacing.md, gap: spacing.md },
  menuSection: {
    marginTop: spacing.lg, marginHorizontal: spacing.md,
    backgroundColor: colors.white, borderRadius: spacing.radiusMd, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, minHeight: 56,
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1, ...typography.bodyBold, color: colors.textMain },
  settingsItem: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    marginHorizontal: spacing.md, marginTop: spacing.md, marginBottom: spacing.lg,
    padding: spacing.md, backgroundColor: colors.white, borderRadius: spacing.radiusMd, minHeight: 56,
  },

  /* Dog content */
  dogContent: { padding: spacing.screenMargin, gap: spacing.cardGap },
  dogHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    marginBottom: spacing.sm,
  },
  dogAvatarWrap: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 3, backgroundColor: colors.chipDefault,
  },
  dogAvatar: {
    width: 66, height: 66, borderRadius: 33,
  },
  dogNameBlock: { flex: 1 },
  dogNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 2 },
  dogName: { ...typography.h2, color: colors.secondary },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabelText: { ...typography.body, color: colors.textLight },
  infoValue: { ...typography.bodyBold, color: colors.secondary },
  walkStatsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  walkStat: { alignItems: 'center' },
  walkStatValue: { ...typography.statValue, color: colors.secondary },
  walkStatUnit: { ...typography.captionBold, color: colors.secondary },
  walkStatLabel: { ...typography.caption, color: colors.textLight, marginTop: 4 },
  vaccineSummary: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, marginBottom: 12 },
  vaccineStat: { alignItems: 'center' },
  vaccineStatValue: { ...typography.statValue, color: colors.secondary },
  vaccineStatLabel: { ...typography.caption, color: colors.textLight, marginTop: 4 },
  vaccineReminder: {
    flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12,
    backgroundColor: 'rgba(146, 102, 153, 0.08)', borderRadius: spacing.radiusSm,
  },
  vaccineReminderText: { ...typography.caption, color: colors.accent, flex: 1 },

  /* Private dog placeholder */
  privateDogPlaceholder: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 80, gap: 12,
  },
  privateDogText: { ...typography.body, color: colors.textLight },

  /* Traits */
  traitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  traitChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: spacing.radiusPill, backgroundColor: colors.chipDefault,
  },
  traitChipText: { ...typography.caption, color: colors.secondary },

  /* Section header */
  sectionHeader: {
    minHeight: spacing.lg, paddingHorizontal: spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  sectionTitle: { ...typography.h3, color: colors.secondary },
  sectionSuffix: { ...typography.body, color: colors.textLight },
  sectionAction: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  sectionActionText: { ...typography.caption, color: colors.textLight },

  /* Other-user follow button (inline in nameRow) */
  followBtnInline: {
    marginLeft: 'auto',
    paddingHorizontal: spacing.md, height: 28,
    borderRadius: spacing.radiusPill, backgroundColor: colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  followTextInline: { ...typography.captionBold, color: colors.white, fontSize: 12 },

  /* Feed list (other user) */
  personalFeedList: {
    paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.md,
  },
});
