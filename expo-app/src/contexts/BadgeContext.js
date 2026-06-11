import React, { createContext, useCallback, useContext, useMemo, useReducer, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  IDENTITY_BADGES,
  BREED_BADGES,
  PROFILE_BADGES,
  ACHIEVEMENT_BADGES,
  computeIdentityBadges,
  computeBreedBadges,
  computeContribProgress,
  computeAchievProgress,
} from '../data/profileData';

const BadgeContext = createContext(null);

const STORAGE_KEY = '@dogfriends_badge_state';

function buildContributionBadges(progressMap, earnedMap) {
  return PROFILE_BADGES.map(def => {
    const progress = progressMap[def.id] ?? 0;
    const earnedInfo = earnedMap[def.id];
    const earned = !!(earnedInfo && earnedInfo.earnedAt) || progress >= def.target;
    return {
      ...def,
      progress,
      earned,
      earnedAt: earnedInfo?.earnedAt || null,
    };
  });
}

function buildAchievementBadges(progressMap, earnedMap) {
  return ACHIEVEMENT_BADGES.map(def => {
    const progress = progressMap[def.id] ?? 0;
    const earnedInfo = earnedMap[def.id];
    const earned = !!(earnedInfo && earnedInfo.earnedAt) || progress >= def.target;
    return {
      ...def,
      progress,
      earned,
      earnedAt: earnedInfo?.earnedAt || null,
    };
  });
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_EARNED':
      return { ...state, earnedMap: action.earnedMap, loaded: true };
    case 'MARK_UNLOCKED': {
      const existing = state.earnedMap[action.badgeId];
      if (existing) return state;
      const earnedMap = {
        ...state.earnedMap,
        [action.badgeId]: { earnedAt: action.earnedAt || new Date().toISOString() },
      };
      return { ...state, earnedMap, newlyUnlocked: [...state.newlyUnlocked, action.badgeId] };
    }
    case 'CLEAR_NEWLY_UNLOCKED':
      return { ...state, newlyUnlocked: [] };
    case 'DISMISS_UNLOCK':
      return { ...state, newlyUnlocked: state.newlyUnlocked.filter(id => id !== action.badgeId) };
    default:
      return state;
  }
}

const initialState = {
  earnedMap: {},
  newlyUnlocked: [],
  loaded: false,
};

export function BadgeProvider({ children, dogs, contributions, validations, locations, helpful, inaccuracyReports, walkRecords, posts }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const prevEarnedIdsRef = useRef(new Set());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(stored => {
      if (stored) {
        try {
          dispatch({ type: 'SET_EARNED', earnedMap: JSON.parse(stored) });
        } catch {
          dispatch({ type: 'SET_EARNED', earnedMap: {} });
        }
      } else {
        dispatch({ type: 'SET_EARNED', earnedMap: {} });
      }
    });
  }, []);

  useEffect(() => {
    if (state.loaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.earnedMap));
    }
  }, [state.earnedMap, state.loaded]);

  const markUnlocked = useCallback((badgeId, earnedAt) => {
    dispatch({ type: 'MARK_UNLOCKED', badgeId, earnedAt });
  }, []);

  const clearNewlyUnlocked = useCallback(() => {
    dispatch({ type: 'CLEAR_NEWLY_UNLOCKED' });
  }, []);

  const dismissUnlock = useCallback((badgeId) => {
    dispatch({ type: 'DISMISS_UNLOCK', badgeId });
  }, []);

  const identityBadges = useMemo(() => computeIdentityBadges(dogs, posts), [dogs, posts]);

  const contributionProgress = useMemo(
    () => computeContribProgress(contributions, validations, locations, helpful, inaccuracyReports),
    [contributions, validations, locations, helpful, inaccuracyReports]
  );

  const contributionBadges = useMemo(
    () => buildContributionBadges(contributionProgress, state.earnedMap),
    [contributionProgress, state.earnedMap]
  );

  const achievementProgress = useMemo(() => {
    const otherEarned = contributionBadges.filter(b => b.earned).length + identityBadges.filter(b => b.earned).length;
    return computeAchievProgress(walkRecords, posts, otherEarned);
  }, [walkRecords, posts, contributionBadges, identityBadges]);

  const achievementBadges = useMemo(
    () => buildAchievementBadges(achievementProgress, state.earnedMap),
    [achievementProgress, state.earnedMap]
  );

  const totalOtherEarned = useMemo(() => {
    return contributionBadges.filter(b => b.earned).length + achievementBadges.filter(b => b.earned).length;
  }, [contributionBadges, achievementBadges]);

  useEffect(() => {
    if (!state.loaded) return;
    const currentEarnedIds = new Set([
      ...identityBadges.filter(b => b.earned).map(b => b.id),
      ...contributionBadges.filter(b => b.earned).map(b => b.id),
      ...achievementBadges.filter(b => b.earned).map(b => b.id),
    ]);

    const newIds = [];
    for (const id of currentEarnedIds) {
      if (!prevEarnedIdsRef.current.has(id) && !state.earnedMap[id]) {
        newIds.push(id);
      }
    }
    prevEarnedIdsRef.current = currentEarnedIds;

    for (const id of newIds) {
      dispatch({ type: 'MARK_UNLOCKED', badgeId: id });
    }
  }, [state.loaded, identityBadges, contributionBadges, achievementBadges, state.earnedMap]);

  const allBadges = useMemo(
    () => [...identityBadges, ...contributionBadges, ...achievementBadges],
    [identityBadges, contributionBadges, achievementBadges]
  );

  const earnedBadges = useMemo(
    () => allBadges.filter(b => b.earned),
    [allBadges]
  );

  const earnedCount = earnedBadges.length;
  const totalCount = IDENTITY_BADGES.length + BREED_BADGES.length + PROFILE_BADGES.length + ACHIEVEMENT_BADGES.length;

  const unlockedNotifications = useMemo(() => {
    return state.newlyUnlocked
      .map(id => allBadges.find(b => b.id === id))
      .filter(Boolean);
  }, [state.newlyUnlocked, allBadges]);

  const value = useMemo(() => ({
    identityBadges,
    contributionBadges,
    achievementBadges,
    allBadges,
    earnedBadges,
    earnedCount,
    totalCount,
    unlockedNotifications,
    markUnlocked,
    clearNewlyUnlocked,
    dismissUnlock,
  }), [identityBadges, contributionBadges, achievementBadges, allBadges, earnedBadges, earnedCount, totalCount, unlockedNotifications, markUnlocked, clearNewlyUnlocked, dismissUnlock]);

  return <BadgeContext.Provider value={value}>{children}</BadgeContext.Provider>;
}

export function useBadges() {
  const ctx = useContext(BadgeContext);
  if (!ctx) throw new Error('useBadges must be used inside <BadgeProvider>');
  return ctx;
}