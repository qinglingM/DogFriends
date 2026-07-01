import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const ENDPOINT_MIN_DISTANCE_KM = 0.01;

function haversineDistanceKm(a, b) {
  if (!a || !b) return 0;
  const R = 6371;
  const dLat = (b.latitude - a.latitude) * Math.PI / 180;
  const dLon = (b.longitude - a.longitude) * Math.PI / 180;
  const lat1 = a.latitude * Math.PI / 180;
  const lat2 = b.latitude * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function normalizePoints(points = []) {
  return points
    .filter((point) => point && Number.isFinite(point.latitude) && Number.isFinite(point.longitude))
    .map((point) => ({
      latitude: Number(point.latitude),
      longitude: Number(point.longitude),
    }));
}

function buildRegion(points, currentPoint, zoomDelta = 0.01) {
  const normalized = normalizePoints(points);
  if (normalized.length > 0) {
    const last = normalized[normalized.length - 1];
    return {
      latitude: last.latitude,
      longitude: last.longitude,
      latitudeDelta: zoomDelta,
      longitudeDelta: zoomDelta,
    };
  }

  if (currentPoint && Number.isFinite(currentPoint.latitude) && Number.isFinite(currentPoint.longitude)) {
    return {
      latitude: Number(currentPoint.latitude),
      longitude: Number(currentPoint.longitude),
      latitudeDelta: zoomDelta,
      longitudeDelta: zoomDelta,
    };
  }

  return null;
}

export default function WalkMap({
  points = [],
  currentPoint = null,
  interactive = true,
  showsUserLocation = false,
  onUserLocationChange,
  style,
  recenterKey = 0,
  recenterMode = 'route',
  autoFitRoute = true,
  showEmptyOverlay = true,
  emptyLabel = '正在等待定位轨迹',
  zoomDelta = 0.01,
}) {
  const mapRef = useRef(null);
  const normalizedPoints = useMemo(() => normalizePoints(points), [points]);
  const startPoint = normalizedPoints[0] || null;
  const endPoint = normalizedPoints[normalizedPoints.length - 1] || null;
  const showEndPoint = startPoint && endPoint && normalizedPoints.length > 1 && haversineDistanceKm(startPoint, endPoint) >= ENDPOINT_MIN_DISTANCE_KM;
  const initialRegion = useMemo(() => buildRegion(normalizedPoints, currentPoint, zoomDelta), [normalizedPoints, currentPoint, zoomDelta]);

  useEffect(() => {
    if (!autoFitRoute || !mapRef.current || normalizedPoints.length < 2) return;
    mapRef.current.fitToCoordinates(normalizedPoints, {
      edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
      animated: false,
    });
  }, [autoFitRoute, normalizedPoints.length]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (recenterMode !== 'current' || !currentPoint || !Number.isFinite(currentPoint.latitude)) return;
    mapRef.current.animateToRegion(buildRegion([], currentPoint, zoomDelta), 400);
  }, [recenterKey]);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webFallback, style]}>
        <Text style={styles.emptyText}>{emptyLabel}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion ?? undefined}
        showsUserLocation={showsUserLocation}
        onUserLocationChange={onUserLocationChange}
        showsMyLocationButton={false}
        rotateEnabled={interactive}
        pitchEnabled={interactive}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
      >
        {startPoint && (
          <Marker coordinate={startPoint} anchor={{ x: 0.5, y: 1 }} tracksViewChanges={false}>
            <View style={styles.teardropContainer}>
              <View style={[styles.teardropCircle, styles.startMarker]}>
                <Text style={styles.endpointMarkerText}>起</Text>
              </View>
              <View style={[styles.teardropTail, styles.startTail]} />
            </View>
          </Marker>
        )}
        {showEndPoint && (
          <Marker coordinate={endPoint} anchor={{ x: 0.5, y: 1 }} tracksViewChanges={false}>
            <View style={styles.teardropContainer}>
              <View style={[styles.teardropCircle, styles.endMarker]}>
                <Text style={styles.endpointMarkerText}>终</Text>
              </View>
              <View style={[styles.teardropTail, styles.endTail]} />
            </View>
          </Marker>
        )}
        {normalizedPoints.length > 1 && (
          <Polyline
            coordinates={normalizedPoints}
            strokeColor={colors.secondary}
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </MapView>
      {showEmptyOverlay && normalizedPoints.length === 0 && !currentPoint && (
        <View style={styles.emptyOverlay} pointerEvents="none">
          <Text style={styles.emptyText}>{emptyLabel}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#E8EDE4',
  },
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232,237,228,0.72)',
  },
  emptyText: {
    ...typography.bodyBold,
    color: colors.textLight,
  },
  webFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8EDE4',
  },
  teardropContainer: {
    alignItems: 'center',
  },
  teardropCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 6,
  },
  teardropTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  startMarker: {
    backgroundColor: colors.secondary,
    borderColor: colors.white,
  },
  endMarker: {
    backgroundColor: colors.danger,
    borderColor: colors.white,
  },
  startTail: {
    borderTopColor: colors.secondary,
  },
  endTail: {
    borderTopColor: colors.danger,
  },
  endpointMarkerText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
});
