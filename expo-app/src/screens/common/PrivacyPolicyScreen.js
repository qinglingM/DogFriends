import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar } from '../../components';

const CONTENT = `
更新日期：2026 年 1 月 1 日

「遛遛」尊重并保护您的隐私。本隐私政策将说明我们在您使用「遛遛」服务时如何收集、使用、存储和保护您的个人信息。

一、信息收集的范围
我们仅会出于本政策所述的目的收集您的个人信息：

1.1 您主动提供的信息
- 注册信息：您在注册时提供的邮箱地址。
- 个人资料：昵称、头像、性别、地区、个人签名。
- 狗狗档案：狗狗名称、品种、性别、生日、体重、照片。
- 发布内容：您发布的动态、评论、遛狗记录中的文字和图片。
- 反馈信息：您通过帮助与反馈提交的意见和建议。

1.2 我们自动收集的信息
- 位置信息：使用遛狗记录功能时的GPS位置，用于绘制路线和计算距离。您可以在设备权限中关闭位置授权。
- 设备信息：设备型号、操作系统版本，用于保障服务安全。
- 使用日志：操作记录、浏览内容，用于优化服务体验。
- 相册与相机：上传头像、发布动态、遛狗拍照时需访问您的相册或调用相机。如拒绝授权，不影响其他功能使用。

二、信息的使用
我们将收集的信息用于：
- 提供遛狗记录、社区互动、地点探索等核心功能；
- 维护服务正常运行，保障账号安全；
- 优化和改进服务体验；
- 法律法规要求的其他用途。

三、信息的共享
我们不会向任何第三方出售您的个人信息。仅在以下情况可能共享：
- 获得您的明确同意；
- 服务必需（如将位置数据发送至高德地图用于地图渲染）；
- 法律法规或政府机关要求。

四、第三方服务
我们使用的第三方SDK：
- 高德地图SDK：地图展示、GPS定位（收集位置信息、设备信息）
- 微信SDK：微信登录与分享（收集微信账号信息）

五、数据保护
您的个人信息存储于中国境内，我们采用SSL加密传输、访问控制等安全措施保护您的数据安全。

六、您的权利
您有权查阅、修改、删除您的个人信息，以及注销账号。相关操作可在应用内完成，或通过下方联系方式联系我们。

七、联系我们
如您对本隐私政策有任何疑问，可通过应用内「我的」-「设置」-「帮助与反馈」联系我们。
`;

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <View style={styles.screen}>
      <NavBar title="隐私政策" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.text}>{CONTENT.trim()}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { padding: spacing.lg, paddingBottom: 48 },
  text: {
    ...typography.body,
    color: colors.textMain,
    lineHeight: 24,
  },
});
