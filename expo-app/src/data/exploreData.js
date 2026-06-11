// 去玩 Tab 的共建数据与元数据帮助函数
// 与 PRD §13 (地点共建状态体系) / §10.4 (狗主人验证) / §12 (信息不准) 对齐

import { colors } from '../theme/colors';

// ---------- 共建状态体系 (PRD §13) ----------

export const LOCATION_STATUS = {
  USER_SUBMITTED: 'user_submitted',     // 用户提交
  RECENT_VISIT: 'recent_visit',         // 最近有人去过
  MULTI_VERIFIED: 'multi_verified',     // 多人验证
  DISPUTED: 'disputed',                 // 信息有争议
  RULES_CHANGED: 'rules_changed',       // 规则可能变化
  NOT_RECOMMENDED: 'not_recommended',   // 不建议前往
};

export function getStatusMeta(status) {
  switch (status) {
    case LOCATION_STATUS.USER_SUBMITTED:
      return { label: '用户提交', bg: '#E8EBE5', fg: '#5A6B5C', icon: 'person-add-outline' };
    case LOCATION_STATUS.RECENT_VISIT:
      return { label: '最近有人去过', bg: 'rgba(185, 207, 50, 0.35)', fg: colors.secondary, icon: 'paw' };
    case LOCATION_STATUS.MULTI_VERIFIED:
      return { label: '多人验证', bg: colors.secondary, fg: colors.white, icon: 'checkmark-circle' };
    case LOCATION_STATUS.DISPUTED:
      return { label: '信息有争议', bg: 'rgba(230, 160, 60, 0.18)', fg: '#8B5A1E', icon: 'alert-circle-outline' };
    case LOCATION_STATUS.RULES_CHANGED:
      return { label: '规则可能变化', bg: 'rgba(230, 160, 60, 0.18)', fg: '#8B5A1E', icon: 'time-outline' };
    case LOCATION_STATUS.NOT_RECOMMENDED:
      return { label: '不建议前往', bg: 'rgba(231, 76, 60, 0.15)', fg: '#A02E22', icon: 'close-circle-outline' };
    default:
      return { label: '用户提交', bg: '#E8EBE5', fg: '#5A6B5C', icon: 'person-add-outline' };
  }
}

// ---------- 顶部风险提示 (PRD §10.3) ----------

export function getStatusBanner(status) {
  switch (status) {
    case LOCATION_STATUS.DISPUTED:
      return { tone: 'warning', text: '该地点信息有争议，建议出发前电话确认' };
    case LOCATION_STATUS.RULES_CHANGED:
      return { tone: 'warning', text: '近期有人反馈被拒，建议出发前确认' };
    case LOCATION_STATUS.NOT_RECOMMENDED:
      return { tone: 'danger', text: '近期多人反馈不可带狗，请慎重前往' };
    case LOCATION_STATUS.USER_SUBMITTED:
      return { tone: 'info', text: '这个地点由用户新增，暂时还没有多人验证。如果你去过，也可以帮大家更新信息' };
    default:
      return null;
  }
}

// ---------- 城市列表 ----------

export const CITY_OPTIONS = [
  { name: '北京', districts: ['朝阳区', '海淀区', '东城区', '西城区', '丰台区', '通州区', '大兴区', '昌平区'] },
  { name: '上海', districts: ['徐汇区', '黄浦区', '静安区', '长宁区', '浦东新区', '虹口区', '杨浦区', '普陀区'] },
  { name: '广州', districts: ['天河区', '越秀区', '海珠区', '荔湾区', '白云区', '番禺区', '黄埔区', '花都区'] },
  { name: '深圳', districts: ['南山区', '福田区', '罗湖区', '宝安区', '龙岗区', '龙华区', '光明区', '盐田区'] },
  { name: '杭州', districts: ['西湖区', '上城区', '拱墅区', '滨江区', '余杭区', '萧山区', '临平区', '钱塘区'] },
  { name: '成都', districts: ['锦江区', '青羊区', '武侯区', '成华区', '高新区', '天府新区', '双流区', '龙泉驿区'] },
  { name: '武汉', districts: ['武昌区', '江汉区', '洪山区', '汉阳区', '江岸区', '硚口区', '东湖高新区', '经开区'] },
  { name: '南京', districts: ['玄武区', '秦淮区', '建邺区', '鼓楼区', '栖霞区', '江宁区', '浦口区', '雨花台区'] },
  { name: '苏州', districts: ['姑苏区', '吴中区', '相城区', '工业园区', '高新区', '吴江区', '昆山市', '太仓市'] },
  { name: '西安', districts: ['雁塔区', '碑林区', '未央区', '莲湖区', '灞桥区', '长安区', '高新区', '曲江新区'] },
  { name: '重庆', districts: ['渝中区', '江北区', '南岸区', '沙坪坝区', '九龙坡区', '渝北区', '巴南区', '北碚区'] },
  { name: '长沙', districts: ['岳麓区', '天心区', '芙蓉区', '开福区', '雨花区', '望城区', '长沙县', '浏阳市'] },
];

// ---------- 分类与筛选 (PRD §5.6 / §5.7) ----------

export const CATEGORIES = [
  { key: 'all', label: '全部', icon: 'paw' },
  { key: 'park', label: '公园', icon: 'leaf' },
  { key: 'cafe', label: '咖啡', icon: 'cafe' },
  { key: 'restaurant', label: '餐厅', icon: 'restaurant' },
  { key: 'mall', label: '商场', icon: 'storefront' },
  { key: 'other', label: '其他', icon: 'ellipsis-horizontal' },
];

export const SCENE_FILTERS = [
  { key: 'multi_verified', label: '多人验证' },
  { key: 'indoor', label: '室内可进' },
  { key: 'outdoor', label: '室外友好' },
  { key: 'large_dog', label: '大型犬友好' },
];

// ---------- 规则与体型 (PRD §7.3) ----------

export const ENTRY_AREAS = [
  { key: 'indoor', label: '室内可进', icon: 'home' },
  { key: 'outdoor', label: '室外可进', icon: 'leaf' },
  { key: 'terrace_only', label: '仅露台 / 户外', icon: 'restaurant' },
  { key: 'specific', label: '指定区域可进', icon: 'location' },
  { key: 'not_allowed', label: '不可进入', icon: 'close-circle' },
];

export const DOG_SIZES = [
  { key: 'small', label: '小型犬友好', icon: 'paw' },
  { key: 'medium', label: '中型犬友好', icon: 'paw' },
  { key: 'large', label: '大型犬友好', icon: 'paw' },
  { key: 'all', label: '所有体型', icon: 'paw' },
];

export const BEHAVIOR_REQUIREMENTS = [
  '需要牵绳',
  '需要嘴套',
  '不能上椅 / 沙发',
  '不能吠叫',
  '不影响其他客人',
  '需要狗狗安静待着',
];

export const BEHAVIOR_ICONS = {
  '需要牵绳': 'link',
  '需要嘴套': 'shield-checkmark',
  '不能上椅 / 沙发': 'ban',
  '不能吠叫': 'volume-mute',
  '不影响其他客人': 'people',
  '需要狗狗安静待着': 'calm',
};

export const FACILITIES = [
  '有水碗',
  '有宠物餐',
  '有狗狗零食',
  '有便袋',
  '有遮阳区',
  '有围栏',
  '有草坪',
  '其他',
];

export const FACILITY_ICONS = {
  '有水碗': 'water',
  '有宠物餐': 'restaurant',
  '有狗狗零食': 'ice-cream',
  '有便袋': 'trash',
  '有遮阳区': 'umbrella',
  '有围栏': 'grid',
  '有草坪': 'leaf',
  '其他': 'ellipsis-horizontal',
};

export const DISCOVERY_REASONS = [
  '自己去过',
  '朋友推荐',
  '网络看到',
  '其他',
];

// ---------- 我去过更新信息选项 (PRD §11.4) ----------

export const VISIT_OUTCOMES = [
  { key: 'success', label: '我带狗成功去了' },
  { key: 'outdoor_only', label: '只能坐户外' },
  { key: 'indoor_ok', label: '可以进室内' },
  { key: 'large_ok', label: '大型犬可以' },
  { key: 'large_no', label: '大型犬不行' },
  { key: 'blocked', label: '不让进了' },
];

export const VISIT_TAGS = [
  '需要牵绳',
  '有水碗',
  '店员友好',
  '空间宽敞',
  '人多拥挤',
  '周末可能被拒',
  '适合小型犬',
  '适合大型犬',
  '不适合胆小狗',
];

// ---------- 信息不准选项 (PRD §12.3) ----------

export const INACCURACY_REASONS = [
  '这个地方现在不让带狗',
  '只能户外，不能室内',
  '大型犬不能进',
  '地址或地点不对',
  '图片不相关',
  '内容虚假或恶意',
  '其他',
];

// ---------- 初始地点数据 ----------

export const INITIAL_LOCATIONS = [
  {
    id: 'loc_bloom',
    name: 'BLOOM Coffee',
    category: 'cafe',
    categoryLabel: '咖啡店',
    city: '上海',
    district: '徐汇区',
    distanceKm: 1.8,
    address: '徐汇区某某路 123 号',
    phone: '021-1234-5678',
    hours: '10:00 - 22:00',
    entryArea: 'terrace_only',
    dogSize: ['small', 'medium'],
    behaviors: ['需要牵绳', '不能上椅 / 沙发', '不能吠叫', '不影响其他客人'],
    facilities: ['有水碗', '有宠物餐', '有狗狗零食', '有遮阳区'],
    tags: ['仅户外', '有水碗', '小型犬友好'],
    status: LOCATION_STATUS.RECENT_VISIT,
    verifierCount: 3,
    lastUpdatedLabel: '2 天前更新',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=160&q=80',
    photos: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514888282295-e11b1a6b5c5f?auto=format&fit=crop&w=800&q=80',
    ],
    description: '位于老洋房一楼的小咖啡店，露台有几张大桌，狗狗可以安静趴在脚边。',
  },
  {
    id: 'loc_fuxing_park',
    name: '复兴公园',
    category: 'park',
    categoryLabel: '公园',
    city: '上海',
    district: '黄浦区',
    distanceKm: 3.2,
    address: '黄浦区复兴中路 105 号',
    phone: '',
    hours: '06:00 - 22:00',
    entryArea: 'outdoor',
    dogSize: ['all'],
    behaviors: ['需要牵绳'],
    facilities: ['有便袋', '有草坪', '有遮阳区'],
    tags: ['室外可进', '需要牵绳', '所有体型'],
    status: LOCATION_STATUS.MULTI_VERIFIED,
    verifierCount: 12,
    lastUpdatedLabel: '今天更新',
    thumbnailUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=160&q=80',
    photos: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504208434309-cb69f4fd5084?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
    ],
    description: '上海老牌的法式公园，绿地宽敞，狗狗牵绳即可入园。',
  },
  {
    id: 'loc_paw_cafe',
    name: '爪爪咖啡 Paw Cafe',
    category: 'cafe',
    categoryLabel: '咖啡店',
    city: '上海',
    district: '徐汇区',
    distanceKm: 1.2,
    address: '徐汇区某某路 88 号',
    phone: '021-8888-8888',
    hours: '11:00 - 21:00',
    entryArea: 'indoor',
    dogSize: ['large'],
    behaviors: ['需要牵绳'],
    facilities: ['有水碗'],
    tags: ['室外可进', '大型犬友好', '有水碗'],
    status: LOCATION_STATUS.USER_SUBMITTED,
    verifierCount: 0,
    lastUpdatedLabel: '刚刚发布',
    thumbnailUrl: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=160&q=80',
    photos: [
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80',
    ],
    description: '本店欢迎所有体型的狗狗，店里准备了水碗。',
  },
];

// ---------- 初始狗主人验证 (PRD §10.4) ----------

export const INITIAL_VALIDATIONS = {
  loc_bloom: [
    {
      id: 'v_bloom_1',
      userName: '豆豆妈妈',
      userAvatar: '🐶',
      time: '2 天前',
      outcomeKey: 'success',
      outcomeLabel: '我带狗成功去了',
      dogSize: '小型犬',
      tags: ['仅户外', '有水碗', '店员友好'],
      note: '店员很好，给了水碗。露台位置比较宽，狗狗可以安静待着。周末去的时候人有点多，但是店员很耐心，还额外给了狗狗零食。整体体验很不错，推荐大家去试试！',
      photos: [
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80',
        'https://images.unsplash.com/photo-1587574293340-e0011c4e8ecf?w=400&q=80',
      ],
      helpfulCount: 12,
    },
    {
      id: 'v_bloom_2',
      userName: '柯基阿福',
      userAvatar: '🐕',
      time: '5 天前',
      outcomeKey: 'outdoor_only',
      outcomeLabel: '只能坐户外',
      dogSize: '小型犬',
      tags: ['仅户外', '空间宽敞'],
      note: '室内有点窄，但露台位置很赞。',
      photos: [
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80',
        'https://images.unsplash.com/photo-1587574293340-e0011c4e8ecf?w=400&q=80',
      ],
      helpfulCount: 4,
    },
    {
      id: 'v_bloom_3',
      userName: '咖啡日和',
      userAvatar: '☕',
      time: '8 天前',
      outcomeKey: 'success',
      outcomeLabel: '我带狗成功去了',
      dogSize: '中型犬',
      tags: ['店员友好', '人多拥挤'],
      note: '周末确实人多，狗狗略紧张。建议工作日去。',
      photos: [],
      helpfulCount: 2,
    },
  ],
  loc_fuxing_park: [
    {
      id: 'v_fuxing_1',
      userName: '阿黄爸爸',
      userAvatar: '🐕‍🦺',
      time: '1 天前',
      outcomeKey: 'success',
      outcomeLabel: '我带狗成功去了',
      dogSize: '大型犬',
      tags: ['需要牵绳', '空间宽敞'],
      note: '草坪超大，狗狗很开心。门口工作人员会提醒牵绳。',
      photos: [
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80',
        'https://images.unsplash.com/photo-1504208434309-cb69f4fd5084?w=400&q=80',
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80',
      ],
      helpfulCount: 28,
    },
  ],
  loc_paw_cafe: [],
};

// ---------- 地图选点 Mock：附近 POI / 当前位置 ----------

export const MOCK_DETECTED_LOCATION = {
  name: '徐汇区某某路 1 号',
  category: 'other',
  categoryLabel: '其他',
  city: '上海',
  district: '徐汇区',
  address: '徐汇区某某路 1 号',
  source: 'current_location',
};

export const MOCK_NEARBY_POIS = [
  {
    poiId: 'poi_1',
    name: 'Manner Coffee（衡复店）',
    category: 'cafe',
    categoryLabel: '咖啡店',
    city: '上海',
    district: '徐汇区',
    address: '徐汇区永康路 200 号',
    distanceLabel: '约 120 米',
  },
  {
    poiId: 'poi_2',
    name: '%Arabica（衡山坊）',
    category: 'cafe',
    categoryLabel: '咖啡店',
    city: '上海',
    district: '徐汇区',
    address: '徐汇区永康路 50 号',
    distanceLabel: '约 240 米',
  },
  {
    poiId: 'poi_3',
    name: '徐家汇公园',
    category: 'park',
    categoryLabel: '公园',
    city: '上海',
    district: '徐汇区',
    address: '徐汇区肇嘉浜路 889 号',
    distanceLabel: '约 380 米',
  },
  {
    poiId: 'poi_4',
    name: 'Greens 沙拉（环贸店）',
    category: 'restaurant',
    categoryLabel: '餐厅',
    city: '上海',
    district: '徐汇区',
    address: '徐汇区淮海中路 999 号',
    distanceLabel: '约 520 米',
  },
  {
    poiId: 'poi_5',
    name: '巴黎贝甜（徐家汇店）',
    category: 'cafe',
    categoryLabel: '咖啡店',
    city: '上海',
    district: '徐汇区',
    address: '徐汇区肇嘉浜路 1111 号',
    distanceLabel: '约 640 米',
  },
  {
    poiId: 'poi_6',
    name: '光启公园',
    category: 'park',
    categoryLabel: '公园',
    city: '上海',
    district: '徐汇区',
    address: '徐汇区南丹路 17 号',
    distanceLabel: '约 880 米',
  },
];

// ---------- 我的贡献模拟数据 ----------

export const INITIAL_CONTRIBUTIONS = [
  {
    id: 'c_1',
    locationId: 'loc_paw_cafe',
    locationName: '爪爪咖啡 Paw Cafe',
    locationLabel: '咖啡店 · 徐汇区',
    type: '新增地点',
    time: '2026-06-08',
    status: LOCATION_STATUS.USER_SUBMITTED,
    bucket: 'created',
  },
  {
    id: 'c_2',
    locationId: 'loc_bloom',
    locationName: 'BLOOM Coffee',
    locationLabel: '咖啡店 · 徐汇区',
    type: '更新信息',
    time: '2026-06-06',
    status: LOCATION_STATUS.RECENT_VISIT,
    bucket: 'verified',
  },
];

// ---------- 工具：根据地点 verifierCount / 反馈数推导状态 ----------

export function deriveStatusFromCounts({
  verifierCount = 0,
  inaccuracyCount = 0,
  hasBlockedReport = false,
  isJustCreated = false,
}) {
  if (isJustCreated && verifierCount === 0) return LOCATION_STATUS.USER_SUBMITTED;
  if (hasBlockedReport && verifierCount === 0) return LOCATION_STATUS.NOT_RECOMMENDED;
  if (hasBlockedReport) return LOCATION_STATUS.RULES_CHANGED;
  if (inaccuracyCount >= 3) return LOCATION_STATUS.DISPUTED;
  if (verifierCount >= 3) return LOCATION_STATUS.MULTI_VERIFIED;
  if (verifierCount >= 1) return LOCATION_STATUS.RECENT_VISIT;
  return LOCATION_STATUS.USER_SUBMITTED;
}

// ---------- 工具：根据 verifier 数生成展示文案 ----------

export function getContributionLabel(verifierCount) {
  if (!verifierCount || verifierCount === 0) return '等待更多狗主人验证';
  return `${verifierCount} 位狗主人验证`;
}
