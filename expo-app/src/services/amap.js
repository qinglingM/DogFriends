// 高德地图配置
// 集成 react-native-amap3d 实现真实地图
//
// 安装: npx expo install react-native-amap3d
// 配置: 已在 app.json 中添加 Amap API Key (Android: android.config.amapApiKey, iOS: infoPlist.io.expo.AMapAPIKey)
//
// 使用示例:
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
  androidKey: 'c958a4dca2f7602f3024ca0c139984d3',
  iosKey: 'c958a4dca2f7602f3024ca0c139984d3',
};
