import * as Location from 'expo-location';

export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function requestLocationPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function getCurrentLocation() {
  const hasPermission = await requestLocationPermission();
  
  if (!hasPermission) {
    throw new Error('位置权限被拒绝');
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}

export async function reverseGeocode(latitude, longitude) {
  const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
  
  if (addresses.length > 0) {
    const addr = addresses[0];
    return {
      name: addr.name || addr.street || '当前位置',
      address: [addr.region, addr.subRegion, addr.street, addr.streetNumber]
        .filter(Boolean)
        .join(''),
      city: addr.region || '',
      district: addr.subRegion || '',
    };
  }
  
  return null;
}

export function formatLocation(raw) {
  if (!raw) return '';
  const city = raw.split(/[.·]/).pop();
  return city.replace(/[省市区县]$/, '');
}

export async function getCurrentAddress() {
  const { latitude, longitude } = await getCurrentLocation();
  const address = await reverseGeocode(latitude, longitude);
  
  return {
    latitude,
    longitude,
    ...address,
  };
}
