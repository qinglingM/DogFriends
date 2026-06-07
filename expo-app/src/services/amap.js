// 高德地图配置占位
// 后续集成 react-native-amap3d 时替换
//
// 安装: npx expo install react-native-amap3d
// 配置: 在 app.json 中添加 Android/iOS 的 Amap API Key
//
// import { MapView, Marker, Polyline } from 'react-native-amap3d';
//
// <MapView
//   style={{ flex: 1 }}
//   locationEnabled
//   showsLocation
// >
//   <Polyline
//     coordinates={trackPoints}
//     color="#B9CF32"
//     width={4}
//   />
// </MapView>

export const AMAP_CONFIG = {
  androidKey: process.env.EXPO_PUBLIC_AMAP_ANDROID_KEY || '',
  iosKey: process.env.EXPO_PUBLIC_AMAP_IOS_KEY || '',
};
