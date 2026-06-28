-- ============================================================
-- DogFriends Supabase 数据库建表 + SEED 脚本
-- 在 Supabase SQL Editor 中运行（一次性）
-- ============================================================

-- 0. 扩展
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. profiles — 用户资料
-- ============================================================
create table profiles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  gender      text check (gender in ('male', 'female')),
  province    text,
  city        text,
  signature   text,
  avatar      text,
  cover       text,
  following   integer not null default 0,
  followers   integer not null default 0,
  likes       integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- 2. breeds — 品种参考（seed 数据）
-- ============================================================
create table breeds (
  id           serial primary key,
  name         text not null unique,
  size_group   text not null check (size_group in ('small', 'medium', 'large')),
  abbreviation text,
  is_hot       boolean not null default false
);

-- ============================================================
-- 3. dogs — 用户养的狗
-- ============================================================
create table dogs (
  id                  uuid primary key default gen_random_uuid(),
  profile_id          uuid not null references profiles(id),
  name                text not null,
  breed               text not null,
  size                text check (size in ('small', 'medium', 'large')),
  gender              text check (gender in ('male', 'female')),
  birthday            date,
  weight              numeric(4,1),
  neutered            boolean not null default false,
  traits              text[] not null default '{}',
  image               text,
  walk_stats_walks    integer not null default 0,
  walk_stats_distance numeric(6,1) not null default 0,
  walk_stats_duration integer not null default 0,
  public_walk_stats   boolean not null default true,
  public_profile      boolean not null default true,
  created_at          timestamptz not null default now()
);

create index idx_dogs_profile_id on dogs(profile_id);

-- ============================================================
-- 4. posts — 广场动态
-- ============================================================
create table posts (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid not null references profiles(id),
  title            text not null,
  tag              text check (tag in ('日常分享', '求助/经验', '狗狗配对', '好物分享', '养宠攻略')),
  text             text,
  media_type       text not null default 'image' check (media_type in ('image', 'video', 'none')),
  media_url        text,
  images           text[] not null default '{}',
  location         text,
  visibility       text not null default 'public',
  likes_count      integer not null default 0,
  favorites_count  integer not null default 0,
  comments_count   integer not null default 0,
  created_at       timestamptz not null default now()
);

create index idx_posts_profile_id on posts(profile_id);
create index idx_posts_created_at on posts(created_at desc);

-- ============================================================
-- 5. post_comments — 评论（支持嵌套回复）
-- ============================================================
create table post_comments (
  id            uuid primary key default gen_random_uuid(),
  post_id       uuid not null references posts(id) on delete cascade,
  parent_id     uuid references post_comments(id),
  profile_id    uuid not null references profiles(id),
  text          text not null,
  reply_to_name text,
  likes_count   integer not null default 0,
  created_at    timestamptz not null default now()
);

create index idx_post_comments_post_id on post_comments(post_id);
create index idx_post_comments_parent_id on post_comments(parent_id);

-- ============================================================
-- 6. post_likes — 点赞关系
-- ============================================================
create table post_likes (
  post_id    uuid not null references posts(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);

-- ============================================================
-- 7. post_favorites — 收藏关系
-- ============================================================
create table post_favorites (
  post_id    uuid not null references posts(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);

-- ============================================================
-- 8. comment_likes — 评论点赞
-- ============================================================
create table comment_likes (
  comment_id uuid not null references post_comments(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, profile_id)
);

-- ============================================================
-- 9. locations — 遛狗友好地点
-- ============================================================
create table locations (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  category           text check (category in ('cafe', 'park', 'restaurant', 'mall', 'scenic', 'hotel', 'other')),
  category_label     text not null,
  city               text not null,
  distance_km        numeric(5,1),
  phone              text,
  hours              text,
  entry_area         text check (entry_area in ('all_areas', 'outdoor', 'indoor', 'not_allowed', 'unknown')),
  dog_size           text[],
  behaviors          text[],
  facilities         text[],
  tags               text[],
  status             text not null,
  verifier_count     integer not null default 0,
  last_updated_label text,
  thumbnail_url      text,
  photos             text[] not null default '{}',
  description        text,
  submitted_by       uuid references profiles(id),
  created_at         timestamptz not null default now()
);

create index idx_locations_city on locations(city);

-- ============================================================
-- 10. location_validations — 狗主人验证
-- ============================================================
create table location_validations (
  id            uuid primary key default gen_random_uuid(),
  location_id   uuid not null references locations(id) on delete cascade,
  profile_id    uuid not null references profiles(id),
  outcome_key   text check (outcome_key in ('success', 'outdoor_only', 'indoor_ok', 'large_ok', 'large_no', 'blocked')),
  outcome_label text not null,
  dog_size      text,
  tags          text[],
  note          text,
  photos        text[] not null default '{}',
  helpful_count integer not null default 0,
  created_at    timestamptz not null default now()
);

create index idx_location_validations_location_id on location_validations(location_id);

-- ============================================================
-- 11. location_favorites — 收藏地点
-- ============================================================
create table location_favorites (
  location_id uuid not null references locations(id) on delete cascade,
  profile_id  uuid not null references profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (location_id, profile_id)
);

-- ============================================================
-- 12. validation_helpful — 验证的"有用"标记
-- ============================================================
create table validation_helpful (
  validation_id uuid not null references location_validations(id) on delete cascade,
  profile_id    uuid not null references profiles(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (validation_id, profile_id)
);

-- ============================================================
-- 13. inaccuracy_reports — 验证的不准确举报
-- ============================================================
create table inaccuracy_reports (
  id            uuid primary key default gen_random_uuid(),
  validation_id uuid references location_validations(id) on delete cascade,
  location_id   uuid not null references locations(id) on delete cascade,
  profile_id    uuid not null references profiles(id),
  reason        text not null,
  created_at    timestamptz not null default now()
);

create index idx_inaccuracy_reports_validation_id on inaccuracy_reports(validation_id);
create index idx_inaccuracy_reports_location_id on inaccuracy_reports(location_id);

-- ============================================================
-- 14. walk_records — 遛狗记录
-- ============================================================
create table walk_records (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references profiles(id),
  dog_ids     uuid[],
  start_time  timestamptz not null,
  end_time    timestamptz,
  distance    numeric(5,2) not null default 0,
  duration    integer not null default 0,
  pace        numeric(4,1),
  track_points jsonb,
  photos      text[] not null default '{}',
  checkins    jsonb,
  created_at  timestamptz not null default now()
);

create index idx_walk_records_profile_id on walk_records(profile_id);

-- ============================================================
-- 15. contributions — 用户贡献记录
-- ============================================================
create table contributions (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references profiles(id),
  location_id   uuid not null references locations(id),
  type          text not null check (type in ('新增地点', '更新信息')),
  status        text,
  created_at    timestamptz not null default now()
);

create index idx_contributions_profile_id on contributions(profile_id);

-- ============================================================
-- 16. follows — 关注关系
-- ============================================================
create table follows (
  follower_id  uuid not null references profiles(id) on delete cascade,
  following_id uuid not null references profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id)
);

create index idx_follows_follower_id on follows(follower_id);
create index idx_follows_following_id on follows(following_id);

-- ============================================================
-- RLS（行级安全）
-- ============================================================
alter table profiles enable row level security;
alter table dogs enable row level security;
alter table posts enable row level security;
alter table post_comments enable row level security;
alter table post_likes enable row level security;
alter table post_favorites enable row level security;
alter table comment_likes enable row level security;
alter table locations enable row level security;
alter table location_validations enable row level security;
alter table location_favorites enable row level security;
alter table validation_helpful enable row level security;
alter table inaccuracy_reports enable row level security;
alter table walk_records enable row level security;
alter table contributions enable row level security;
alter table follows enable row level security;

-- 公开内容所有人可读
create policy "公开读" on profiles for select using (true);
create policy "公开读" on posts for select using (true);
create policy "公开读" on post_comments for select using (true);
create policy "公开读" on locations for select using (true);
create policy "公开读" on location_validations for select using (true);

-- 自己的数据可写
create policy "自己写" on profiles for all using (auth.uid() = id);
create policy "自己写" on dogs for all using (auth.uid() = profile_id);
create policy "自己写" on posts for all using (auth.uid() = profile_id);
create policy "自己写" on post_comments for insert with check (auth.uid() = profile_id);
create policy "自己写" on post_likes for all using (auth.uid() = profile_id);
create policy "自己写" on post_favorites for all using (auth.uid() = profile_id);
create policy "自己写" on comment_likes for all using (auth.uid() = profile_id);
create policy "自己写" on walk_records for all using (auth.uid() = profile_id);
create policy "自己写" on contributions for all using (auth.uid() = profile_id);
create policy "自己写" on location_validations for insert with check (auth.uid() = profile_id);
create policy "自己写" on location_favorites for all using (auth.uid() = profile_id);
create policy "自己写" on validation_helpful for all using (auth.uid() = profile_id);
create policy "自己写" on inaccuracy_reports for insert with check (auth.uid() = profile_id);

-- 关注：可读所有人的关注关系，只能管理自己的
create policy "公开读" on follows for select using (true);
create policy "自己管理关注" on follows for insert with check (auth.uid() = follower_id);
create policy "自己取消关注" on follows for delete using (auth.uid() = follower_id);

-- 公开新增
create policy "公开新增" on locations for insert with check (true);
create policy "公开新增" on contributions for insert with check (true);

-- 自己的地点可修改
create policy "自己写" on locations for all using (auth.uid() = submitted_by);

-- ============================================================
-- SEED 数据
-- ============================================================

-- --- profiles ---
insert into profiles (id, name, gender, province, city, signature, avatar, cover, following, followers, likes) values
  ('a0000000-0000-0000-0000-000000000001', '小明',  'male',   '上海', '上海', '每天和旺财、小白一起散步，记录生活的小确幸。', 'https://images.unsplash.com/photo-1601758177266-bc599de87707?auto=format&fit=crop&w=300&q=80', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80', 32, 128, 890),
  ('a0000000-0000-0000-0000-000000000002', '豆豆妈妈', 'female', '上海', '上海', null, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', null, 18, 56, 340),
  ('a0000000-0000-0000-0000-000000000003', '可乐姐姐', 'female', '上海', '上海', null, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80', null, 24, 72, 510),
  ('a0000000-0000-0000-0000-000000000004', '布丁爸',  'male',   '上海', '上海', null, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', null, 15, 31, 120),
  ('a0000000-0000-0000-0000-000000000005', '栗子',   'female', '上海', '上海', null, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', null, 22, 48, 260),
  ('a0000000-0000-0000-0000-000000000006', '阿黄爸爸', 'male',   '上海', '上海', null, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80', null, 30, 95, 670),
  ('a0000000-0000-0000-0000-000000000007', '狗蛋爸爸', 'male',   '北京', '北京', null, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', null, 12, 33, 180),
  ('a0000000-0000-0000-0000-000000000008', '旺财家',  'male',   '上海', '上海', null, null, null, 8, 14, 90),
  ('a0000000-0000-0000-0000-000000000009', '阿福',   'male',   '上海', '上海', null, null, null, 6, 10, 45),
  ('a0000000-0000-0000-0000-000000000010', '小白妈妈', 'female', '上海', '上海', null, null, null, 4, 8, 30),
  ('a0000000-0000-0000-0000-000000000011', '肉松',   'male',   '上海', '上海', null, null, null, 3, 6, 20),
  ('a0000000-0000-0000-0000-000000000012', '柯基阿福', 'male',   '上海', '上海', null, null, null, 5, 12, 55),
  ('a0000000-0000-0000-0000-000000000013', '咖啡日和', 'female', '上海', '上海', null, null, null, 7, 16, 78);

-- --- dogs 小明有两只狗：旺财、小白 ---
insert into dogs (id, profile_id, name, breed, size, gender, birthday, weight, neutered, traits, image, walk_stats_walks, walk_stats_distance, walk_stats_duration) values
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '旺财', '金毛寻回犬', 'large', 'male',   '2023-03-15', 32.0, true,  '{亲人,爱玩}', 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80', 128, 320, 45),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '小白', '萨摩耶',    'large', 'female', '2024-06-01', 22.0, false, '{活泼,亲狗}', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80', 86,  210, 32);

-- --- breeds ---
insert into breeds (name, size_group, abbreviation, is_hot) values
  ('金毛寻回犬', 'large', '金毛', true),
  ('拉布拉多', 'large', '拉布拉多', true),
  ('柯基犬', 'medium', '柯基', true),
  ('柴犬', 'medium', '柴犬', true),
  ('法国斗牛犬', 'small', '法斗', true),
  ('萨摩耶', 'medium', '萨摩', true),
  ('哈士奇', 'medium', '哈士奇', true),
  ('贵宾犬', 'small', '贵宾', true),
  ('博美犬', 'small', '博美', true),
  ('比熊犬', 'small', '比熊', true),
  ('中华田园犬', 'medium', '田园犬', true),
  ('德国牧羊犬', 'large', '德牧', true),
  ('雪纳瑞', 'medium', '雪纳瑞', true),
  ('巴哥犬', 'small', '巴哥', true),
  ('吉娃娃', 'small', '吉娃娃', true),
  ('秋田犬', 'medium', '秋田', true);

-- 中型犬
insert into breeds (name, size_group, abbreviation, is_hot) values
  ('边境牧羊犬', 'medium', '边牧', false),
  ('喜乐蒂牧羊犬', 'medium', '喜乐蒂', false),
  ('澳大利亚牧羊犬', 'medium', '澳牧', false),
  ('卡迪根威尔士柯基', 'medium', '卡迪根柯基', false),
  ('彭布罗克威尔士柯基', 'medium', '彭布罗克柯基', false),
  ('苏格兰牧羊犬粗毛', 'medium', '苏牧', false),
  ('苏格兰牧羊犬顺毛', 'medium', '顺毛苏牧', false),
  ('长须牧羊犬', 'medium', '长须', false),
  ('澳洲牧牛犬', 'medium', '澳牛', false),
  ('沙皮犬', 'medium', '沙皮', false),
  ('松狮犬', 'medium', '松狮', false),
  ('惠比特犬', 'medium', '惠比特', false),
  ('灵缇犬', 'medium', '灵缇', false),
  ('大麦町', 'medium', '大麦町', false),
  ('威斯拉犬', 'medium', '威斯拉', false),
  ('布列塔尼犬', 'medium', '布列塔尼', false),
  ('英国激飞猎犬', 'medium', '激飞', false),
  ('威尔士史宾格犬', 'medium', '威史宾格', false),
  ('拳师犬', 'medium', '拳师', false),
  ('荷兰毛狮犬', 'medium', '毛狮', false),
  ('芬兰拉普猎犬', 'medium', '芬兰拉普', false),
  ('比利时马林诺斯', 'medium', '马犬', false),
  ('比利时牧羊犬', 'medium', '比牧', false),
  ('比利时特伏丹犬', 'medium', '特伏丹', false),
  ('比利时拉肯努斯犬', 'medium', '拉肯努斯', false),
  ('伯瑞犬', 'medium', '伯瑞', false),
  ('博塞尔犬', 'medium', '博塞尔', false),
  ('下司犬', 'medium', '下司', false),
  ('川东猎犬', 'medium', '川东', false),
  ('昆明犬', 'medium', '昆明', false),
  ('细犬', 'medium', '细犬', false),
  ('西藏猎犬', 'medium', '西藏猎犬', false),
  ('莱州红犬', 'medium', '莱州红', false),
  ('虎斑犬', 'medium', '虎斑', false),
  ('葡萄牙水犬', 'medium', '葡水', false),
  ('荷兰狮毛犬', 'medium', '荷兰狮毛', false),
  ('泰国脊背犬', 'medium', '泰脊背', false),
  ('葡萄牙波登哥犬', 'medium', '波登哥', false),
  ('比特犬', 'medium', '比特', false),
  ('美国比特斗牛梗', 'medium', '比特', false),
  ('斯塔福郡斗牛梗', 'medium', '斯塔福', false),
  ('美国斯塔福郡梗', 'medium', '美斯塔福', false),
  ('万能梗', 'medium', '万能', false),
  ('巴吉度猎犬', 'medium', '巴吉度', false),
  ('魏玛犬', 'medium', '魏玛', false),
  ('诺瓦斯科西亚猎鸭寻回犬', 'medium', '鸭猎', false),
  ('拉戈托罗马阁挪露犬', 'medium', '拉戈托', false),
  ('意大利布拉可犬', 'medium', '布拉可', false),
  ('斯皮诺内犬', 'medium', '斯皮诺内', false),
  ('钢毛威斯拉犬', 'medium', '钢毛威斯', false),
  ('钢毛指示格里芬犬', 'medium', '格里芬', false),
  ('芭贝犬', 'medium', '芭贝', false),
  ('博伊金猎犬', 'medium', '博伊金', false),
  ('波音达指示犬', 'medium', '波音达', false),
  ('场猎犬', 'medium', '场猎', false),
  ('克伦伯猎犬', 'medium', '克伦伯', false),
  ('萨塞克斯猎犬', 'medium', '萨塞克斯', false),
  ('爱尔兰水猎犬', 'medium', '爱水猎', false),
  ('美国水猎犬', 'medium', '美水猎', false),
  ('德国短毛指示犬', 'medium', '短毛指示', false),
  ('德国钢毛指示犬', 'medium', '钢毛指示', false),
  ('戈登雪达犬', 'medium', '戈登', false),
  ('爱尔兰雪达犬', 'medium', '爱雪达', false),
  ('英国雪达犬', 'medium', '英雪达', false),
  ('爱尔兰红白雪达犬', 'medium', '红白雪达', false),
  ('荷兰科克尔犬', 'medium', '科克尔', false),
  ('冰岛牧羊犬', 'medium', '冰岛牧羊', false),
  ('波兰低地牧羊犬', 'medium', '波低地', false),
  ('法兰德斯牧羊犬', 'medium', '法兰德斯', false),
  ('挪威猎犬', 'medium', '挪威猎犬', false),
  ('美国猎狐犬', 'medium', '美猎狐', false),
  ('英国猎狐犬', 'medium', '英猎狐', false),
  ('猎浣熊犬', 'medium', '猎浣熊', false),
  ('普罗特猎犬', 'medium', '普罗特', false),
  ('奥达猎犬', 'medium', '奥达', false),
  ('哈利犬', 'medium', '哈利', false),
  ('蓝斑猎浣熊犬', 'medium', '蓝斑', false),
  ('树上竞走猎浣熊犬', 'medium', '树竞', false),
  ('斑点犬', 'medium', '斑点犬', false),
  ('美国英国猎浣熊犬', 'medium', '美英猎浣熊', false),
  ('可卡犬', 'medium', '可卡', false),
  ('美国可卡犬', 'medium', '美卡', false),
  ('英国可卡犬', 'medium', '英卡', false),
  ('牛头梗', 'medium', '牛头梗', false),
  ('凯利蓝梗', 'medium', '凯利蓝', false),
  ('迷你美国牧羊犬', 'medium', '迷你美牧', false),
  ('芬兰波美拉尼亚犬', 'medium', '芬兰波美', false);

-- 小型犬
insert into breeds (name, size_group, abbreviation, is_hot) values
  ('约克夏', 'small', '约克夏', false),
  ('马尔济斯', 'small', '马尔济斯', false),
  ('蝴蝶犬', 'small', '蝴蝶犬', false),
  ('查理王小猎犬', 'small', '查理王', false),
  ('迷你雪纳瑞', 'small', '迷你雪纳瑞', false),
  ('迷你杜宾', 'small', '迷你杜宾', false),
  ('日本狆', 'small', '日本狆', false),
  ('京巴犬', 'small', '京巴', false),
  ('西施犬', 'small', '西施', false),
  ('哈瓦那犬', 'small', '哈瓦那', false),
  ('玩具贵宾犬', 'small', '玩贵', false),
  ('英国玩具犬', 'small', '英玩具', false),
  ('猴犬', 'small', '猴犬', false),
  ('玩具曼彻斯特犬', 'small', '玩曼彻斯特', false),
  ('棉花面纱犬', 'small', '棉花面纱', false),
  ('俄罗斯玩具犬', 'small', '俄玩具', false),
  ('意大利灵缇', 'small', '意灵缇', false),
  ('布鲁塞尔格里芬犬', 'small', '格里芬', false),
  ('腊肠犬', 'small', '腊肠', false),
  ('比格犬', 'small', '比格', false),
  ('中国冠毛犬', 'small', '冠毛犬', false),
  ('西高地白梗', 'small', '西高地', false),
  ('凯恩梗', 'small', '凯恩', false),
  ('苏格兰梗', 'small', '苏格兰梗', false),
  ('贝德灵顿梗', 'small', '贝德灵顿', false),
  ('丝毛梗', 'small', '丝毛', false),
  ('诺福克梗', 'small', '诺福克', false),
  ('诺维奇梗', 'small', '诺维奇', false),
  ('西里汉梗', 'small', '西里汉', false),
  ('边境梗', 'small', '边境梗', false),
  ('丹迪丁蒙梗', 'small', '丹迪丁蒙', false),
  ('帕森罗塞尔梗', 'small', '罗塞尔', false),
  ('杰克罗素梗', 'small', '杰克罗素', false),
  ('猎狐梗', 'small', '猎狐', false),
  ('威尔士梗', 'small', '威尔士梗', false),
  ('澳大利亚梗', 'small', '澳大利亚梗', false),
  ('迷你牛头梗', 'small', '迷你牛头', false),
  ('波士顿梗', 'small', '波士顿', false),
  ('小巴吉度格里芬犬', 'small', '小巴吉度', false),
  ('艾特纳犬', 'small', '艾特纳', false),
  ('小型葡萄牙波登哥犬', 'small', '小波登哥', false),
  ('秘鲁印加兰花犬', 'small', '印加兰花', false),
  ('荷兰斯姆茨犬', 'small', '斯姆茨', false),
  ('萨普鲁尼犬', 'small', '萨普鲁尼', false),
  ('拉萨犬', 'small', '拉萨', false),
  ('史奇派克犬', 'small', '史奇派克', false),
  ('西藏梗', 'small', '西藏梗', false);

-- 大型犬
insert into breeds (name, size_group, abbreviation, is_hot) values
  ('罗威纳', 'large', '罗威纳', false),
  ('杜宾犬', 'large', '杜宾', false),
  ('大丹犬', 'large', '大丹', false),
  ('伯恩山犬', 'large', '伯恩山', false),
  ('圣伯纳犬', 'large', '圣伯纳', false),
  ('纽芬兰犬', 'large', '纽芬兰', false),
  ('大白熊犬', 'large', '大白熊', false),
  ('巨型雪纳瑞', 'large', '巨雪', false),
  ('马士提夫犬', 'large', '马士提夫', false),
  ('斗牛獒', 'large', '斗牛獒', false),
  ('波尔多獒犬', 'large', '波尔多', false),
  ('安纳托利亚牧羊犬', 'large', '安纳托利亚', false),
  ('库瓦兹犬', 'large', '库瓦兹', false),
  ('大比利牛斯山犬', 'large', '比利牛斯', false),
  ('可蒙犬', 'large', '可蒙', false),
  ('波利犬', 'large', '波利', false),
  ('藏獒', 'large', '藏獒', false),
  ('纽波利顿獒犬', 'large', '纽波利顿', false),
  ('巴西菲勒犬', 'large', '菲勒', false),
  ('阿根廷杜高犬', 'large', '杜高', false),
  ('卡斯罗犬', 'large', '卡斯罗', false),
  ('南非獒犬', 'large', '南非獒', false),
  ('大型瑞士山地犬', 'large', '大瑞士', false),
  ('恩特雷布赫山地犬', 'large', '恩特雷布赫', false),
  ('德国宾莎犬', 'large', '宾莎', false),
  ('莱昂伯格犬', 'large', '莱昂伯格', false),
  ('奇努克犬', 'large', '奇努克', false),
  ('俄罗斯黑梗', 'large', '黑梗', false),
  ('爱尔兰猎狼犬', 'large', '猎狼犬', false),
  ('苏格兰猎鹿犬', 'large', '猎鹿犬', false),
  ('罗德西亚脊背犬', 'large', '脊背犬', false),
  ('阿拉斯加雪橇犬', 'large', '阿拉斯加', false),
  ('阿富汗猎犬', 'large', '阿富汗', false),
  ('寻血猎犬', 'large', '寻血', false),
  ('俄国猎狼犬', 'large', '波索犬', false),
  ('中亚牧羊犬', 'large', '中亚', false),
  ('高加索牧羊犬', 'large', '高加索', false),
  ('古英国牧羊犬', 'large', '古牧', false),
  ('切萨皮克湾寻回犬', 'large', '切萨皮克', false),
  ('卷毛寻回犬', 'large', '卷毛寻回', false),
  ('平毛寻回犬', 'large', '平毛寻回', false);

-- --- posts ---
insert into posts (id, profile_id, title, tag, text, media_type, media_url, images, location, likes_count, favorites_count, comments_count, created_at) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '带豆豆去复兴公园散步', '日常分享', '今天带豆豆去了复兴公园，草地很大，早上人少，狗狗牵绳散步很舒服。', 'image', 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=600&q=80', '{}', '上海', 28, 9, 2, '2026-06-08'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', '推荐一个折叠水碗', '好物分享', '这个折叠水碗很轻，出门塞包里不占地方。夏天遛狗一定要带水。', 'image', 'https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?auto=format&fit=crop&w=600&q=80', '{}', '上海', 41, 18, 1, '2026-06-07'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', '求推荐胆小狗适合的咖啡店', '求助/经验', '有没有胆小狗适合去的咖啡店？希望空间别太挤，店员对狗狗友好。', 'image', 'https://images.unsplash.com/photo-1558944351-c9734c3adf8d?auto=format&fit=crop&w=600&q=80', '{}', '上海', 12, 4, 0, '2026-06-06'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005', '找周末散步小伙伴', '狗狗配对', '周末想找一只性格稳定的小伙伴一起散步，我家是 2 岁柯基，比较亲人。', 'image', 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=600&q=80', '{}', '上海', 19, 6, 1, '2026-06-05'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000006', '夏天遛狗注意事项', '养宠攻略', '夏天遛狗尽量避开正午，出门前摸一下地面温度，太烫就不要走水泥路。', 'image', 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80', '{}', '上海', 33, 11, 0, '2026-06-04'),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000007', '三狗出行记', '日常分享', '今天三只狗一起出门，老大走在最前面开路，老二在中间蹦蹦跳跳，老三在后面磨蹭，真是热闹的一家。', 'image', 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80', '{}', '北京', 15, 3, 0, '2026-06-14'),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', '三小只在滨江撒欢', '日常分享', '今天下午天气不错，带三只狗去滨江步道散步。', 'image', 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
   '{https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80,https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80,https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=600&q=80}',
   '上海', 37, 15, 0, '2026-06-18');

-- --- posts 的点赞/收藏（小明的） ---
insert into post_favorites (post_id, profile_id) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001');
insert into post_likes (post_id, profile_id) values
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001');

-- --- post_comments ---
insert into post_comments (id, post_id, parent_id, profile_id, text, reply_to_name, likes_count, created_at) values
  -- post_1 的评论
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', null, 'a0000000-0000-0000-0000-000000000008', '早上几点去人比较少？', null, 3, '2026-06-08'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', null, 'a0000000-0000-0000-0000-000000000009', '这片草地我家狗也很喜欢。', null, 5, '2026-06-08'),
  -- post_1 评论1 的回复
  ('c0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '我一般 8 点前到，人少很多，狗狗也不热。', '旺财家', 1, '2026-06-08'),
  -- 对回复的回复
  ('c0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000009', '那我下次也早点去，之前十点多已经有点晒了。', '豆豆妈妈', 2, '2026-06-08'),
  ('c0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000008', '对，八点前最舒服，狗狗也愿意多走一会儿。', '阿福', 0, '2026-06-08'),
  -- post_2 的评论
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', null, 'a0000000-0000-0000-0000-000000000010', '求链接！', null, 2, '2026-06-07'),
  ('c0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', '我是在宠物店买的，关键词搜折叠水碗就能找到类似款。', '小白妈妈', 0, '2026-06-07'),
  -- post_4 的评论
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', null, 'a0000000-0000-0000-0000-000000000011', '我家柴犬可以试试。', null, 1, '2026-06-05');

-- 评论点赞（小明的）
insert into comment_likes (comment_id, profile_id) values
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001');

-- --- locations ---
insert into locations (id, name, category, category_label, city, distance_km, latitude, longitude, phone, hours, entry_area, dog_size, behaviors, facilities, tags, status, verifier_count, last_updated_label, thumbnail_url, photos, description, submitted_by) values
  ('e0000000-0000-0000-0000-000000000001', 'BLOOM Coffee',      'cafe', '咖啡', '上海', 1.8, 31.2175, 121.4310, '021-1234-5678', '10:00 - 22:00', 'outdoor',     '{small,medium}', '{需要牵绳,不能上椅 / 沙发,不能吠叫,不影响其他客人}', '{有水碗,有宠物餐,有狗狗零食,有遮阳区}', '{}', 'RECENT_VISIT', 3, '2 天前更新', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=160&q=80',
   '{https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80,https://images.unsplash.com/photo-1514888282295-e11b1a6b5c5f?auto=format&fit=crop&w=800&q=80}',
   '位于老洋房一楼的小咖啡店，露台有几张大桌，狗狗可以安静趴在脚边。', 'a0000000-0000-0000-0000-000000000006'),
  ('e0000000-0000-0000-0000-000000000002', '复兴公园',           'park', '公园',   '上海', 3.2, 31.2160, 121.4690, '',                '06:00 - 22:00', 'outdoor',     '{all}',       '{需要牵绳}',                                        '{有便袋,有草坪,有遮阳区}',     '{}', 'MULTI_VERIFIED', 12, '今天更新',       'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=160&q=80',
   '{https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80,https://images.unsplash.com/photo-1504208434309-cb69f4fd5084?auto=format&fit=crop&w=800&q=80,https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80}',
   '上海老牌的法式公园，绿地宽敞，狗狗牵绳即可入园。', 'a0000000-0000-0000-0000-000000000002'),
  ('e0000000-0000-0000-0000-000000000003', '爪爪咖啡 Paw Cafe', 'cafe', '咖啡', '上海', 1.2, 31.2190, 121.4390, '021-8888-8888', '11:00 - 21:00', 'indoor',      '{large}',     '{需要牵绳}',                                        '{有水碗}',                      '{}', 'USER_SUBMITTED', 0, '刚刚发布',       'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=160&q=80',
   '{https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80}',
   '本店欢迎所有体型的狗狗，店里准备了水碗。', 'a0000000-0000-0000-0000-000000000001');

-- --- location_favorites（小明收藏了前两个） ---
insert into location_favorites (location_id, profile_id) values
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001');

-- --- location_validations ---
insert into location_validations (id, location_id, profile_id, outcome_key, outcome_label, dog_size, tags, note, photos, helpful_count, created_at) values
  ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'success',      '我带狗成功去了', '小型犬', '{仅户外,有水碗,店员友好}', '店员很好，给了水碗。露台位置比较宽，狗狗可以安静待着。周末去的时候人有点多，但是店员很耐心，还额外给了狗狗零食。整体体验很不错，推荐大家去试试！', '{https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80,https://images.unsplash.com/photo-1587574293340-e0011c4e8ecf?w=400&q=80}', 12, '2026-06-21'),
  ('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000012', 'outdoor_only', '只能坐户外',     '小型犬', '{仅户外,空间宽敞}',          '室内有点窄，但露台位置很赞。', '{https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80,https://images.unsplash.com/photo-1587574293340-e0011c4e8ecf?w=400&q=80}', 4,  '2026-06-18'),
  ('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000013', 'success',      '我带狗成功去了', '中型犬', '{店员友好,人多拥挤}',        '周末确实人多，狗狗略紧张。建议工作日去。', '{}', 2,  '2026-06-15'),
  ('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000006', 'success',      '我带狗成功去了', '大型犬', '{需要牵绳,空间宽敞}',        '草坪超大，狗狗很开心。门口工作人员会提醒牵绳。', '{https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80,https://images.unsplash.com/photo-1504208434309-cb69f4fd5084?w=400&q=80,https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80}', 28, '2026-06-22');

-- --- contributions ---
insert into contributions (profile_id, location_id, type, status, created_at) values
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', '新增地点', 'USER_SUBMITTED', '2026-06-08'),
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', '更新信息', 'RECENT_VISIT',  '2026-06-06');

-- ============================================================
-- RPC 函数 — 计数器增减（给客户端调用）
-- ============================================================

create or replace function increment_post_likes(row_id uuid)
returns void as $$
  update posts set likes_count = likes_count + 1 where id = row_id;
$$ language sql security definer;

create or replace function decrement_post_likes(row_id uuid)
returns void as $$
  update posts set likes_count = greatest(0, likes_count - 1) where id = row_id;
$$ language sql security definer;

create or replace function increment_post_favorites(row_id uuid)
returns void as $$
  update posts set favorites_count = favorites_count + 1 where id = row_id;
$$ language sql security definer;

create or replace function decrement_post_favorites(row_id uuid)
returns void as $$
  update posts set favorites_count = greatest(0, favorites_count - 1) where id = row_id;
$$ language sql security definer;

create or replace function increment_post_comments(row_id uuid)
returns void as $$
  update posts set comments_count = comments_count + 1 where id = row_id;
$$ language sql security definer;

create or replace function increment_comment_likes(row_id uuid)
returns void as $$
  update post_comments set likes_count = likes_count + 1 where id = row_id;
$$ language sql security definer;

create or replace function decrement_comment_likes(row_id uuid)
returns void as $$
  update post_comments set likes_count = greatest(0, likes_count - 1) where id = row_id;
$$ language sql security definer;

create or replace function increment_validation_helpful(row_id uuid)
returns void as $$
  update location_validations set helpful_count = helpful_count + 1 where id = row_id;
$$ language sql security definer;

create or replace function decrement_validation_helpful(row_id uuid)
returns void as $$
  update location_validations set helpful_count = greatest(0, helpful_count - 1) where id = row_id;
$$ language sql security definer;

-- ============================================================
-- 用户资料获赞计数 RPC（调用方需要）
-- ============================================================

create or replace function increment_profile_likes(profile_id uuid)
returns void as $$
  update profiles set likes = likes + 1 where id = profile_id;
$$ language sql security definer;

create or replace function decrement_profile_likes(profile_id uuid)
returns void as $$
  update profiles set likes = greatest(0, likes - 1) where id = profile_id;
$$ language sql security definer;

-- ============================================================
-- 关注/粉丝计数 RPC（security definer 以绕过 profile RLS）
-- ============================================================

create or replace function increment_profile_following(profile_id uuid)
returns void as $$
  update profiles set following = following + 1 where id = profile_id;
$$ language sql security definer;

create or replace function decrement_profile_following(profile_id uuid)
returns void as $$
  update profiles set following = greatest(0, following - 1) where id = profile_id;
$$ language sql security definer;

create or replace function increment_profile_followers(profile_id uuid)
returns void as $$
  update profiles set followers = followers + 1 where id = profile_id;
$$ language sql security definer;

create or replace function decrement_profile_followers(profile_id uuid)
returns void as $$
  update profiles set followers = greatest(0, followers - 1) where id = profile_id;
$$ language sql security definer;

-- ============================================================
-- 自动创建 profile 当用户注册时
-- ============================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- Storage RLS — photos bucket
-- ============================================================
-- 注意：需要在 Supabase Dashboard → Storage → photos → Policies 中确认
-- 或手动执行以下策略

-- 公开读
create policy "公开读" on storage.objects for select using (bucket_id = 'photos');

-- 认证用户可上传（自己身份）
create policy "认证用户上传" on storage.objects for insert with check (
  bucket_id = 'photos' and auth.role() = 'authenticated'
);

-- 用户可更新/删除自己的文件
create policy "自己写文件" on storage.objects for all using (
  bucket_id = 'photos' and auth.uid() = owner
);
