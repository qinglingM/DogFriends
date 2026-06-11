import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform, Linking } from 'react-native';

/**
 * 请求相册访问权限
 * @returns {Promise<boolean>} 是否获得权限
 */
export async function requestMediaLibraryPermission() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

/**
 * 从相册选择图片
 * @returns {Promise<Array<string>>} 选中的图片 URI 数组
 */
export async function pickImagesFromLibrary() {
  try {
    // 请求权限
    const hasPermission = await requestMediaLibraryPermission();
    
    if (!hasPermission) {
      // 权限被拒绝，提示用户
      Alert.alert(
        '需要相册访问权限',
        '请在设置中允许访问相册，以便选择照片',
        [
          { text: '取消', style: 'cancel' },
          { 
            text: '去设置', 
            onPress: () => {
              if (Platform.OS === 'web') {
                // Web 端无法跳转到设置
                Alert.alert('提示', '请在浏览器设置中允许访问相册');
              } else {
                Linking.openSettings();
              }
            }
          }
        ]
      );
      return [];
    }

    // 调起相册选择器
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 9, // 最多选择 9 张
    });

    if (result.canceled) {
      return [];
    }

    // 返回选中的图片 URI 数组
    return result.assets.map(asset => asset.uri);
  } catch (error) {
    console.error('选择图片失败:', error);
    Alert.alert('错误', '选择图片失败，请重试');
    return [];
  }
}

/**
 * 拍照（备用功能）
 * @returns {Promise<string|null>} 拍照的图片 URI
 */
export async function takePhoto() {
  try {
    // 请求相机权限
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        '需要相机访问权限',
        '请在设置中允许访问相机，以便拍照',
        [
          { text: '取消', style: 'cancel' },
          { 
            text: '去设置', 
            onPress: () => {
              if (Platform.OS !== 'web') {
                Linking.openSettings();
              }
            }
          }
        ]
      );
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0].uri;
  } catch (error) {
    console.error('拍照失败:', error);
    Alert.alert('错误', '拍照失败，请重试');
    return null;
  }
}
