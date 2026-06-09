import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, Button } from '../../components';

export default function AddLocationSuccessScreen({ route, navigation }) {
  const locationId = route?.params?.locationId;

  const goToDetail = () => {
    navigation.replace('LocationDetail', { id: locationId });
  };

  const goHome = () => {
    navigation.popToTop();
  };

  return (
    <View style={styles.screen}>
      <NavBar onBack={goHome} bgColor={colors.bg} />

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={48} color={colors.white} />
        </View>

        <Text style={styles.title}>提交成功！</Text>
        <Text style={styles.subtitle}>
          你的地点已发布，其他狗主人可以看到并继续补充信息。
        </Text>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={colors.secondary} />
          <Text style={styles.infoText}>
            信息由用户共同维护，可能会随时间变化。建议出发前结合最近验证记录判断，必要时电话确认。
          </Text>
        </View>

        <View style={styles.buttonGroup}>
          <Button fullWidth onPress={goToDetail}>
            查看这个地点
          </Button>
          <Button fullWidth variant="secondary" onPress={goHome} style={{ marginTop: 12 }}>
            继续逛去玩
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 32,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: { ...typography.h1, color: colors.secondary, marginBottom: 12 },
  subtitle: {
    ...typography.body,
    color: colors.textMain,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  infoCard: {
    flexDirection: 'row',
    gap: 8,
    padding: spacing.md,
    backgroundColor: colors.tipBlue,
    borderRadius: spacing.radiusMd,
    marginBottom: 32,
  },
  infoText: {
    ...typography.caption,
    color: colors.textMain,
    flex: 1,
    lineHeight: 18,
  },
  buttonGroup: {
    width: '100%',
    marginTop: 8,
  },
});
