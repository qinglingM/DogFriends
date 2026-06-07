import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Button, Chip, MapPlaceholder } from '../../components';

export default function LocationDetailScreen({ navigation }) {
  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <MapPlaceholder height={240} label="地点照片" style={{ borderRadius: 0 }} />
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>BLOOM Coffee</Text>
          <TouchableOpacity>
            <Ionicons name="bookmark-outline" size={24} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.addressRow}>
          <Ionicons name="location" size={14} color={colors.textLight} />
          <Text style={styles.address}>咖啡店 · 徐汇区某某路 123 号</Text>
        </View>

        <View style={styles.statusBanner}>
          <Ionicons name="checkmark-circle" size={32} color={colors.secondary} />
          <View>
            <Text style={styles.statusText}>已验证可带狗</Text>
            <Text style={styles.statusSub}>2 天前有用户去过</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>宠物规则</Text>
        <View style={styles.rulesGrid}>
          <View style={styles.ruleItem}>
            <Ionicons name="home-outline" size={16} color={colors.secondary} />
            <Text style={styles.ruleText}>仅户外可进</Text>
          </View>
          <View style={styles.ruleItem}>
            <Ionicons name="paw-outline" size={16} color={colors.secondary} />
            <Text style={styles.ruleText}>小型犬友好</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>设施与要求</Text>
        <View style={styles.facilityTags}>
          <Chip>有水碗</Chip>
          <Chip>需要牵绳</Chip>
          <Chip>不能上椅</Chip>
        </View>
      </ScrollView>

      <View style={styles.bottomAction}>
        <Button
          variant="secondary"
          fullWidth
          onPress={() => {}}
          style={{ marginBottom: 16 }}
        >
          我去过，更新信息
        </Button>
        <View style={styles.actionRow}>
          <Button
            icon={<Ionicons name="navigate" size={16} color={colors.secondary} />}
            style={{ flex: 1 }}
          >
            导航
          </Button>
          <Button
            variant="secondary"
            icon={<Ionicons name="call" size={16} color={colors.secondary} />}
            style={{ flex: 1 }}
          >
            电话
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  hero: { position: 'relative' },
  backBtn: {
    position: 'absolute', top: 48, left: 16,
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 16, elevation: 4,
  },
  content: {
    padding: spacing.screenMargin, paddingTop: 24,
    backgroundColor: colors.bg,
    borderTopLeftRadius: spacing.radiusLg,
    borderTopRightRadius: spacing.radiusLg,
    marginTop: -24, position: 'relative', zIndex: 5,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  title: { ...typography.h1, color: colors.secondary },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  address: { ...typography.body, color: colors.textLight },
  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: colors.primary, padding: spacing.md,
    borderRadius: spacing.radiusMd, marginBottom: 24,
    borderBottomWidth: 4, borderBottomColor: colors.secondary,
  },
  statusText: { ...typography.bodyBold, color: colors.secondary },
  statusSub: { ...typography.caption, color: colors.secondary, opacity: 0.8, marginTop: 4 },
  sectionTitle: { ...typography.h3, color: colors.secondary, marginTop: 24, marginBottom: 16 },
  rulesGrid: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  ruleItem: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.white, padding: spacing.md,
    borderRadius: spacing.radiusMd,
  },
  ruleText: { ...typography.bodyBold, color: colors.secondary },
  facilityTags: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  bottomAction: {
    padding: spacing.md, backgroundColor: colors.bg,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  actionRow: { flexDirection: 'row', gap: 16 },
});
