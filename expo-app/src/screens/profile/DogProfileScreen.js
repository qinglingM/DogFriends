import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, Card, Chip, DogAvatar, Button } from '../../components';
import ErrorState from '../../components/ErrorState';
import { useDogs } from '../../contexts/DogContext';
import { SIZE_LABELS } from '../../constants/dog';
import { imageUrl } from '../../utils/imageUrl';

export default function DogProfileScreen({ navigation, route }) {
  const { dogs } = useDogs();
  const dogId = route?.params?.dogId;
  const dog = route?.params?.dogId ? dogs.find(d => d.id === dogId) : null;
  if (!dog) {
    return (
      <View style={styles.screen}>
        <NavBar title="狗狗档案" onBack={() => navigation.goBack()} />
        <ErrorState message="狗狗不存在" onBack={() => navigation.goBack()} />
      </View>
    );
  }

  const sizeLabel = SIZE_LABELS[dog.size] || '大型犬';
  const genderLabel = dog.gender === 'female' ? '♀ 母' : '♂ 公';
  const weightLabel = dog.weight ? `${dog.weight.toFixed(1)} kg` : '';

  let age = '';
  if (dog.birthday) {
    const birth = new Date(dog.birthday);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (now.getDate() < birth.getDate()) months--;
    if (months < 0) { years--; months += 12; }
    if (years > 0) {
      age = months > 0 ? `${years}岁${months}个月` : `${years}岁`;
    } else if (months > 0) {
      age = `${months}个月`;
    } else {
      age = '不到1个月';
    }
  }
  const hasImage = dog.image && dog.image.length > 0;

  return (
    <View style={styles.screen}>
      <NavBar
        title="狗狗档案"
        onBack={() => navigation.goBack()}
        rightIcon="create-outline"
        rightAction={() => navigation.navigate('DogEdit', { dogId: dog.id })}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          {hasImage ? (
            <Image source={{ uri: imageUrl(dog.image) }} style={styles.heroAvatar} />
          ) : (
            <DogAvatar size={96} />
          )}
          <Text style={styles.heroName}>{dog.name}</Text>
          <Text style={styles.heroBreed}>{dog.breed} · {genderLabel}</Text>
          <View style={styles.heroTags}>
            {dog.size && <Chip variant="verified">{sizeLabel}</Chip>}
            {age && <Chip>{age}</Chip>}
            {weightLabel && <Chip>{weightLabel}</Chip>}
          </View>
        </View>

        <Text style={styles.sectionTitle}>基本信息</Text>
        <Card>
          {[
            { icon: 'paw', label: '品种', value: dog.breed },
            { icon: dog.gender === 'female' ? 'female' : 'male', label: '性别', value: genderLabel },
            { icon: 'calendar', label: '生日', value: dog.birthday ? `${dog.birthday} (${age})` : '' },
            { icon: 'scale', label: '体重', value: weightLabel },
          ].filter(r => r.value).map((row, i, arr) => (
            <View key={i} style={[styles.infoRow, i < arr.length - 1 && styles.infoRowBorder]}>
              <View style={styles.infoLabel}>
                <Ionicons name={row.icon} size={16} color={colors.primary} />
                <Text style={styles.infoLabelText}>{row.label}</Text>
              </View>
              <Text style={styles.infoValue}>{row.value}</Text>
            </View>
          ))}
        </Card>

        <Text style={styles.sectionTitle}>遛狗统计</Text>
        <Card>
          <View style={styles.statsTabs}>
            <Text style={[styles.statsTab, styles.statsTabActive]}>本周</Text>
            <Text style={styles.statsTab}>本月</Text>
            <Text style={styles.statsTab}>累计</Text>
          </View>
          <View style={styles.statsGrid}>
            {[
              { value: '5', unit: ' 次', label: '遛狗次数' },
              { value: '12.6', unit: ' km', label: '总距离' },
              { value: '3.5', unit: ' h', label: '总时长' },
              { value: '4.2', unit: ' km/h', label: '平均配速' },
            ].map((s, i) => (
              <View key={i} style={styles.statBox}>
                <Text style={styles.statBoxValue}>{s.value}<Text style={styles.statBoxUnit}>{s.unit}</Text></Text>
                <Text style={styles.statBoxLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Text style={styles.sectionTitle}>进阶信息</Text>
        <Card noPadding>
          <TouchableOpacity style={[styles.advItem, { borderBottomWidth: 0 }]}>
            <View style={[styles.advIcon, { backgroundColor: 'rgba(185, 207, 50, 0.2)' }]}>
              <Ionicons name="cut-outline" size={20} color={colors.secondary} />
            </View>
            <View style={styles.advText}>
              <Text style={styles.advTitle}>绝育状态</Text>
              <Text style={styles.advSub}>已绝育 · 2024-06-01</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>
        </Card>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('DogEdit')}
      >
        <Ionicons name="create" size={24} color={colors.secondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screenMargin, paddingBottom: 104 },
  hero: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  heroAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.chipDefault,
  },
  heroName: { ...typography.h1, color: colors.secondary, marginTop: 8 },
  heroBreed: { ...typography.body, color: colors.textLight },
  heroTags: { flexDirection: 'row', gap: 8, marginTop: 8 },
  sectionTitle: { ...typography.h3, color: colors.secondary, marginBottom: 16 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabelText: { ...typography.body, color: colors.textLight },
  infoValue: { ...typography.bodyBold, color: colors.secondary },
  statsTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 16,
  },
  statsTab: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 12,
    ...typography.bodyBold,
    color: colors.textLight,
  },
  statsTabActive: { color: colors.secondary },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  statBox: {
    width: '46%',
    backgroundColor: colors.bg,
    borderRadius: spacing.radiusMd,
    padding: 16,
    alignItems: 'center',
  },
  statBoxValue: { ...typography.statValue, color: colors.secondary },
  statBoxUnit: { ...typography.captionBold, color: colors.secondary },
  statBoxLabel: { ...typography.caption, color: colors.textLight, marginTop: 4 },
  advItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 56,
  },
  advIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advText: { flex: 1 },
  advTitle: { ...typography.bodyBold, color: colors.textMain },
  advSub: { ...typography.caption, color: colors.textLight, marginTop: 2 },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
});
