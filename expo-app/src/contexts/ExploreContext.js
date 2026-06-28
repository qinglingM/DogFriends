import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { LOCATION_STATUS, deriveStatusFromCounts } from '../data/exploreData';

const ExploreContext = createContext(null);

const CATEGORY_LABEL_MAP = {
  cafe: '咖啡',
  park: '公园',
  restaurant: '餐厅',
  mall: '商场',
  scenic: '景点',
  hotel: '住宿',
  other: '其他',
};

function categoryLabelFromKey(key) {
  return CATEGORY_LABEL_MAP[key] || '其他';
}

function rowToLocation(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    categoryLabel: categoryLabelFromKey(row.category) || row.category_label || '其他',
    city: row.city,
    distanceKm: row.distance_km,
    latitude: row.latitude,
    longitude: row.longitude,
    phone: row.phone || '',
    hours: row.hours || '',
    entryArea: row.entry_area || 'unknown',
    dogSize: row.dog_size || [],
    behaviors: row.behaviors || [],
    facilities: row.facilities || [],
    tags: row.tags || [],
    status: row.status,
    verifierCount: row.verifier_count || 0,
    lastUpdatedLabel: row.last_updated_label || '',
    thumbnailUrl: row.thumbnail_url,
    photos: row.photos || [],
    description: row.description || '',
    submittedBy: row.submitted_by,
  };
}

const OLD_OUTCOME_TO_NEW_LABEL = {
  success: '全程顺利',
  outdoor_only: '仅限户外',
  large_no: '体型受限',
  blocked: '拒绝进入',
};

function rowToValidation(row) {
  return {
    id: row.id,
    profileId: row.profile_id,
    userName: row._userName || '未知用户',
    userAvatar: (row._userName || '?').slice(0, 1),
    time: row.created_at,
    outcomeKey: row.outcome_key,
    outcomeLabel: OLD_OUTCOME_TO_NEW_LABEL[row.outcome_key] || row.outcome_label,
    dogSize: row.dog_size || '',
    tags: row.tags || [],
    note: row.note || '',
    photos: row.photos || [],
    helpfulCount: row.helpful_count || 0,
  };
}

const NEW_TO_DB_OUTCOME_KEY = {
  success: 'success',
  outdoor_only: 'outdoor_only',
  area_restricted: 'indoor_ok',
  large_no: 'large_no',
  blocked: 'blocked',
  closed: 'blocked',
  address_wrong: 'blocked',
  other: 'blocked',
};

function rowToContribution(row) {
  return {
    id: row.id,
    locationId: row.location_id,
    locationName: row.location_name || '',
    locationLabel: row.location_label || '',
    type: row.type,
    time: row.created_at || '',
    status: row.status,
    bucket: row.type === '新增地点' ? 'created' : 'verified',
  };
}

// ---------- 时间窗口计数 ----------

const D7 = 7 * 24 * 60 * 60 * 1000;
const D90 = 90 * 24 * 60 * 60 * 1000;

function calcWindowCounts(validations, locationId, inaccuracyRows) {
  const now = Date.now();
  let v7d = 0, v90d = 0, vTotal = 0;
  (validations[locationId] || []).forEach(v => {
    vTotal++;
    const t = v.time ? new Date(v.time).getTime() : 0;
    if (now - t <= D7) v7d++;
    if (now - t <= D90) v90d++;
  });

  let inaccuracyCountTotal = 0;
  let hasBlockedReport = false;
  (inaccuracyRows || []).forEach(r => {
    if (r.location_id === locationId) {
      inaccuracyCountTotal++;
      if (r.reason === '这个地方现在不让带狗') hasBlockedReport = true;
    }
  });

  return { verifierCount7d: v7d, verifierCount90d: v90d, verifierCountTotal: vTotal, inaccuracyCountTotal, hasBlockedReport90d: hasBlockedReport };
}

  const initialState = {
    locations: [],
    validations: {},
    contributions: [],
    favorites: {},
    helpful: {},
    inaccuracyReports: {},
    inaccuracyAtLocation: {},
    加载完成: false,
  };

  function reducer(state, action) {
    switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload, 加载完成: true };
    case 'SET_LOADING':
      return { ...state, 加载完成: false };

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
        contributions: [
          {
            id: `contrib_${Date.now()}`,
            locationId: newLoc.id,
            locationName: newLoc.name,
            locationLabel: newLoc.categoryLabel,
            type: '新增地点',
            time: new Date().toISOString().slice(0, 10),
            status: LOCATION_STATUS.USER_SUBMITTED,
            bucket: 'created',
          },
          ...state.contributions,
        ],
      };
    }

    case 'UPDATE_LOCATION_STATUS': {
      const { locationId, status, verifierCount, lastUpdatedLabel } = action;
      return {
        ...state,
        locations: state.locations.map(loc =>
          loc.id === locationId ? { ...loc, status, verifierCount, lastUpdatedLabel } : loc
        ),
      };
    }

    case 'UPDATE_LOCATION': {
      const updated = action.location;
      return {
        ...state,
        locations: state.locations.map(loc =>
          loc.id === updated.id ? updated : loc
        ),
      };
    }

    case 'ADD_CONTRIBUTION':
      return { ...state, contributions: [action.contribution, ...state.contributions] };

    case 'ADD_VALIDATION': {
      const { locationId, validation } = action;
      const list = [...(state.validations[locationId] || []), validation];
      return { ...state, validations: { ...state.validations, [locationId]: list } };
    }

    case 'TOGGLE_HELPFUL': {
      const { locationId, validationId } = action;
      const nextHelpful = { ...state.helpful };
      const wasHelpful = !!nextHelpful[validationId];
      if (wasHelpful) delete nextHelpful[validationId];
      else nextHelpful[validationId] = true;

      const list = (state.validations[locationId] || []).map(v =>
        v.id === validationId
          ? { ...v, helpfulCount: (v.helpfulCount || 0) + (wasHelpful ? -1 : 1) }
          : v
      );

      return {
        ...state,
        helpful: nextHelpful,
        validations: { ...state.validations, [locationId]: list },
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
        inaccuracyAtLocation: { ...state.inaccuracyAtLocation, [locationId]: locInacc },
        locations: newLocations,
      };
    }

    default:
      return state;
  }
}

export function ExploreProvider({ children }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!user) return;
    loadAll();
  }, [user]);

  async function loadAll() {
    const [locRes, valRes, contRes, favRes, helpfulRes, inaccRes] = await Promise.all([
      supabase.from('locations').select('*'),
      supabase.from('location_validations').select('*'),
      supabase.from('contributions').select('*').eq('profile_id', user.id).order('created_at', { ascending: false }),
      supabase.from('location_favorites').select('location_id').eq('profile_id', user.id),
      supabase.from('validation_helpful').select('validation_id').eq('profile_id', user.id),
      supabase.from('inaccuracy_reports').select('*'),
    ]);

    if (locRes.error) console.error('loadAll locations error', locRes.error);
    if (valRes.error) console.error('loadAll validations error', valRes.error);
    if (contRes.error) console.error('loadAll contributions error', contRes.error);
    if (favRes.error) console.error('loadAll favorites error', favRes.error);
    if (helpfulRes.error) console.error('loadAll helpful error', helpfulRes.error);
    if (inaccRes.error) console.error('loadAll inaccuracy_reports error', inaccRes.error);

    const locations = (locRes.data || []).map(rowToLocation);

    // Look up profile names for validations
    const valRows = valRes.data || [];
    const validationProfileIds = [...new Set(valRows.map(v => v.profile_id).filter(Boolean))];
    const valNameMap = {};
    if (validationProfileIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, name').in('id', validationProfileIds);
      if (profiles) profiles.forEach(p => { valNameMap[p.id] = p.name; });
    }
    valRows.forEach(v => { v._userName = valNameMap[v.profile_id] || '未知用户'; });

    const validations = {};
    valRows.forEach(v => {
      const locId = v.location_id;
      if (!validations[locId]) validations[locId] = [];
      validations[locId].push(rowToValidation(v));
    });

    const contributions = (contRes.data || []).map(c => ({
      ...rowToContribution(c),
      locationName: locations.find(l => l.id === c.location_id)?.name || c.location_name || '',
      locationLabel: locations.find(l => l.id === c.location_id)?.categoryLabel || c.location_label || '',
    }));

    const favorites = {};
    (favRes.data || []).forEach(f => { favorites[f.location_id] = true; });

    const helpful = {};
    (helpfulRes.data || []).forEach(h => { helpful[h.validation_id] = true; });

    const inaccuracyReports = {};
    const inaccuracyAtLocation = {};
    (inaccRes.data || []).forEach(r => {
      const vId = r.validation_id;
      if (!inaccuracyReports[vId]) inaccuracyReports[vId] = { count: 0, reasons: [] };
      inaccuracyReports[vId].count += 1;
      inaccuracyReports[vId].reasons.push(r.reason);

      inaccuracyAtLocation[r.location_id] = (inaccuracyAtLocation[r.location_id] || 0) + 1;
    });

    // Recompute statuses
    const updatedLocations = locations.map(loc => {
      const counts = calcWindowCounts(validations, loc.id, inaccRes.data || []);
      const status = deriveStatusFromCounts(counts);
      return { ...loc, status, ...counts };
    });

    dispatch({
      type: 'SET_STATE',
      payload: {
        locations: updatedLocations,
        validations,
        contributions,
        favorites,
        helpful,
        inaccuracyReports,
        inaccuracyAtLocation,
      },
    });
  }

  const toggleFavorite = useCallback(async (id) => {
    const wasFav = !!state.favorites[id];
    dispatch({ type: 'TOGGLE_FAVORITE', id });

    const location = state.locations.find(l => l.id === id);
    const submittedBy = location?.submittedBy;

    if (wasFav) {
      await supabase.from('location_favorites').delete().match({ location_id: id, profile_id: user.id });
      if (submittedBy) {
        await supabase.rpc('decrement_profile_likes', { profile_id: submittedBy });
      }
    } else {
      await supabase.from('location_favorites').insert({ location_id: id, profile_id: user.id });
      if (submittedBy) {
        await supabase.rpc('increment_profile_likes', { profile_id: submittedBy });
      }
    }
  }, [state.favorites, state.locations, user]);

  const addLocation = useCallback(async (location) => {
    const DB_ENTRY_AREA = { all_areas: 'all_areas', outdoor: 'outdoor', indoor: 'indoor', not_allowed: 'not_allowed', partial: 'unknown', unknown: 'unknown' };
    const validCategories = ['cafe', 'park', 'restaurant', 'mall', 'scenic', 'hotel', 'other'];
    const safeEntryArea = DB_ENTRY_AREA[location.entryArea?.toLowerCase()] || 'unknown';
    const safeCategory = validCategories.includes(location.category?.toLowerCase()) ? location.category.toLowerCase() : 'other';
    const safeCity = typeof location.city === 'string' ? location.city : '上海';
    console.log('[addLocation] safeEntryArea:', safeEntryArea, 'safeCategory:', safeCategory, 'safeCity:', safeCity);
    const row = {
      name: location.name,
      category: safeCategory,
      category_label: location.categoryLabel || '其他',
      city: safeCity,
      distance_km: location.distanceKm || null,
      phone: location.phone || '',
      hours: location.hours || '',
      entry_area: safeEntryArea,
      dog_size: location.dogSize || [],
      behaviors: location.behaviors || [],
      facilities: location.facilities || [],
      tags: location.tags || [],
      status: LOCATION_STATUS.USER_SUBMITTED,
      thumbnail_url: location.thumbnailUrl || null,
      photos: location.photos || [],
      description: location.description || '',
      submitted_by: user.id,
    };

    console.log('[addLocation] insert row:', JSON.stringify(row));

    if (__DEV__) {
      Alert.alert('插前行', JSON.stringify({ entry_area: safeEntryArea, category: safeCategory, city: safeCity }));
    }

    let data, error;
    try {
      const res = await supabase.from('locations').insert(row).select().single();
      data = res.data;
      error = res.error;
    } catch (e) {
      console.error('[addLocation] uncaught error', e);
      return { data: null, error: { message: e.message || String(e), code: null, details: null, hint: null } };
    }
    if (!error && data) {
      const newLoc = rowToLocation(data);
      dispatch({ type: 'ADD_LOCATION', location: newLoc });

      const contribRow = {
        profile_id: user.id,
        location_id: data.id,
        type: '新增地点',
        status: LOCATION_STATUS.USER_SUBMITTED,
      };
      console.warn('[addLocation] contributions insert:', JSON.stringify(contribRow));
      await supabase.from('contributions').insert(contribRow);
    }
    return { data, error };
  }, [user]);

  const updateLocation = useCallback(async (location) => {
    const DB_ENTRY_AREA = { all_areas: 'all_areas', outdoor: 'outdoor', indoor: 'indoor', not_allowed: 'not_allowed', partial: 'unknown', unknown: 'unknown' };
    const validCategories = ['cafe', 'park', 'restaurant', 'mall', 'scenic', 'hotel', 'other'];
    const safeEntryArea = DB_ENTRY_AREA[location.entryArea?.toLowerCase()] || 'unknown';
    const safeCategory = validCategories.includes(location.category?.toLowerCase()) ? location.category.toLowerCase() : 'other';
    const safeCity = typeof location.city === 'string' ? location.city : '上海';
    const row = {
      name: location.name,
      category: safeCategory,
      category_label: location.categoryLabel || '其他',
      city: safeCity,
      distance_km: location.distanceKm || null,
      phone: location.phone || '',
      hours: location.hours || '',
      entry_area: safeEntryArea,
      dog_size: location.dogSize || [],
      behaviors: location.behaviors || [],
      facilities: location.facilities || [],
      tags: location.tags || [],
      thumbnail_url: location.thumbnailUrl || null,
      photos: location.photos || [],
      description: location.description || '',
    };
    console.warn('[updateLocation] row:', JSON.stringify(row));

    const { data, error } = await supabase.from('locations').update(row).eq('id', location.id).select().single();
    if (!error && data) {
      const updated = rowToLocation(data);
      dispatch({ type: 'UPDATE_LOCATION', location: updated });
    }
    return { data, error };
  }, []);

  const addValidation = useCallback(async (locationId, validation) => {
    const row = {
      location_id: locationId,
      profile_id: user.id,
      outcome_key: NEW_TO_DB_OUTCOME_KEY[validation.outcomeKey] || 'blocked',
      outcome_label: validation.outcomeLabel,
      dog_size: Array.isArray(validation.dogSize) ? validation.dogSize : [],
      tags: validation.tags || [],
      note: validation.note || '',
      photos: validation.photos || [],
    };
    console.warn('[addValidation] row:', JSON.stringify(row));

    const { data, error } = await supabase.from('location_validations').insert(row).select().single();
    if (!error && data) {
      const { data: profile } = await supabase.from('profiles').select('name').eq('id', data.profile_id).single();
      data._userName = profile?.name || '未知用户';
      const vRow = rowToValidation(data);
      dispatch({ type: 'ADD_VALIDATION', locationId, validation: vRow });

      // 重新计算时间窗口计数
      const updatedValidations = {
        ...state.validations,
        [locationId]: [...(state.validations[locationId] || []), vRow],
      };
      const counts = calcWindowCounts(updatedValidations, locationId, []);
      const inaccuracyRows = Object.values(state.inaccuracyReports).flatMap(r => r.reasons.length > 0 ? [{ location_id: locationId }] : []);
      const status = deriveStatusFromCounts(counts);
      const newVerifierCount = counts.verifierCountTotal;

      await supabase.from('locations').update({
        verifier_count: newVerifierCount,
        status,
        last_updated_label: '刚刚更新',
      }).eq('id', locationId);

      dispatch({
        type: 'UPDATE_LOCATION_STATUS',
        locationId,
        status,
        verifierCount: newVerifierCount,
        lastUpdatedLabel: '刚刚更新',
      });

      const contribRow = {
        profile_id: user.id,
        location_id: locationId,
        type: '更新信息',
        status,
      };
      console.warn('[addValidation] contributions insert:', JSON.stringify(contribRow));
      await supabase.from('contributions').insert(contribRow);

      const loc = state.locations.find(l => l.id === locationId);
      dispatch({
        type: 'ADD_CONTRIBUTION',
        contribution: {
          id: `contrib_${Date.now()}`,
          locationId,
          locationName: loc?.name || '',
          locationLabel: loc?.categoryLabel || '',
          type: '更新信息',
          time: new Date().toISOString(),
          status,
          bucket: 'verified',
        },
      });
    }
    return { data, error };
  }, [state.locations, state.inaccuracyAtLocation, user]);

  const toggleHelpful = useCallback(async (locationId, validationId) => {
    const wasHelpful = !!state.helpful[validationId];
    dispatch({ type: 'TOGGLE_HELPFUL', locationId, validationId });

    if (wasHelpful) {
      await supabase.from('validation_helpful').delete().match({ validation_id: validationId, profile_id: user.id });
      await supabase.rpc('decrement_validation_helpful', { row_id: validationId });
    } else {
      await supabase.from('validation_helpful').insert({ validation_id: validationId, profile_id: user.id });
      await supabase.rpc('increment_validation_helpful', { row_id: validationId });
    }
  }, [state.helpful, user]);

  const reportInaccuracy = useCallback(async (locationId, validationId, reason) => {
    const { error } = await supabase.from('inaccuracy_reports').insert({
      validation_id: validationId || null,
      location_id: locationId,
      profile_id: user.id,
      reason,
    });

    if (!error) {
      dispatch({ type: 'REPORT_INACCURACY', locationId, validationId, reason });
    } else {
      console.error('reportInaccuracy error', error);
    }
    return { error };
  }, [user]);

  const getLocation = useCallback((id) => state.locations.find(l => l.id === id), [state.locations]);
  const getValidations = useCallback((id) => state.validations[id] || [], [state.validations]);

  const refresh = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' });
    await loadAll();
  }, [user]);

  const value = useMemo(
    () => ({
      locations: state.locations,
      validations: state.validations,
      contributions: state.contributions,
      favorites: state.favorites,
      helpful: state.helpful,
      inaccuracyReports: state.inaccuracyReports,
      inaccuracyAtLocation: state.inaccuracyAtLocation,
      加载完成: state.加载完成,
      toggleFavorite,
      addLocation,
      updateLocation,
      addValidation,
      toggleHelpful,
      reportInaccuracy,
      getLocation,
      getValidations,
      refresh,
    }),
    [state, toggleFavorite, addLocation, updateLocation, addValidation, toggleHelpful, reportInaccuracy, getLocation, getValidations, refresh]
  );

  return <ExploreContext.Provider value={value}>{children}</ExploreContext.Provider>;
}

export function useExplore() {
  const ctx = useContext(ExploreContext);
  if (!ctx) throw new Error('useExplore must be used inside <ExploreProvider>');
  return ctx;
}
