// 去玩 Tab 的共建数据与元数据帮助函数
// 与 PRD §13 (地点共建状态体系) / §10.4 (狗主人验证) / §12 (信息不准) 对齐

import { colors } from '../theme/colors';

// ---------- 共建状态体系 (PRD §13) ----------

export const LOCATION_STATUS = {
  USER_SUBMITTED: 'user_submitted',     // 待验证新地点
  RECENT_VISIT: 'recent_visit',         // 最近新增验证
  MULTI_VERIFIED: 'multi_verified',     // 近期多人验证
  DISPUTED: 'disputed',                 // 信息具有争议
  RULES_CHANGED: 'rules_changed',       // 规则可能变化
  NOT_RECOMMENDED: 'not_recommended',   // 极高概率受拒
  NEEDS_UPDATE: 'needs_update',         // 近期无有效反馈
};

export function getStatusMeta(status) {
  switch (status) {
    case LOCATION_STATUS.USER_SUBMITTED:
      return { label: '待验证新地点', bg: '#E8EBE5', fg: '#5A6B5C', icon: 'person-add-outline' };
    case LOCATION_STATUS.RECENT_VISIT:
      return { label: '最近新增验证', bg: 'rgba(185, 207, 50, 0.35)', fg: colors.secondary, icon: 'paw' };
    case LOCATION_STATUS.MULTI_VERIFIED:
      return { label: '近期多人验证', bg: colors.secondary, fg: colors.white, icon: 'checkmark-circle' };
    case LOCATION_STATUS.DISPUTED:
      return { label: '信息具有争议', bg: 'rgba(230, 160, 60, 0.18)', fg: '#8B5A1E', icon: 'alert-circle-outline' };
    case LOCATION_STATUS.RULES_CHANGED:
      return { label: '规则可能变化', bg: 'rgba(230, 160, 60, 0.18)', fg: '#8B5A1E', icon: 'time-outline' };
    case LOCATION_STATUS.NOT_RECOMMENDED:
      return { label: '极高概率受拒', bg: 'rgba(231, 76, 60, 0.15)', fg: '#A02E22', icon: 'close-circle-outline' };
    case LOCATION_STATUS.NEEDS_UPDATE:
      return { label: '近期无有效反馈', bg: '#E8EBE5', fg: '#8A9A8C', icon: 'refresh-outline' };
    default:
      return { label: '待验证新地点', bg: '#E8EBE5', fg: '#5A6B5C', icon: 'person-add-outline' };
  }
}

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
    case LOCATION_STATUS.NEEDS_UPDATE:
      return { tone: 'info', text: '该地点超过 90 天无人验证，信息可能已过时' };
    case LOCATION_STATUS.MULTI_VERIFIED:
    case LOCATION_STATUS.RECENT_VISIT:
      return null;
    default:
      return null;
  }
}

// ---------- 城市列表 ----------

export const CITY_OPTIONS = [
  { name: '北京' },
  { name: '上海' },
  { name: '广州' },
  { name: '深圳' },
  { name: '杭州' },
  { name: '成都' },
  { name: '武汉' },
  { name: '南京' },
  { name: '苏州' },
  { name: '西安' },
  { name: '重庆' },
  { name: '长沙' },
];

// ---------- 分类与筛选 (PRD §5.6 / §5.7) ----------

export const CATEGORIES = [
  { key: 'all', label: '全部', icon: 'paw' },
  { key: 'park', label: '公园', icon: 'leaf' },
  { key: 'cafe', label: '咖啡', icon: 'cafe' },
  { key: 'restaurant', label: '餐厅', icon: 'restaurant' },
  { key: 'mall', label: '商场', icon: 'storefront' },
  { key: 'scenic', label: '景点', icon: 'map' },
  { key: 'hotel', label: '住宿', icon: 'bed' },
  { key: 'other', label: '其他', icon: 'ellipsis-horizontal' },
];

// ---------- 规则与体型 (PRD §7.3) ----------

export const ENTRY_AREAS = [
  { key: 'all_areas', label: '全域可进', icon: 'home' },
  { key: 'not_allowed', label: '全域禁止', icon: 'close-circle' },
  { key: 'partial', label: '部分可进', icon: 'layers' },
  { key: 'outdoor', label: '室外允许', icon: 'leaf' },
  { key: 'indoor', label: '室内允许', icon: 'restaurant' },
  { key: 'unknown', label: '无法确定', icon: 'help-circle' },
];

export const DOG_SIZES = [
  { key: 'all', label: '所有体型', icon: 'paw' },
  { key: 'small', label: '小型犬', icon: 'paw' },
  { key: 'medium', label: '中型犬', icon: 'paw' },
  { key: 'large', label: '大型犬', icon: 'paw' },
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
  '开放水域',
  '爱宠寄存',
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
  '开放水域': 'water-outline',
  '爱宠寄存': 'lock-closed',
  '其他': 'ellipsis-horizontal',
};

export const DISCOVERY_REASONS = [
  '自己去过',
  '朋友推荐',
  '网络看到',
  '其他',
];

// ---------- 我去过更新信息选项 ----------

export const WENT_OPTIONS = [
  { key: 'success', label: '全程顺利' },
  { key: 'outdoor_only', label: '仅限户外' },
  { key: 'area_restricted', label: '区域受限' },
  { key: 'large_no', label: '体型受限' },
];

export const NOT_WENT_OPTIONS = [
  { key: 'blocked', label: '拒绝进入' },
  { key: 'closed', label: '歇业关闭' },
  { key: 'address_wrong', label: '地址偏差' },
  { key: 'other', label: '其他情况' },
];

export const EXPERIENCE_LEVELS = [
  { key: 'bad', label: '较差' },
  { key: 'ok', label: '一般' },
  { key: 'good', label: '很好' },
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

// ---------- 地图选点 Mock：附近 POI / 当前位置 ----------

export const MOCK_DETECTED_LOCATION = {
  name: '附近',
  category: 'other',
  categoryLabel: '其他',
  city: '上海',
  source: 'current_location',
};

export const MOCK_NEARBY_POIS = [
  {
    poiId: 'poi_1',
    name: 'Manner Coffee（衡复店）',
    category: 'cafe',
    categoryLabel: '咖啡',
    city: '上海',
    distanceLabel: '约 120 米',
  },
  {
    poiId: 'poi_2',
    name: '%Arabica（衡山坊）',
    category: 'cafe',
    categoryLabel: '咖啡',
    city: '上海',
    distanceLabel: '约 240 米',
  },
  {
    poiId: 'poi_3',
    name: '徐家汇公园',
    category: 'park',
    categoryLabel: '公园',
    city: '上海',
    distanceLabel: '约 380 米',
  },
  {
    poiId: 'poi_4',
    name: 'Greens 沙拉（环贸店）',
    category: 'restaurant',
    categoryLabel: '餐厅',
    city: '上海',
    distanceLabel: '约 520 米',
  },
  {
    poiId: 'poi_5',
    name: '巴黎贝甜（徐家汇店）',
    category: 'cafe',
    categoryLabel: '咖啡',
    city: '上海',
    distanceLabel: '约 640 米',
  },
  {
    poiId: 'poi_6',
    name: '光启公园',
    category: 'park',
    categoryLabel: '公园',
    city: '上海',
    distanceLabel: '约 880 米',
  },
];

// ---------- 工具：根据时间窗口计数推导状态 ----------

export function deriveStatusFromCounts({
  verifierCount7d = 0,
  verifierCount90d = 0,
  verifierCountTotal = 0,
  inaccuracyCountTotal = 0,
  hasBlockedReport90d = false,
  isJustCreated = false,
}) {
  if (inaccuracyCountTotal >= 3) return LOCATION_STATUS.DISPUTED;
  if (hasBlockedReport90d && verifierCount90d < 1) return LOCATION_STATUS.NOT_RECOMMENDED;
  if (hasBlockedReport90d && verifierCount90d >= 1) return LOCATION_STATUS.RULES_CHANGED;
  if (verifierCount7d >= 1 || verifierCount90d >= 3) return LOCATION_STATUS.MULTI_VERIFIED;
  if (verifierCount90d >= 1) return LOCATION_STATUS.RECENT_VISIT;
  if (verifierCountTotal >= 1) return LOCATION_STATUS.NEEDS_UPDATE;
  return LOCATION_STATUS.USER_SUBMITTED;
}

// ---------- 工具：根据 verifier 数生成展示文案 ----------

export function getContributionLabel(verifierCount90d) {
  if (!verifierCount90d || verifierCount90d === 0) return '等待更多狗主人验证';
  return `${verifierCount90d} 位狗主人验证（近 90 天）`;
}
