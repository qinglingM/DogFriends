import * as Location from 'expo-location';

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

export async function getCurrentAddress() {
  const { latitude, longitude } = await getCurrentLocation();
  const address = await reverseGeocode(latitude, longitude);
  
  return {
    latitude,
    longitude,
    ...address,
  };
}
