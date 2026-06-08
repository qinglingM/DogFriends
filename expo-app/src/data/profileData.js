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
