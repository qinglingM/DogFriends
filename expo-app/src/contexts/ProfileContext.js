import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { formatArea } from '../data/cityData';

const ProfileContext = createContext(null);

const INITIAL_PROFILE = {
  name: '小明',
  gender: 'male',
  province: '上海',
  city: '上海',
  signature: '每天和旺财、小白一起散步，记录生活的小确幸。',
  avatar: 'https://images.unsplash.com/photo-1601758177266-bc599de87707?auto=format&fit=crop&w=300&q=80',
  cover: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80',
  following: 32,
  followers: 128,
  likes: 890,
};

// 向后兼容：自动生成 area 显示字符串
function withArea(profile) {
  return { ...profile, area: formatArea(profile.province, profile.city) };
}

export function ProfileProvider({ children, initialProvince, initialCity }) {
  const [profile, setProfile] = useState(() => {
    const base = { ...INITIAL_PROFILE };
    if (initialProvince) base.province = initialProvince;
    if (initialCity) base.city = initialCity;
    return withArea(base);
  });

  const updateProfile = useCallback((updates) => {
    setProfile(prev => {
      const next = { ...prev, ...updates };
      // 如果更新了 province 或 city，重新计算 area
      if (updates.province !== undefined || updates.city !== undefined) {
        return withArea(next);
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ profile, updateProfile }), [profile, updateProfile]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside <ProfileProvider>');
  return ctx;
}
