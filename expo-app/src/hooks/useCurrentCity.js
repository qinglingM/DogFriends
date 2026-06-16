import { useState, useEffect, useCallback } from 'react';
import { requestLocationPermission, getCurrentAddress } from '../utils/location';
import { findProvinceByCity } from '../data/cityData';

/**
 * 获取用户当前定位城市
 * 返回 { city, province, loading, refresh }
 */
export function useCurrentCity() {
  const [city, setCity] = useState(null);
  const [province, setProvince] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCity = useCallback(async () => {
    try {
      setLoading(true);
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setCity(null);
        setProvince(null);
        return;
      }

      const address = await getCurrentAddress();
      if (address?.city) {
        // address.city 在 iOS 上可能是省份（如"上海市"），需要处理
        let cityName = address.city.replace(/省$|市$|自治区$|特别行政区$|壮族自治区$|回族自治区$|维吾尔自治区$/, '');

        const matchedProvince = findProvinceByCity(cityName);
        if (matchedProvince) {
          // cityName 匹配到了一个城市
          setCity(cityName);
          setProvince(matchedProvince);
        } else {
          // cityName 可能是省份名（如"上海"、"广东"），尝试用它找省内第一个城市
          setProvince(cityName);
          setCity(cityName);
        }
      }
    } catch (e) {
      setCity(null);
      setProvince(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCity();
  }, [fetchCity]);

  return { city, province, loading, refresh: fetchCity };
}
