-- ============================================================
-- DogFriends Supabase 迁移 v2
-- 在之前的表基础上，补充 RPC 函数和自动创建 profile 触发器
-- ============================================================

-- RPC 函数 — 计数器增减

create or replace function increment_post_likes(row_id uuid)
returns void as $$
  update posts set likes_count = likes_count + 1 where id = row_id;
$$ language sql;

create or replace function decrement_post_likes(row_id uuid)
returns void as $$
  update posts set likes_count = greatest(0, likes_count - 1) where id = row_id;
$$ language sql;

create or replace function increment_post_favorites(row_id uuid)
returns void as $$
  update posts set favorites_count = favorites_count + 1 where id = row_id;
$$ language sql;

create or replace function decrement_post_favorites(row_id uuid)
returns void as $$
  update posts set favorites_count = greatest(0, favorites_count - 1) where id = row_id;
$$ language sql;

create or replace function increment_post_comments(row_id uuid)
returns void as $$
  update posts set comments_count = comments_count + 1 where id = row_id;
$$ language sql;

create or replace function increment_comment_likes(row_id uuid)
returns void as $$
  update post_comments set likes_count = likes_count + 1 where id = row_id;
$$ language sql;

create or replace function decrement_comment_likes(row_id uuid)
returns void as $$
  update post_comments set likes_count = greatest(0, likes_count - 1) where id = row_id;
$$ language sql;

create or replace function increment_profile_likes(profile_id uuid)
returns void as $$
  update profiles set likes = likes + 1 where id = profile_id;
$$ language sql;

create or replace function decrement_profile_likes(profile_id uuid)
returns void as $$
  update profiles set likes = greatest(0, likes - 1) where id = profile_id;
$$ language sql;

create or replace function increment_validation_helpful(row_id uuid)
returns void as $$
  update location_validations set helpful_count = helpful_count + 1 where id = row_id;
$$ language sql;

create or replace function decrement_validation_helpful(row_id uuid)
returns void as $$
  update location_validations set helpful_count = greatest(0, helpful_count - 1) where id = row_id;
$$ language sql;

-- 自动创建 profile 当用户注册时

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
-- v3: locations 加坐标
-- ============================================================
alter table locations add column if not exists latitude numeric(10,7);
alter table locations add column if not exists longitude numeric(10,7);
alter table locations drop constraint if exists locations_entry_area_check;
-- alter table locations add constraint locations_entry_area_check
--   check (entry_area in ('all_areas', 'outdoor', 'indoor', 'not_allowed', 'unknown'));

-- 自己的地点可修改（补充 RLS policy）
-- create policy if not exists "自己写" on locations for all using (auth.uid() = submitted_by);

-- ============================================================
-- 修复：category_label 字段用 key 映射覆盖旧值（咖啡店 → 咖啡等）
-- ============================================================
update locations
set category_label = (
  select case category
    when 'cafe'       then '咖啡'
    when 'park'       then '公园'
    when 'restaurant' then '餐厅'
    when 'mall'       then '商场'
    when 'scenic'     then '景点'
    when 'hotel'      then '住宿'
    when 'other'      then '其他'
  end
)
where category is not null
  and category_label is distinct from (
    select case category
      when 'cafe'       then '咖啡'
      when 'park'       then '公园'
      when 'restaurant' then '餐厅'
      when 'mall'       then '商场'
      when 'scenic'     then '景点'
      when 'hotel'      then '住宿'
      when 'other'      then '其他'
    end
  );

-- ============================================================
-- 清除旧版 tags 数据（以前混入了 entryArea/facilities/dogSize）
-- ============================================================
update locations set tags = '{}' where tags is not null and tags <> '{}';

-- ============================================================
-- Storage bucket: photos（用于所有用户上传的图片）
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 10485760, array['image/jpeg','image/png','image/webp','image/heic'])
on conflict (id) do nothing;

-- 公开可读
-- create policy if not exists "公开读"
--   on storage.objects for select
--   using (bucket_id = 'photos');

-- 认证用户可上传/更新自己的文件（路径以 auth.uid() 开头）
-- create policy if not exists "认证用户上传"
--   on storage.objects for insert
--   with check (
--     bucket_id = 'photos'
--     and auth.role() = 'authenticated'
--     and (storage.foldername(name))[1] = auth.uid()::text
--   );

-- create policy if not exists "认证用户更新"
--   on storage.objects for update
--   using (
--     bucket_id = 'photos'
--     and auth.role() = 'authenticated'
--     and (storage.foldername(name))[1] = auth.uid()::text
--   );

-- create policy if not exists "认证用户删除"
--   on storage.objects for delete
--   using (
--     bucket_id = 'photos'
--     and auth.role() = 'authenticated'
--     and (storage.foldername(name))[1] = auth.uid()::text
--   );
