// 全国地级行政区数据（地级市、地区、自治州、盟）
// 按省份分组，包含全国333个地级行政区

const CITY_LIST = [
  // ──────────── 直辖市 ────────────
  { province_name: '北京', city_name: '北京' },
  { province_name: '天津', city_name: '天津' },
  { province_name: '上海', city_name: '上海' },
  { province_name: '重庆', city_name: '重庆' },

  // ──────────── 河北省 ────────────
  { province_name: '河北', city_name: '石家庄' },
  { province_name: '河北', city_name: '唐山' },
  { province_name: '河北', city_name: '秦皇岛' },
  { province_name: '河北', city_name: '邯郸' },
  { province_name: '河北', city_name: '邢台' },
  { province_name: '河北', city_name: '保定' },
  { province_name: '河北', city_name: '张家口' },
  { province_name: '河北', city_name: '承德' },
  { province_name: '河北', city_name: '沧州' },
  { province_name: '河北', city_name: '廊坊' },
  { province_name: '河北', city_name: '衡水' },

  // ──────────── 山西省 ────────────
  { province_name: '山西', city_name: '太原' },
  { province_name: '山西', city_name: '大同' },
  { province_name: '山西', city_name: '阳泉' },
  { province_name: '山西', city_name: '长治' },
  { province_name: '山西', city_name: '晋城' },
  { province_name: '山西', city_name: '朔州' },
  { province_name: '山西', city_name: '晋中' },
  { province_name: '山西', city_name: '运城' },
  { province_name: '山西', city_name: '忻州' },
  { province_name: '山西', city_name: '临汾' },
  { province_name: '山西', city_name: '吕梁' },

  // ──────────── 内蒙古自治区 ────────────
  { province_name: '内蒙古', city_name: '呼和浩特' },
  { province_name: '内蒙古', city_name: '包头' },
  { province_name: '内蒙古', city_name: '乌海' },
  { province_name: '内蒙古', city_name: '赤峰' },
  { province_name: '内蒙古', city_name: '通辽' },
  { province_name: '内蒙古', city_name: '鄂尔多斯' },
  { province_name: '内蒙古', city_name: '呼伦贝尔' },
  { province_name: '内蒙古', city_name: '巴彦淖尔' },
  { province_name: '内蒙古', city_name: '乌兰察布' },

  // ──────────── 辽宁省 ────────────
  { province_name: '辽宁', city_name: '沈阳' },
  { province_name: '辽宁', city_name: '大连' },
  { province_name: '辽宁', city_name: '鞍山' },
  { province_name: '辽宁', city_name: '抚顺' },
  { province_name: '辽宁', city_name: '本溪' },
  { province_name: '辽宁', city_name: '丹东' },
  { province_name: '辽宁', city_name: '锦州' },
  { province_name: '辽宁', city_name: '营口' },
  { province_name: '辽宁', city_name: '阜新' },
  { province_name: '辽宁', city_name: '辽阳' },
  { province_name: '辽宁', city_name: '盘锦' },
  { province_name: '辽宁', city_name: '铁岭' },
  { province_name: '辽宁', city_name: '朝阳' },
  { province_name: '辽宁', city_name: '葫芦岛' },

  // ──────────── 吉林省 ────────────
  { province_name: '吉林', city_name: '长春' },
  { province_name: '吉林', city_name: '吉林市' },
  { province_name: '吉林', city_name: '四平' },
  { province_name: '吉林', city_name: '辽源' },
  { province_name: '吉林', city_name: '通化' },
  { province_name: '吉林', city_name: '白山' },
  { province_name: '吉林', city_name: '松原' },
  { province_name: '吉林', city_name: '白城' },

  // ──────────── 黑龙江省 ────────────
  { province_name: '黑龙江', city_name: '哈尔滨' },
  { province_name: '黑龙江', city_name: '齐齐哈尔' },
  { province_name: '黑龙江', city_name: '鸡西' },
  { province_name: '黑龙江', city_name: '鹤岗' },
  { province_name: '黑龙江', city_name: '双鸭山' },
  { province_name: '黑龙江', city_name: '大庆' },
  { province_name: '黑龙江', city_name: '伊春' },
  { province_name: '黑龙江', city_name: '佳木斯' },
  { province_name: '黑龙江', city_name: '七台河' },
  { province_name: '黑龙江', city_name: '牡丹江' },
  { province_name: '黑龙江', city_name: '黑河' },
  { province_name: '黑龙江', city_name: '绥化' },

  // ──────────── 江苏省 ────────────
  { province_name: '江苏', city_name: '南京' },
  { province_name: '江苏', city_name: '无锡' },
  { province_name: '江苏', city_name: '徐州' },
  { province_name: '江苏', city_name: '常州' },
  { province_name: '江苏', city_name: '苏州' },
  { province_name: '江苏', city_name: '南通' },
  { province_name: '江苏', city_name: '连云港' },
  { province_name: '江苏', city_name: '淮安' },
  { province_name: '江苏', city_name: '盐城' },
  { province_name: '江苏', city_name: '扬州' },
  { province_name: '江苏', city_name: '镇江' },
  { province_name: '江苏', city_name: '泰州' },
  { province_name: '江苏', city_name: '宿迁' },

  // ──────────── 浙江省 ────────────
  { province_name: '浙江', city_name: '杭州' },
  { province_name: '浙江', city_name: '宁波' },
  { province_name: '浙江', city_name: '温州' },
  { province_name: '浙江', city_name: '嘉兴' },
  { province_name: '浙江', city_name: '湖州' },
  { province_name: '浙江', city_name: '绍兴' },
  { province_name: '浙江', city_name: '金华' },
  { province_name: '浙江', city_name: '衢州' },
  { province_name: '浙江', city_name: '舟山' },
  { province_name: '浙江', city_name: '台州' },
  { province_name: '浙江', city_name: '丽水' },

  // ──────────── 安徽省 ────────────
  { province_name: '安徽', city_name: '合肥' },
  { province_name: '安徽', city_name: '芜湖' },
  { province_name: '安徽', city_name: '蚌埠' },
  { province_name: '安徽', city_name: '淮南' },
  { province_name: '安徽', city_name: '马鞍山' },
  { province_name: '安徽', city_name: '淮北' },
  { province_name: '安徽', city_name: '铜陵' },
  { province_name: '安徽', city_name: '安庆' },
  { province_name: '安徽', city_name: '黄山' },
  { province_name: '安徽', city_name: '滁州' },
  { province_name: '安徽', city_name: '阜阳' },
  { province_name: '安徽', city_name: '宿州' },
  { province_name: '安徽', city_name: '六安' },
  { province_name: '安徽', city_name: '亳州' },
  { province_name: '安徽', city_name: '池州' },
  { province_name: '安徽', city_name: '宣城' },

  // ──────────── 福建省 ────────────
  { province_name: '福建', city_name: '福州' },
  { province_name: '福建', city_name: '厦门' },
  { province_name: '福建', city_name: '莆田' },
  { province_name: '福建', city_name: '三明' },
  { province_name: '福建', city_name: '泉州' },
  { province_name: '福建', city_name: '漳州' },
  { province_name: '福建', city_name: '南平' },
  { province_name: '福建', city_name: '龙岩' },
  { province_name: '福建', city_name: '宁德' },

  // ──────────── 江西省 ────────────
  { province_name: '江西', city_name: '南昌' },
  { province_name: '江西', city_name: '景德镇' },
  { province_name: '江西', city_name: '萍乡' },
  { province_name: '江西', city_name: '九江' },
  { province_name: '江西', city_name: '新余' },
  { province_name: '江西', city_name: '鹰潭' },
  { province_name: '江西', city_name: '赣州' },
  { province_name: '江西', city_name: '吉安' },
  { province_name: '江西', city_name: '宜春' },
  { province_name: '江西', city_name: '抚州' },
  { province_name: '江西', city_name: '上饶' },

  // ──────────── 山东省 ────────────
  { province_name: '山东', city_name: '济南' },
  { province_name: '山东', city_name: '青岛' },
  { province_name: '山东', city_name: '淄博' },
  { province_name: '山东', city_name: '枣庄' },
  { province_name: '山东', city_name: '东营' },
  { province_name: '山东', city_name: '烟台' },
  { province_name: '山东', city_name: '潍坊' },
  { province_name: '山东', city_name: '济宁' },
  { province_name: '山东', city_name: '泰安' },
  { province_name: '山东', city_name: '威海' },
  { province_name: '山东', city_name: '日照' },
  { province_name: '山东', city_name: '临沂' },
  { province_name: '山东', city_name: '德州' },
  { province_name: '山东', city_name: '聊城' },
  { province_name: '山东', city_name: '滨州' },
  { province_name: '山东', city_name: '菏泽' },

  // ──────────── 河南省 ────────────
  { province_name: '河南', city_name: '郑州' },
  { province_name: '河南', city_name: '开封' },
  { province_name: '河南', city_name: '洛阳' },
  { province_name: '河南', city_name: '平顶山' },
  { province_name: '河南', city_name: '安阳' },
  { province_name: '河南', city_name: '鹤壁' },
  { province_name: '河南', city_name: '新乡' },
  { province_name: '河南', city_name: '焦作' },
  { province_name: '河南', city_name: '濮阳' },
  { province_name: '河南', city_name: '许昌' },
  { province_name: '河南', city_name: '漯河' },
  { province_name: '河南', city_name: '三门峡' },
  { province_name: '河南', city_name: '南阳' },
  { province_name: '河南', city_name: '商丘' },
  { province_name: '河南', city_name: '信阳' },
  { province_name: '河南', city_name: '周口' },
  { province_name: '河南', city_name: '驻马店' },
  { province_name: '河南', city_name: '济源' },

  // ──────────── 湖北省 ────────────
  { province_name: '湖北', city_name: '武汉' },
  { province_name: '湖北', city_name: '黄石' },
  { province_name: '湖北', city_name: '十堰' },
  { province_name: '湖北', city_name: '宜昌' },
  { province_name: '湖北', city_name: '襄阳' },
  { province_name: '湖北', city_name: '鄂州' },
  { province_name: '湖北', city_name: '荆门' },
  { province_name: '湖北', city_name: '孝感' },
  { province_name: '湖北', city_name: '荆州' },
  { province_name: '湖北', city_name: '黄冈' },
  { province_name: '湖北', city_name: '咸宁' },
  { province_name: '湖北', city_name: '随州' },
  { province_name: '湖北', city_name: '恩施' },

  // ──────────── 湖南省 ────────────
  { province_name: '湖南', city_name: '长沙' },
  { province_name: '湖南', city_name: '株洲' },
  { province_name: '湖南', city_name: '湘潭' },
  { province_name: '湖南', city_name: '衡阳' },
  { province_name: '湖南', city_name: '邵阳' },
  { province_name: '湖南', city_name: '岳阳' },
  { province_name: '湖南', city_name: '常德' },
  { province_name: '湖南', city_name: '张家界' },
  { province_name: '湖南', city_name: '益阳' },
  { province_name: '湖南', city_name: '郴州' },
  { province_name: '湖南', city_name: '永州' },
  { province_name: '湖南', city_name: '怀化' },
  { province_name: '湖南', city_name: '娄底' },
  { province_name: '湖南', city_name: '湘西' },

  // ──────────── 广东省 ────────────
  { province_name: '广东', city_name: '广州' },
  { province_name: '广东', city_name: '韶关' },
  { province_name: '广东', city_name: '深圳' },
  { province_name: '广东', city_name: '珠海' },
  { province_name: '广东', city_name: '汕头' },
  { province_name: '广东', city_name: '佛山' },
  { province_name: '广东', city_name: '江门' },
  { province_name: '广东', city_name: '湛江' },
  { province_name: '广东', city_name: '茂名' },
  { province_name: '广东', city_name: '肇庆' },
  { province_name: '广东', city_name: '惠州' },
  { province_name: '广东', city_name: '梅州' },
  { province_name: '广东', city_name: '汕尾' },
  { province_name: '广东', city_name: '河源' },
  { province_name: '广东', city_name: '阳江' },
  { province_name: '广东', city_name: '清远' },
  { province_name: '广东', city_name: '东莞' },
  { province_name: '广东', city_name: '中山' },
  { province_name: '广东', city_name: '潮州' },
  { province_name: '广东', city_name: '揭阳' },
  { province_name: '广东', city_name: '云浮' },

  // ──────────── 广西壮族自治区 ────────────
  { province_name: '广西', city_name: '南宁' },
  { province_name: '广西', city_name: '柳州' },
  { province_name: '广西', city_name: '桂林' },
  { province_name: '广西', city_name: '梧州' },
  { province_name: '广西', city_name: '北海' },
  { province_name: '广西', city_name: '防城港' },
  { province_name: '广西', city_name: '钦州' },
  { province_name: '广西', city_name: '贵港' },
  { province_name: '广西', city_name: '玉林' },
  { province_name: '广西', city_name: '百色' },
  { province_name: '广西', city_name: '贺州' },
  { province_name: '广西', city_name: '河池' },
  { province_name: '广西', city_name: '来宾' },
  { province_name: '广西', city_name: '崇左' },

  // ──────────── 海南省 ────────────
  { province_name: '海南', city_name: '海口' },
  { province_name: '海南', city_name: '三亚' },
  { province_name: '海南', city_name: '三沙' },
  { province_name: '海南', city_name: '儋州' },

  // ──────────── 四川省 ────────────
  { province_name: '四川', city_name: '成都' },
  { province_name: '四川', city_name: '自贡' },
  { province_name: '四川', city_name: '攀枝花' },
  { province_name: '四川', city_name: '泸州' },
  { province_name: '四川', city_name: '德阳' },
  { province_name: '四川', city_name: '绵阳' },
  { province_name: '四川', city_name: '广元' },
  { province_name: '四川', city_name: '遂宁' },
  { province_name: '四川', city_name: '内江' },
  { province_name: '四川', city_name: '乐山' },
  { province_name: '四川', city_name: '南充' },
  { province_name: '四川', city_name: '眉山' },
  { province_name: '四川', city_name: '宜宾' },
  { province_name: '四川', city_name: '广安' },
  { province_name: '四川', city_name: '达州' },
  { province_name: '四川', city_name: '雅安' },
  { province_name: '四川', city_name: '巴中' },
  { province_name: '四川', city_name: '资阳' },
  { province_name: '四川', city_name: '阿坝' },
  { province_name: '四川', city_name: '甘孜' },
  { province_name: '四川', city_name: '凉山' },

  // ──────────── 贵州省 ────────────
  { province_name: '贵州', city_name: '贵阳' },
  { province_name: '贵州', city_name: '六盘水' },
  { province_name: '贵州', city_name: '遵义' },
  { province_name: '贵州', city_name: '安顺' },
  { province_name: '贵州', city_name: '毕节' },
  { province_name: '贵州', city_name: '铜仁' },
  { province_name: '贵州', city_name: '黔西南' },
  { province_name: '贵州', city_name: '黔东南' },
  { province_name: '贵州', city_name: '黔南' },

  // ──────────── 云南省 ────────────
  { province_name: '云南', city_name: '昆明' },
  { province_name: '云南', city_name: '曲靖' },
  { province_name: '云南', city_name: '玉溪' },
  { province_name: '云南', city_name: '保山' },
  { province_name: '云南', city_name: '昭通' },
  { province_name: '云南', city_name: '丽江' },
  { province_name: '云南', city_name: '普洱' },
  { province_name: '云南', city_name: '临沧' },
  { province_name: '云南', city_name: '楚雄' },
  { province_name: '云南', city_name: '红河' },
  { province_name: '云南', city_name: '文山' },
  { province_name: '云南', city_name: '西双版纳' },
  { province_name: '云南', city_name: '大理' },
  { province_name: '云南', city_name: '德宏' },
  { province_name: '云南', city_name: '怒江' },
  { province_name: '云南', city_name: '迪庆' },

  // ──────────── 西藏自治区 ────────────
  { province_name: '西藏', city_name: '拉萨' },
  { province_name: '西藏', city_name: '日喀则' },
  { province_name: '西藏', city_name: '昌都' },
  { province_name: '西藏', city_name: '林芝' },
  { province_name: '西藏', city_name: '山南' },
  { province_name: '西藏', city_name: '那曲' },
  { province_name: '西藏', city_name: '阿里' },

  // ──────────── 陕西省 ────────────
  { province_name: '陕西', city_name: '西安' },
  { province_name: '陕西', city_name: '铜川' },
  { province_name: '陕西', city_name: '宝鸡' },
  { province_name: '陕西', city_name: '咸阳' },
  { province_name: '陕西', city_name: '渭南' },
  { province_name: '陕西', city_name: '延安' },
  { province_name: '陕西', city_name: '汉中' },
  { province_name: '陕西', city_name: '榆林' },
  { province_name: '陕西', city_name: '安康' },
  { province_name: '陕西', city_name: '商洛' },

  // ──────────── 甘肃省 ────────────
  { province_name: '甘肃', city_name: '兰州' },
  { province_name: '甘肃', city_name: '嘉峪关' },
  { province_name: '甘肃', city_name: '金昌' },
  { province_name: '甘肃', city_name: '白银' },
  { province_name: '甘肃', city_name: '天水' },
  { province_name: '甘肃', city_name: '武威' },
  { province_name: '甘肃', city_name: '张掖' },
  { province_name: '甘肃', city_name: '平凉' },
  { province_name: '甘肃', city_name: '酒泉' },
  { province_name: '甘肃', city_name: '庆阳' },
  { province_name: '甘肃', city_name: '定西' },
  { province_name: '甘肃', city_name: '陇南' },
  { province_name: '甘肃', city_name: '临夏' },
  { province_name: '甘肃', city_name: '甘南' },

  // ──────────── 青海省 ────────────
  { province_name: '青海', city_name: '西宁' },
  { province_name: '青海', city_name: '海东' },
  { province_name: '青海', city_name: '海北' },
  { province_name: '青海', city_name: '黄南' },
  { province_name: '青海', city_name: '海南州' },
  { province_name: '青海', city_name: '果洛' },
  { province_name: '青海', city_name: '玉树' },
  { province_name: '青海', city_name: '海西' },

  // ──────────── 宁夏回族自治区 ────────────
  { province_name: '宁夏', city_name: '银川' },
  { province_name: '宁夏', city_name: '石嘴山' },
  { province_name: '宁夏', city_name: '吴忠' },
  { province_name: '宁夏', city_name: '固原' },
  { province_name: '宁夏', city_name: '中卫' },

  // ──────────── 新疆维吾尔自治区 ────────────
  { province_name: '新疆', city_name: '乌鲁木齐' },
  { province_name: '新疆', city_name: '克拉玛依' },
  { province_name: '新疆', city_name: '吐鲁番' },
  { province_name: '新疆', city_name: '哈密' },
  { province_name: '新疆', city_name: '昌吉' },
  { province_name: '新疆', city_name: '博尔塔拉' },
  { province_name: '新疆', city_name: '巴音郭楞' },
  { province_name: '新疆', city_name: '阿克苏' },
  { province_name: '新疆', city_name: '克孜勒苏' },
  { province_name: '新疆', city_name: '喀什' },
  { province_name: '新疆', city_name: '和田' },
  { province_name: '新疆', city_name: '伊犁' },
  { province_name: '新疆', city_name: '塔城' },
  { province_name: '新疆', city_name: '阿勒泰' },

  // ──────────── 特别行政区 ────────────
  { province_name: '香港', city_name: '香港' },
  { province_name: '澳门', city_name: '澳门' },
  { province_name: '台湾', city_name: '台北' },
  { province_name: '台湾', city_name: '高雄' },
  { province_name: '台湾', city_name: '台中' },
  { province_name: '台湾', city_name: '台南' },
  { province_name: '台湾', city_name: '新北' },
  { province_name: '台湾', city_name: '桃园' },
];

// 工具函数

/** 获取所有省份（去重、按拼音排序） */
export function getProvinces() {
  const seen = new Set();
  const result = [];
  for (const item of CITY_LIST) {
    if (!seen.has(item.province_name)) {
      seen.add(item.province_name);
      result.push(item.province_name);
    }
  }
  return result.sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

/** 获取指定省份下的所有城市（按拼音排序） */
export function getCitiesByProvince(provinceName) {
  return CITY_LIST
    .filter(item => item.province_name === provinceName)
    .map(item => item.city_name)
    .sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

/** 根据城市名反查所属省份 */
export function findProvinceByCity(cityName) {
  const found = CITY_LIST.find(item => item.city_name === cityName);
  return found ? found.province_name : null;
}

/** 格式化显示字符串：省 · 市 */
export function formatArea(province, city) {
  if (!province || !city) return '';
  if (province === '不展示') return '不展示';
  if (province === city) return city; // 直辖市如"上海"不重复
  return `${province} · ${city}`;
}

export default CITY_LIST;
