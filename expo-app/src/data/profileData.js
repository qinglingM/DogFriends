export const IDENTITY_BADGES = [
  {
    id: 'real_owner',
    name: '真实狗主',
    icon: 'paw',
    color: '#B9CF32',
    category: 'identity',
    description: '添加第一只狗狗，完成身份确认。',
    condition: '添加 1 只狗狗',
  },
  {
    id: 'small_dog_parent',
    name: '小型犬家长',
    icon: '🐶',
    color: '#926699',
    category: 'identity',
    description: '你的家庭里有小型犬，你了解小型犬的出行需求。',
    condition: '当前公开狗狗中存在小型犬',
  },
  {
    id: 'medium_dog_parent',
    name: '中型犬家长',
    icon: '🐕',
    color: '#347048',
    category: 'identity',
    description: '你的家庭里有中型犬，你了解中型犬的出行需求。',
    condition: '当前公开狗狗中存在中型犬',
  },
  {
    id: 'large_dog_parent',
    name: '大型犬家长',
    icon: '🦮',
    color: '#B9CF32',
    category: 'identity',
    description: '你的家庭里有大型犬，你更了解大型犬出门的挑战。',
    condition: '当前公开狗狗中存在大型犬',
  },
  {
    id: 'multi_dog_family',
    name: '多狗家庭',
    icon: '🐕‍🦺',
    color: '#E6A03C',
    category: 'identity',
    description: '你同时养了 2 只以上的狗狗，是真正的多狗家庭。',
    condition: '当前公开狗狗数量 ≥ 2',
  },
];

export const BREED_BADGES = [
  {
    id: 'shiba_parent',
    name: '柴犬家长',
    icon: '🐕',
    color: '#D4A04A',
    category: 'identity',
    description: '你的家庭里有柴犬，你了解柴犬的性格和出行习惯。',
    condition: '当前公开狗狗中存在柴犬',
    matchBreeds: ['柴犬', '柴', 'Shiba Inu', 'shiba'],
  },
  {
    id: 'bichon_parent',
    name: '比熊家长',
    icon: '🐶',
    color: '#F5E6CC',
    category: 'identity',
    description: '你的家庭里有比熊，你了解比熊的护理和出行需求。',
    condition: '当前公开狗狗中存在比熊',
    matchBreeds: ['比熊', '比熊犬', 'Bichon Frise', 'bichon'],
  },
  {
    id: 'golden_parent',
    name: '金毛家长',
    icon: '🦮',
    color: '#C9923A',
    category: 'identity',
    description: '你的家庭里有金毛，你更了解大型犬的出行挑战。',
    condition: '当前公开狗狗中存在金毛寻回犬',
    matchBreeds: ['金毛', '金毛寻回犬', 'Golden Retriever', 'golden'],
  },
  {
    id: 'corgi_parent',
    name: '柯基家长',
    icon: '🐕',
    color: '#E8A94E',
    category: 'identity',
    description: '你的家庭里有柯基，你了解柯基的活力和社交需求。',
    condition: '当前公开狗狗中存在柯基',
    matchBreeds: ['柯基', '威尔斯柯基', 'Corgi', 'corgi', '威尔士柯基'],
  },
];

export const ACHIEVEMENT_BADGES = [
  {
    id: 'walk_streak_7',
    name: '连续遛狗7天',
    icon: 'calendar',
    color: '#4A90D9',
    category: 'achievement',
    description: '连续 7 天记录遛狗，你是一个有规律的主人。',
    condition: '连续 7 天记录遛狗',
    progress: 0,
    target: 7,
    actionLabel: '去遛狗',
    actionRoute: 'walk',
  },
  {
    id: 'walk_streak_30',
    name: '连续遛狗30天',
    icon: 'flame',
    color: '#E74C3C',
    category: 'achievement',
    description: '连续 30 天记录遛狗，你是遛狗达人！',
    condition: '连续 30 天记录遛狗',
    progress: 0,
    target: 30,
    actionLabel: '去遛狗',
    actionRoute: 'walk',
  },
  {
    id: 'monthly_walks_20',
    name: '本月遛狗20次',
    icon: 'footsteps',
    color: '#27AE60',
    category: 'achievement',
    description: '一个月遛狗 20 次，你的狗狗一定很幸福。',
    condition: '本月遛狗次数 ≥ 20',
    progress: 0,
    target: 20,
    actionLabel: '去遛狗',
    actionRoute: 'walk',
  },
  {
    id: 'posts_10',
    name: '发布10条动态',
    icon: 'create',
    color: '#8E44AD',
    category: 'achievement',
    description: '你在社区分享了很多遛狗日常，帮大家了解更多好去处。',
    condition: '累计发布 10 条公开动态',
    progress: 0,
    target: 10,
    actionLabel: '去发动态',
    actionRoute: 'square',
  },
  {
    id: 'likes_100',
    name: '获得100个点赞',
    icon: 'heart',
    color: '#E91E63',
    category: 'achievement',
    description: '你的分享得到了很多认可，继续分享吧！',
    condition: '累计获得 100 个点赞',
    progress: 0,
    target: 100,
    actionLabel: '查看我的动态',
    actionRoute: 'square',
  },
  {
    id: 'night_walker',
    name: '夜间遛狗达人',
    icon: 'moon',
    color: '#2C3E50',
    category: 'achievement',
    description: '你经常在夜间遛狗，了解夜间宠物友好去处。',
    condition: '完成 5 次夜间遛狗（20:00 后）',
    progress: 0,
    target: 5,
    actionLabel: '去遛狗',
    actionRoute: 'walk',
  },
  {
    id: 'park_walker',
    name: '公园遛狗达人',
    icon: 'leaf',
    color: '#1ABC9C',
    category: 'achievement',
    description: '你经常带狗狗去公园，是公园遛狗的常客。',
    condition: '在 5 个不同公园完成遛狗',
    progress: 0,
    target: 5,
    actionLabel: '去遛狗',
    actionRoute: 'walk',
  },
  {
    id: 'pet_friendly_contributor',
    name: '宠物友好贡献者',
    icon: 'star',
    color: '#F39C12',
    category: 'achievement',
    description: '你在多个方面持续为宠物友好社区做贡献。',
    condition: '至少获得 5 枚其他徽章',
    progress: 0,
    target: 5,
    actionLabel: '查看我的徽章',
    actionRoute: 'BadgeWall',
  },
];

export function computeIdentityBadges(dogs, posts) {
  const badges = [];
  if (!dogs || dogs.length === 0) return badges;

  if (dogs.length > 0) {
    badges.push({ ...IDENTITY_BADGES[0], earned: true });
  }

  const sizes = new Set(dogs.map(d => d.size));
  if (sizes.has('small')) badges.push({ ...IDENTITY_BADGES[1], earned: true });
  if (sizes.has('medium')) badges.push({ ...IDENTITY_BADGES[2], earned: true });
  if (sizes.has('large')) badges.push({ ...IDENTITY_BADGES[3], earned: true });
  if (dogs.length >= 2) badges.push({ ...IDENTITY_BADGES[4], earned: true });

  const breedBadges = computeBreedBadges(dogs);
  badges.push(...breedBadges);

  return badges;
}

export function computeBreedBadges(dogs) {
  if (!dogs || dogs.length === 0) return [];
  const badges = [];
  for (const breedBadge of BREED_BADGES) {
    const hasBreed = dogs.some(dog =>
      breedBadge.matchBreeds.some(pattern =>
        dog.breed && dog.breed.toLowerCase().includes(pattern.toLowerCase())
      )
    );
    if (hasBreed) {
      badges.push({ ...breedBadge, earned: true });
    }
  }
  return badges;
}

export const PROFILE_BADGES = [
  {
    id: 'city_discoverer',
    name: '城市发现者',
    icon: 'flag',
    earned: false,
    earnedAt: null,
    description: '你发现了一个可以带狗去的地方，让更多狗狗多了一个出门选择。',
    condition: '新增 1 个宠物友好地点',
    progress: 0,
    target: 1,
    actionLabel: '去新增地点',
    actionRoute: 'add_location',
  },
  {
    id: 'city_explorer',
    name: '城市探索家',
    icon: 'map',
    earned: false,
    earnedAt: null,
    description: '你持续发现城市里的宠物友好地点，正在帮大家打开更多带狗出门的选择。',
    condition: '新增 5 个宠物友好地点',
    progress: 0,
    target: 5,
    actionLabel: '去新增地点',
    actionRoute: 'add_location',
  },
  {
    id: 'reliable_verifier',
    name: '可靠验证官',
    icon: 'checkmark-circle',
    earned: false,
    earnedAt: null,
    description: '你的真实到访经验，能帮其他狗主人判断这个地方到底适不适合去。',
    condition: '发布 5 条地点验证',
    progress: 0,
    target: 5,
    actionLabel: '去验证地点',
    actionRoute: 'explore',
  },
  {
    id: 'pitfall_alerter',
    name: '避坑提醒员',
    icon: 'warning',
    earned: false,
    earnedAt: null,
    description: '你帮其他狗主人减少白跑一趟的可能。',
    condition: '提交 3 条规则变化或不可带狗反馈',
    progress: 0,
    target: 3,
    actionLabel: '去更新信息',
    actionRoute: 'explore',
  },
  {
    id: 'field_recorder',
    name: '现场记录员',
    icon: 'camera',
    earned: false,
    earnedAt: null,
    description: '你的照片让大家更直观地判断这个地方是否适合带狗去。',
    condition: '上传 5 张地点相关照片',
    progress: 0,
    target: 5,
    actionLabel: '去补充照片',
    actionRoute: 'explore',
  },
  {
    id: 'useful_sharer',
    name: '有用分享家',
    icon: 'heart',
    earned: false,
    earnedAt: null,
    description: '其他狗主人觉得你的分享真的帮到了他们。',
    condition: '获得 10 个“有用”',
    progress: 0,
    target: 10,
    actionLabel: '查看我分享过',
    actionRoute: 'contributions',
  },
  {
    id: 'large_dog_helper',
    name: '大型犬友好官',
    icon: 'paw',
    earned: false,
    earnedAt: null,
    description: '大型犬出门更容易踩雷，你的补充能帮大型犬家庭提前判断。',
    condition: '提交 3 条大型犬相关规则',
    progress: 0,
    target: 3,
    actionLabel: '去补充规则',
    actionRoute: 'explore',
  },
  {
    id: 'rainy_day_helper',
    name: '雨天救星',
    icon: 'umbrella',
    earned: false,
    earnedAt: null,
    description: '下雨天也能带狗出门，你帮大家找到了更安心的选择。',
    condition: '提交 3 个室内可进、下雨可去或有遮挡的地点信息',
    progress: 0,
    target: 3,
    actionLabel: '去新增地点',
    actionRoute: 'add_location',
  },
  {
    id: 'city_dog_guide',
    name: '城市带狗向导',
    icon: 'ribbon',
    earned: false,
    earnedAt: null,
    description: '你正在让这座城市对狗狗和狗主人更友好。',
    condition: '累计帮助 50 位狗主人',
    progress: 0,
    target: 50,
    actionLabel: '查看我分享过',
    actionRoute: 'contributions',
  },
];

export function getBadgeProgress(badge) {
  if (!badge.target) return 0;
  return Math.min(1, badge.progress / badge.target);
}

export function getBadgeProgressLabel(badge) {
  if (!badge.target) return '';
  return `${badge.progress}/${badge.target}`;
}

export function getBadgeRemainingLabel(badge) {
  if (!badge.target || badge.earned) return '';
  const remaining = Math.max(0, badge.target - badge.progress);
  if (badge.id === 'useful_sharer') return `还差 ${remaining} 个有用`;
  if (badge.id === 'city_dog_guide') return `还差 ${remaining} 位帮助`;
  if (badge.id === 'field_recorder') return `还差 ${remaining} 张照片`;
  if (badge.id === 'pitfall_alerter') return `还差 ${remaining} 条反馈`;
  if (badge.id === 'large_dog_helper') return `还差 ${remaining} 条规则`;
  if (badge.id === 'rainy_day_helper') return `还差 ${remaining} 条场景信息`;
  if (badge.id === 'reliable_verifier') return `还差 ${remaining} 条验证`;
  if (badge.id === 'walk_streak_7') return `还差 ${remaining} 天`;
  if (badge.id === 'walk_streak_30') return `还差 ${remaining} 天`;
  if (badge.id === 'monthly_walks_20') return `还差 ${remaining} 次遛狗`;
  if (badge.id === 'posts_10') return `还差 ${remaining} 条动态`;
  if (badge.id === 'likes_100') return `还差 ${remaining} 个点赞`;
  if (badge.id === 'night_walker') return `还差 ${remaining} 次夜间遛狗`;
  if (badge.id === 'park_walker') return `还差 ${remaining} 个公园`;
  if (badge.id === 'pet_friendly_contributor') return `还差 ${remaining} 枚徽章`;
  return `还差 ${remaining} 个地点`;
}

export function getCategoryIcon(category) {
  switch (category) {
    case 'park':
      return 'leaf';
    case 'cafe':
      return 'cafe';
    case 'restaurant':
      return 'restaurant';
    case 'mall':
      return 'storefront';
    default:
      return 'location';
  }
}

export function computeContribProgress(contributions, validations, locations, helpful, inaccuracyReports) {
  const created = (contributions || []).filter(c => c.bucket === 'created').length;
  const verified = (contributions || []).filter(c => c.bucket === 'verified').length;
  const photos = (contributions || []).filter(c => c.type === '上传照片').length;
  const inaccurateCount = inaccuracyReports
    ? Object.values(inaccuracyReports).reduce((sum, r) => sum + (r.count || 0), 0)
    : 0;
  const usefulCount = helpful ? Object.keys(helpful).length : 0;

  const largeDogRules = (contributions || []).filter(c =>
    c.type === '更新信息' && c.largeDog === true
  ).length;
  const rainyDayContribs = (contributions || []).filter(c =>
    c.bucket === 'created' && c.rainyDay === true
  ).length;

  const totalHelped = usefulCount + created;

  return {
    city_discoverer: Math.min(created, 1),
    city_explorer: created,
    reliable_verifier: verified,
    pitfall_alerter: inaccurateCount,
    field_recorder: photos,
    useful_sharer: usefulCount,
    large_dog_helper: largeDogRules,
    rainy_day_helper: rainyDayContribs,
    city_dog_guide: totalHelped,
  };
}

export function computeAchievProgress(walkRecords, posts, earnedOtherCount) {
  const walks = walkRecords || [];
  const allPosts = posts || [];

  let currentStreak = 0;
  if (walks.length > 0) {
    const sortedDates = [...new Set(walks.map(w => w.startTime?.slice(0, 10)))].sort().reverse();
    const today = new Date().toISOString().slice(0, 10);
    let checkDate = new Date(today);
    for (const dateStr of sortedDates) {
      const expected = checkDate.toISOString().slice(0, 10);
      if (dateStr === expected) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else {
        break;
      }
    }
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const monthlyWalks = walks.filter(w => w.startTime && w.startTime >= monthStart).length;

  const publicPosts = allPosts.filter(p => p.visibility === 'public').length;
  const totalLikes = allPosts.reduce((sum, p) => sum + (p.likes || 0), 0);

  const nightWalks = walks.filter(w => {
    if (!w.startTime) return false;
    const hour = new Date(w.startTime).getHours();
    return hour >= 20 || hour < 5;
  }).length;

  const parkWalks = [...new Set(walks.filter(w => w.area).map(w => w.area))].length;

  return {
    walk_streak_7: currentStreak,
    walk_streak_30: currentStreak,
    monthly_walks_20: monthlyWalks,
    posts_10: publicPosts,
    likes_100: totalLikes,
    night_walker: nightWalks,
    park_walker: parkWalks,
    pet_friendly_contributor: earnedOtherCount || 0,
  };
}

export function formatEarnedDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export const ALL_BADGE_IDS = [
  ...IDENTITY_BADGES.map(b => b.id),
  ...BREED_BADGES.map(b => b.id),
  ...PROFILE_BADGES.map(b => b.id),
  ...ACHIEVEMENT_BADGES.map(b => b.id),
];
