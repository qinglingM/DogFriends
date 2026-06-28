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
        const { data: newProfile, error: insertErr } = await supabase
          .from('profiles')
          .insert({ id: user.id, name: user.email?.split('@')[0] || '' })
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
    refresh,
  }), [profile, 加载完成, updateProfile, refresh]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside <ProfileProvider>');
  return ctx;
}
