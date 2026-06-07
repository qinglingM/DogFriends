import { useState, useRef, useCallback } from 'react';

export function useWalk() {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [distance, setDistance] = useState(0);
  const [trackPoints, setTrackPoints] = useState([]);
  const [photos, setPhotos] = useState([]);
  const timerRef = useRef(null);

  const startWalk = useCallback(() => {
    setIsTracking(true);
    setIsPaused(false);
    setElapsedSeconds(0);
    setDistance(0);
    setTrackPoints([]);
    setPhotos([]);
  }, []);

  const pauseWalk = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeWalk = useCallback(() => {
    setIsPaused(false);
  }, []);

  const stopWalk = useCallback(() => {
    setIsTracking(false);
    setIsPaused(false);
  }, []);

  const addTrackPoint = useCallback((point) => {
    setTrackPoints(prev => [...prev, point]);
  }, []);

  const addPhoto = useCallback((photo) => {
    setPhotos(prev => [...prev, photo]);
  }, []);

  return {
    isTracking,
    isPaused,
    elapsedSeconds,
    distance,
    trackPoints,
    photos,
    startWalk,
    pauseWalk,
    resumeWalk,
    stopWalk,
    addTrackPoint,
    addPhoto,
  };
}
