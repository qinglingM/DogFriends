import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, Card } from '../../components';

export default function SettingsScreen({ navigation }) {
  return (
    <View style={styles.screen}>
      <NavBar title="设置" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.groupLabel}>账号</Text>
        <Card noPadding>
          {[
            { icon: 'person-circle-outline', text: '个人信息' },
            { icon: 'shield-checkmark-outline', text: '隐私设置' },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={[styles.menuItem, i < 1 && styles.menuBorder]}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(185, 207, 50, 0.2)' }]}>
                <Ionicons name={item.icon} size={20} color={colors.secondary} />
              </View>
              <Text style={styles.menuText}>{item.text}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </TouchableOpacity>
          ))}
        </Card>

        <Text style={styles.groupLabel}>通知</Text>
        <Card noPadding>
          {[
            { icon: 'notifications-outline', text: '审核通知', on: true },
            { icon: 'medkit-outline', text: '疫苗提醒', on: true },
            { icon: 'heart-outline', text: '互动消息', on: false },
          ].map((item, i) => (
            <View key={i} style={[styles.menuItem, i < 2 && styles.menuBorder]}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(146, 102, 153, 0.15)' }]}>
                <Ionicons name={item.icon} size={20} color={colors.accent} />
              </View>
              <Text style={styles.menuText}>{item.text}</Text>
              <View style={[styles.toggle, !item.on && styles.toggleOff]}>
                <View style={[styles.toggleKnob, !item.on && styles.toggleKnobOff]} />
              </View>
            </View>
          ))}
        </Card>

        <Text style={styles.groupLabel}>其他</Text>
        <Card noPadding>
          {[
            { icon: 'help-circle-outline', text: '帮助与反馈' },
            { icon: 'information-circle-outline', text: '关于狗友' },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={[styles.menuItem, i < 1 && styles.menuBorder]}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(185, 207, 50, 0.2)' }]}>
                <Ionicons name={item.icon} size={20} color={colors.secondary} />
              </View>
              <Text style={styles.menuText}>{item.text}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
            </TouchableOpacity>
          ))}
        </Card>

        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>

        <View style={styles.version}>
          <Ionicons name="paw" size={32} color={colors.primary} />
          <Text style={styles.versionName}>狗友</Text>
          <Text style={styles.versionNum}>版本 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screenMargin, paddingBottom: 48, gap: 24 },
  groupLabel: {
    ...typography.captionBold, color: colors.textLight,
    textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    padding: spacing.md, minHeight: 56,
  },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  menuText: { flex: 1, ...typography.bodyBold, color: colors.textMain },
  toggle: {
    width: 48, height: 28, borderRadius: 14,
    backgroundColor: colors.primary, position: 'relative',
  },
  toggleOff: { backgroundColor: colors.border },
  toggleKnob: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.white, position: 'absolute', top: 2, right: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 2,
  },
  toggleKnobOff: { right: undefined, left: 2 },
  logoutBtn: {
    backgroundColor: colors.white, borderRadius: spacing.radiusMd,
    padding: spacing.md, alignItems: 'center', minHeight: 56,
  },
  logoutText: { ...typography.bodyBold, color: colors.danger },
  version: { alignItems: 'center', paddingVertical: 32, gap: 4 },
  versionName: { ...typography.bodyBold, fontSize: 16, color: colors.secondary },
  versionNum: { ...typography.caption, color: colors.textLight },
});
