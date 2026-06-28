import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const DogContext = createContext(null);

export const DOG_SIZES = [
  { key: 'small', label: '小型犬', range: '< 10kg', icon: '🐕' },
  { key: 'medium', label: '中型犬', range: '10-25kg', icon: '🦮' },
  { key: 'large', label: '大型犬', range: '> 25kg', icon: '🐕‍🦺' },
];

function rowToDog(row) {
  return {
    id: row.id,
    name: row.name,
    breed: row.breed,
    size: row.size,
    gender: row.gender,
    birthday: row.birthday,
    weight: row.weight != null ? parseFloat(row.weight) : null,
    neutered: row.neutered,
    traits: row.traits || [],
    image: row.image,
    walkStats: {
      walks: row.walk_stats_walks || 0,
      distance: row.walk_stats_distance != null ? parseFloat(row.walk_stats_distance) : 0,
      duration: row.walk_stats_duration || 0,
    },
    publicWalkStats: row.public_walk_stats,
    publicProfile: row.public_profile,
  };
}

function dogToRow(dog, profileId) {
  return {
    profile_id: profileId,
    name: dog.name,
    breed: dog.breed,
    size: dog.size,
    gender: dog.gender,
    birthday: dog.birthday || null,
    weight: dog.weight != null ? dog.weight : null,
    neutered: dog.neutered || false,
    traits: dog.traits || [],
    image: dog.image || null,
    walk_stats_walks: dog.walkStats?.walks || 0,
    walk_stats_distance: dog.walkStats?.distance || 0,
    walk_stats_duration: dog.walkStats?.duration || 0,
    public_walk_stats: dog.publicWalkStats ?? true,
    public_profile: dog.publicProfile ?? true,
  };
}

const initialState = { dogs: [], 加载完成: false };

function reducer(state, action) {
  switch (action.type) {
    case 'SET_DOGS':
      return { ...state, dogs: action.dogs, 加载完成: true };
    case 'SET_LOADING':
      return { ...state, 加载完成: false };
    case 'ADD_DOG':
      return { ...state, dogs: [...state.dogs, action.dog] };
    case 'UPDATE_DOG':
      return {
        ...state,
        dogs: state.dogs.map(d => d.id === action.dog.id ? action.dog : d),
      };
    case 'REMOVE_DOG':
      return {
        ...state,
        dogs: state.dogs.filter(d => d.id !== action.dogId),
      };
    default:
      return state;
  }
}

export function DogProvider({ children }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('dogs')
      .select('*')
      .eq('profile_id', user.id)
      .then(({ data, error }) => {
        if (!error && data) {
          dispatch({ type: 'SET_DOGS', dogs: data.map(rowToDog) });
        }
      });
  }, [user]);

  const addDog = useCallback(async (dogInput) => {
    const row = dogToRow(dogInput, user.id);
    const { data, error } = await supabase.from('dogs').insert(row).select().single();
    if (!error && data) {
      dispatch({ type: 'ADD_DOG', dog: rowToDog(data) });
    }
    return { data, error };
  }, [user]);

  const updateDog = useCallback(async (dogInput) => {
    const row = dogToRow(dogInput, user.id);
    const { data, error } = await supabase
      .from('dogs')
      .update(row)
      .eq('id', dogInput.id)
      .select()
      .single();
    if (!error && data) {
      dispatch({ type: 'UPDATE_DOG', dog: rowToDog(data) });
    }
    return { data, error };
  }, [user]);

  const removeDog = useCallback(async (dogId) => {
    const { error } = await supabase.from('dogs').delete().eq('id', dogId);
    if (!error) {
      dispatch({ type: 'REMOVE_DOG', dogId });
    }
    return { error };
  }, []);

  const refresh = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' });
    const { data, error } = await supabase
      .from('dogs')
      .select('*')
      .eq('profile_id', user.id);
    if (!error && data) {
      dispatch({ type: 'SET_DOGS', dogs: data.map(rowToDog) });
    }
  }, [user]);

  const value = useMemo(() => ({
    dogs: state.dogs,
    加载完成: state.加载完成,
    addDog,
    updateDog,
    removeDog,
    DOG_SIZES,
    refresh,
  }), [state.dogs, state.加载完成, addDog, updateDog, removeDog, refresh]);

  return <DogContext.Provider value={value}>{children}</DogContext.Provider>;
}

export function useDogs() {
  const ctx = useContext(DogContext);
  if (!ctx) throw new Error('useDogs must be used inside <DogProvider>');
  return ctx;
}

export function getPublicDogName(dog, allDogs) {
  if (dog.publicProfile) return dog.name;
  const index = allDogs.filter(d => !d.publicProfile).indexOf(dog);
  return index <= 0 ? '小狗' : `小狗${index + 1}`;
}
