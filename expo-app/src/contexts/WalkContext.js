import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const WalkContext = createContext(null);

function rowToRecord(row) {
  return {
    id: row.id,
    dogs: row.dog_ids || [],
    startTime: row.start_time,
    endTime: row.end_time,
    distance: row.distance || 0,
    duration: row.duration || 0,
    pace: row.pace || 0,
    trackPoints: row.track_points || [],
    photos: row.photos || [],
    checkins: row.checkins || null,
    date: row.start_time
      ? new Date(row.start_time).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
      : '',
    dateLabel: row.start_time
      ? new Date(row.start_time).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', weekday: 'short' })
      : '',
  };
}

const initialState = {
  records: [],
  currentWalk: null,
  加载完成: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_RECORDS':
      return { ...state, records: action.records, 加载完成: true };
    case 'SET_LOADING':
      return { ...state, 加载完成: false };

    case 'START_WALK':
      return {
        ...state,
        currentWalk: {
          id: `walk_${Date.now()}`,
          dogs: action.dogs,
          startTime: new Date().toISOString(),
          distance: 0,
          duration: 0,
          pace: 0,
          trackPoints: [],
          photos: [],
          checkins: null,
        },
      };

    case 'UPDATE_WALK':
      return {
        ...state,
        currentWalk: state.currentWalk
          ? { ...state.currentWalk, ...action.updates }
          : null,
      };

    case 'SAVE_CHECKIN':
      return {
        ...state,
        currentWalk: state.currentWalk
          ? {
              ...state.currentWalk,
              checkins: {
                ...(state.currentWalk.checkins || {}),
                [action.dogId]: action.checkin,
              },
            }
          : null,
      };

    case 'FINISH_WALK': {
      if (!state.currentWalk) return state;
      const record = {
        ...state.currentWalk,
        checkins: action.checkinsOverride || state.currentWalk.checkins || {},
        endTime: new Date().toISOString(),
        date: new Date().toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
        dateLabel: new Date().toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', weekday: 'short' }),
      };
      return {
        ...state,
        records: [record, ...state.records],
        currentWalk: null,
      };
    }

    case 'ADD_PHOTO':
      if (!state.currentWalk) return state;
      return {
        ...state,
        currentWalk: {
          ...state.currentWalk,
          photos: [...state.currentWalk.photos, action.photo],
        },
      };

    default:
      return state;
  }
}

export function WalkProvider({ children }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('walk_records')
      .select('*')
      .eq('profile_id', user.id)
      .order('start_time', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          dispatch({ type: 'SET_RECORDS', records: data.map(rowToRecord) });
        } else if (error) {
          console.error('[WalkContext] initial load error', error);
        }
      });
  }, [user]);

  const startWalk = useCallback((dogs) => dispatch({ type: 'START_WALK', dogs }), []);

  const updateWalk = useCallback((updates) => dispatch({ type: 'UPDATE_WALK', updates }), []);

  const saveCheckin = useCallback((dogId, checkin) => dispatch({ type: 'SAVE_CHECKIN', dogId, checkin }), []);

  const finishWalk = useCallback(async (checkinsOverride) => {
    const current = state.currentWalk;
    if (!current) return;

    const finalCheckins = checkinsOverride || current.checkins || {};

    dispatch({ type: 'FINISH_WALK', checkinsOverride: finalCheckins });

    const photoUris = (current.photos || []).map(p => typeof p === 'string' ? p : p.uri);

    const { error } = await supabase.from('walk_records').insert({
      profile_id: user.id,
      dog_ids: (current.dogs || []).map(d => typeof d === 'string' ? d : d.id),
      start_time: current.startTime,
      end_time: new Date().toISOString(),
      distance: current.distance || 0,
      duration: current.duration || 0,
      pace: current.pace || null,
      track_points: current.trackPoints || null,
      photos: photoUris,
      checkins: finalCheckins,
    });
    if (error) {
      console.error('[WalkContext] finishWalk insert failed', error);
    }
  }, [state.currentWalk, user]);

  const addPhoto = useCallback((photo) => dispatch({ type: 'ADD_PHOTO', photo }), []);

  const refresh = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' });
    const { data, error } = await supabase
      .from('walk_records')
      .select('*')
      .eq('profile_id', user.id)
      .order('start_time', { ascending: false });
    if (!error && data) {
      dispatch({ type: 'SET_RECORDS', records: data.map(rowToRecord) });
    } else if (error) {
      console.error('[WalkContext] refresh error', error);
    }
  }, [user]);

  const value = useMemo(() => ({
    records: state.records,
    currentWalk: state.currentWalk,
    加载完成: state.加载完成,
    startWalk,
    updateWalk,
    saveCheckin,
    finishWalk,
    addPhoto,
    refresh,
    getRecords: () => state.records,
    getRecentRecords: (n = 10) => state.records.slice(0, n),
    getTotalStats: () => ({
      count: state.records.length,
      distance: state.records.reduce((sum, r) => sum + (r.distance || 0), 0),
      duration: state.records.reduce((sum, r) => sum + (r.duration || 0), 0),
    }),
    getWeekStats: () => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const weekRecords = state.records.filter(r => new Date(r.startTime) >= weekAgo);
      return {
        count: weekRecords.length,
        distance: weekRecords.reduce((sum, r) => sum + (r.distance || 0), 0),
        duration: weekRecords.reduce((sum, r) => sum + (r.duration || 0), 0),
      };
    },
  }), [state, startWalk, updateWalk, saveCheckin, finishWalk, addPhoto, refresh]);

  return <WalkContext.Provider value={value}>{children}</WalkContext.Provider>;
}

export function useWalk() {
  const ctx = useContext(WalkContext);
  if (!ctx) throw new Error('useWalk must be used inside <WalkProvider>');
  return ctx;
}
