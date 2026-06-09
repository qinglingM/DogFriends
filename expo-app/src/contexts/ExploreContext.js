import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import {
  INITIAL_LOCATIONS,
  INITIAL_VALIDATIONS,
  INITIAL_CONTRIBUTIONS,
  LOCATION_STATUS,
  deriveStatusFromCounts,
} from '../data/exploreData';

const ExploreContext = createContext(null);

const initialState = {
  locations: INITIAL_LOCATIONS,
  validations: INITIAL_VALIDATIONS,
  contributions: INITIAL_CONTRIBUTIONS,
  favorites: {
    loc_bloom: true,
    loc_fuxing_park: true,
  },                              // { locationId: true }
  helpful: {},                    // { validationId: true } - 当前用户已点过有用的验证
  inaccuracyReports: {},          // { validationId: { count, reasons: [...] } }
  inaccuracyAtLocation: {},       // { locationId: count }
};

function reducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_FAVORITE': {
      const next = { ...state.favorites };
      if (next[action.id]) delete next[action.id];
      else next[action.id] = true;
      return { ...state, favorites: next };
    }

    case 'ADD_LOCATION': {
      const newLoc = action.location;
      return {
        ...state,
        locations: [newLoc, ...state.locations],
        validations: { ...state.validations, [newLoc.id]: [] },
        contributions: [
          {
            id: `c_${Date.now()}`,
            locationId: newLoc.id,
            locationName: newLoc.name,
            locationLabel: `${newLoc.categoryLabel} · ${newLoc.district}`,
            type: '新增地点',
            time: new Date().toISOString().slice(0, 10),
            status: LOCATION_STATUS.USER_SUBMITTED,
            bucket: 'created',
          },
          ...state.contributions,
        ],
      };
    }

    case 'ADD_VALIDATION': {
      const { locationId, validation } = action;
      const list = state.validations[locationId] || [];
      const newList = [validation, ...list];

      // 更新对应地点的 verifierCount / status / lastUpdated
      const newLocations = state.locations.map(loc => {
        if (loc.id !== locationId) return loc;
        const verifierCount = (loc.verifierCount || 0) + 1;
        const inaccuracyCount = state.inaccuracyAtLocation[locationId] || 0;
        const hasBlockedReport = validation.outcomeKey === 'blocked';
        const status = deriveStatusFromCounts({
          verifierCount,
          inaccuracyCount,
          hasBlockedReport,
          isJustCreated: false,
        });
        return {
          ...loc,
          verifierCount,
          status,
          lastUpdatedLabel: '刚刚更新',
        };
      });

      return {
        ...state,
        validations: { ...state.validations, [locationId]: newList },
        locations: newLocations,
        contributions: [
          {
            id: `c_${Date.now()}`,
            locationId,
            locationName: state.locations.find(l => l.id === locationId)?.name || '',
            locationLabel: state.locations.find(l => l.id === locationId)
              ? `${state.locations.find(l => l.id === locationId).categoryLabel} · ${state.locations.find(l => l.id === locationId).district}`
              : '',
            type: '更新信息',
            time: new Date().toISOString().slice(0, 10),
            status: newLocations.find(l => l.id === locationId)?.status,
            bucket: 'verified',
          },
          ...state.contributions,
        ],
      };
    }

    case 'TOGGLE_HELPFUL': {
      const id = action.validationId;
      const locId = action.locationId;
      const next = { ...state.helpful };
      const wasHelpful = !!next[id];
      if (wasHelpful) delete next[id];
      else next[id] = true;

      const list = state.validations[locId] || [];
      const newList = list.map(v =>
        v.id === id ? { ...v, helpfulCount: (v.helpfulCount || 0) + (wasHelpful ? -1 : 1) } : v
      );

      return {
        ...state,
        helpful: next,
        validations: { ...state.validations, [locId]: newList },
      };
    }

    case 'REPORT_INACCURACY': {
      const { locationId, validationId, reason } = action;
      const existing = state.inaccuracyReports[validationId] || { count: 0, reasons: [] };
      const newReports = {
        ...state.inaccuracyReports,
        [validationId]: { count: existing.count + 1, reasons: [...existing.reasons, reason] },
      };

      const locInacc = (state.inaccuracyAtLocation[locationId] || 0) + 1;
      const newInaccAtLoc = { ...state.inaccuracyAtLocation, [locationId]: locInacc };

      const newLocations = state.locations.map(loc => {
        if (loc.id !== locationId) return loc;
        const status = deriveStatusFromCounts({
          verifierCount: loc.verifierCount || 0,
          inaccuracyCount: locInacc,
          hasBlockedReport: reason === '这个地方现在不让带狗',
          isJustCreated: false,
        });
        return { ...loc, status };
      });

      return {
        ...state,
        inaccuracyReports: newReports,
        inaccuracyAtLocation: newInaccAtLoc,
        locations: newLocations,
      };
    }

    default:
      return state;
  }
}

export function ExploreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const toggleFavorite = useCallback((id) => dispatch({ type: 'TOGGLE_FAVORITE', id }), []);

  const addLocation = useCallback((location) => {
    dispatch({ type: 'ADD_LOCATION', location });
  }, []);

  const addValidation = useCallback((locationId, validation) => {
    dispatch({ type: 'ADD_VALIDATION', locationId, validation });
  }, []);

  const toggleHelpful = useCallback((locationId, validationId) => {
    dispatch({ type: 'TOGGLE_HELPFUL', locationId, validationId });
  }, []);

  const reportInaccuracy = useCallback((locationId, validationId, reason) => {
    dispatch({ type: 'REPORT_INACCURACY', locationId, validationId, reason });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      toggleFavorite,
      addLocation,
      addValidation,
      toggleHelpful,
      reportInaccuracy,
      getLocation: (id) => state.locations.find(l => l.id === id),
      getValidations: (id) => state.validations[id] || [],
    }),
    [state, toggleFavorite, addLocation, addValidation, toggleHelpful, reportInaccuracy]
  );

  return <ExploreContext.Provider value={value}>{children}</ExploreContext.Provider>;
}

export function useExplore() {
  const ctx = useContext(ExploreContext);
  if (!ctx) throw new Error('useExplore must be used inside <ExploreProvider>');
  return ctx;
}
