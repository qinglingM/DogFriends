import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';

const WalkContext = createContext(null);

const initialState = {
  records: [],
  currentWalk: null,
};

function reducer(state, action) {
  switch (action.type) {
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
          checkin: null,
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
          ? { ...state.currentWalk, checkin: action.checkin }
          : null,
      };

    case 'FINISH_WALK': {
      if (!state.currentWalk) return state;
      const record = {
        ...state.currentWalk,
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
  const [state, dispatch] = useReducer(reducer, initialState);

  const startWalk = useCallback((dogs) => dispatch({ type: 'START_WALK', dogs }), []);
  const updateWalk = useCallback((updates) => dispatch({ type: 'UPDATE_WALK', updates }), []);
  const saveCheckin = useCallback((checkin) => dispatch({ type: 'SAVE_CHECKIN', checkin }), []);
  const finishWalk = useCallback(() => dispatch({ type: 'FINISH_WALK' }), []);
  const addPhoto = useCallback((photo) => dispatch({ type: 'ADD_PHOTO', photo }), []);

  const value = useMemo(() => ({
    ...state,
    startWalk,
    updateWalk,
    saveCheckin,
    finishWalk,
    addPhoto,
    getRecords: () => state.records,
    getRecentRecords: (n = 10) => state.records.slice(0, n),
    getTotalStats: () => ({
      count: state.records.length,
      distance: state.records.reduce((sum, r) => sum + (r.distance || 0), 0),
      duration: state.records.reduce((sum, r) => sum + (r.duration || 0), 0),
    }),
    getWeekStats: () => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weekRecords = state.records.filter(r => new Date(r.startTime) >= weekAgo);
      return {
        count: weekRecords.length,
        distance: weekRecords.reduce((sum, r) => sum + (r.distance || 0), 0),
        duration: weekRecords.reduce((sum, r) => sum + (r.duration || 0), 0),
      };
    },
  }), [state, startWalk, updateWalk, saveCheckin, finishWalk, addPhoto]);

  return <WalkContext.Provider value={value}>{children}</WalkContext.Provider>;
}

export function useWalk() {
  const ctx = useContext(WalkContext);
  if (!ctx) throw new Error('useWalk must be used inside <WalkProvider>');
  return ctx;
}
