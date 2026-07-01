import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { formatArea } from '../data/cityData';

const ProfileContext = createContext(null);

function rowToProfile(row) {
  return {
    id: row.id,
    name: row.name,
    gender: row.gender,
    province: row.province,
    city: row.city,
    signature: row.signature || '',
    avatar: row.avatar,
    cover: row.cover,
    following: row.following || 0,
    followers: row.followers || 0,
    likes: row.likes || 0,
    area: formatArea(row.province, row.city),
  };
}

function withArea(profile) {
  return { ...profile, area: formatArea(profile.province, profile.city) };
}

async function generateUniqueName() {
  for (let i = 0; i < 10; i++) {
    const num = Math.floor(10000 + Math.random() * 90000);
    const name = `遛友${num}`;
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('name', name)
      .limit(1);
    if (error || (data && data.length > 0)) continue;
    return name;
  }
  return `遛友${Math.floor(10000 + Math.random() * 90000)}`;
}

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [加载完成, 设置加载完成] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setProfile(rowToProfile(data));
      } else {
        const defaultName = await generateUniqueName();
        const { data: newProfile, error: insertErr } = await supabase
          .from('profiles')
          .insert({ id: user.id, name: defaultName })
          .select('*')
          .single();
        if (!insertErr && newProfile) {
          setProfile(rowToProfile(newProfile));
        } else {
          console.error('Failed to create profile', insertErr);
        }
      }
      设置加载完成(true);
    })();
  }, [user]);

  const updateProfile = useCallback(async (updates) => {
    if (!user) return { error: null };

    const dbUpdates = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
    if (updates.province !== undefined) dbUpdates.province = updates.province;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.signature !== undefined) dbUpdates.signature = updates.signature;
    if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
    if (updates.cover !== undefined) dbUpdates.cover = updates.cover;

    const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', user.id);
    if (error) {
      console.error('updateProfile error', error);
      return { error };
    }
    setProfile(prev => {
      const next = { ...prev, ...updates };
      if (updates.province !== undefined || updates.city !== undefined) {
        return withArea(next);
      }
      return next;
    });
    return { error: null };
  }, [user]);

  const followUser = useCallback(async (targetId) => {
    if (!user || targetId === user.id) return { error: { message: '未登录或不能关注自己' } };
    const { error } = await supabase.from('follows').insert({ follower_id: user.id, following_id: targetId });
    if (error) {
      console.error('followUser insert error', error);
      return { error };
    }

    const [followingRes, followersRes] = await Promise.all([
      supabase.rpc('increment_profile_following', { profile_id: user.id }),
      supabase.rpc('increment_profile_followers', { profile_id: targetId }),
    ]);
    const countError = followingRes.error || followersRes.error;
    if (countError) {
      await supabase.from('follows').delete().match({ follower_id: user.id, following_id: targetId });
      console.error('followUser count sync error', countError);
      return { error: countError };
    }
    setProfile(prev => prev ? { ...prev, following: (prev.following || 0) + 1 } : prev);
    return {};
  }, [user]);

  const unfollowUser = useCallback(async (targetId) => {
    if (!user || targetId === user.id) return { error: { message: '未登录或不能操作自己' } };
    const { error } = await supabase.from('follows').delete().match({ follower_id: user.id, following_id: targetId });
    if (error) {
      console.error('unfollowUser delete error', error);
      return { error };
    }

    const [followingRes, followersRes] = await Promise.all([
      supabase.rpc('decrement_profile_following', { profile_id: user.id }),
      supabase.rpc('decrement_profile_followers', { profile_id: targetId }),
    ]);
    const countError = followingRes.error || followersRes.error;
    if (countError) {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: targetId });
      console.error('unfollowUser count sync error', countError);
      return { error: countError };
    }
    setProfile(prev => prev ? { ...prev, following: Math.max(0, (prev.following || 0) - 1) } : prev);
    return {};
  }, [user]);

  const fetchProfile = useCallback(async (targetId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetId)
      .single();
    if (!error && data) return rowToProfile(data);
    return null;
  }, []);

  const refresh = useCallback(async () => {
    设置加载完成(false);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (!error && data) {
      setProfile(rowToProfile(data));
    }
    设置加载完成(true);
  }, [user]);

  const value = useMemo(() => ({
    profile,
    加载完成,
    updateProfile,
    followUser,
    unfollowUser,
    fetchProfile,
    refresh,
  }), [profile, 加载完成, updateProfile, followUser, unfollowUser, fetchProfile, refresh]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside <ProfileProvider>');
  return ctx;
}
