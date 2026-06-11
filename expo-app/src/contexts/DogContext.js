import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { computeIdentityBadges } from '../data/profileData';

const DogContext = createContext(null);

const DOG_SIZES = [
  { key: 'small', label: '小型犬', range: '< 10kg', icon: '🐕' },
  { key: 'medium', label: '中型犬', range: '10-25kg', icon: '🦮' },
  { key: 'large', label: '大型犬', range: '> 25kg', icon: '🐕‍🦺' },
];

const initialState = {
  dogs: [
    {
      id: 'dog_1',
      name: '旺财',
      breed: '金毛寻回犬',
      size: 'large',
      gender: 'male',
      birthday: '2023-03-15',
      weight: 32,
      neutered: true,
      traits: ['亲人', '爱玩'],
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'dog_2',
      name: '小白',
      breed: '萨摩耶',
      size: 'large',
      gender: 'female',
      birthday: '2024-06-01',
      weight: 22,
      neutered: false,
      traits: ['活泼', '亲狗'],
      image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
    },
  ],
};

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_DOG':
      return {
        ...state,
        dogs: [...state.dogs, { id: `dog_${Date.now()}`, ...action.dog }],
      };
    case 'UPDATE_DOG':
      return {
        ...state,
        dogs: state.dogs.map(d => d.id === action.dog.id ? { ...d, ...action.dog } : d),
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
  const [state, dispatch] = useReducer(reducer, initialState);

  const addDog = useCallback((dog) => dispatch({ type: 'ADD_DOG', dog }), []);
  const updateDog = useCallback((dog) => dispatch({ type: 'UPDATE_DOG', dog }), []);
  const removeDog = useCallback((dogId) => dispatch({ type: 'REMOVE_DOG', dogId }), []);

  const identityBadges = useMemo(() => computeIdentityBadges(state.dogs), [state.dogs]);

  const value = useMemo(() => ({
    dogs: state.dogs,
    addDog,
    updateDog,
    removeDog,
    identityBadges,
    DOG_SIZES,
  }), [state.dogs, addDog, updateDog, removeDog, identityBadges]);

  return <DogContext.Provider value={value}>{children}</DogContext.Provider>;
}

export function useDogs() {
  const ctx = useContext(DogContext);
  if (!ctx) throw new Error('useDogs must be used inside <DogProvider>');
  return ctx;
}