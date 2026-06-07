import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, Button, Card } from '../../components';

export default function DogEditScreen({ navigation }) {
  const [gender, setGender] = useState('male');
  const [neutered, setNeutered] = useState(true);
  const [weight, setWeight] = useState('32');

  return (
    <View style={styles.screen}>
      <NavBar title="编辑狗狗" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarUpload}>
          <TouchableOpacity style={styles.avatarCircle}>
            <Ionicons name="camera" size={40} color={colors.border} />
            <View style={styles.avatarBadge}>
              <Ionicons name="create" size={12} color={colors.secondary} />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>点击上传狗狗头像</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>名字 <Text style={styles.required}>*</Text></Text>
          <TextInput style={styles.input} defaultValue="旺财" placeholder="给狗狗起个名字" placeholderTextColor="#A0B3A2" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>品种 <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity style={styles.select}>
            <Text style={styles.selectText}>金毛寻回犬</Text>
            <Ionicons name="chevron-down" size={16} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>性别 <Text style={styles.required}>*</Text></Text>
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[styles.genderBtn, gender === 'male' && styles.genderBtnActive]}
              onPress={() => setGender('male')}
            >
              <Text style={styles.genderIcon}>♂</Text>
              <Text style={[styles.genderLabel, gender === 'male' && styles.genderLabelActive]}>公</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderBtn, gender === 'female' && styles.genderBtnActive]}
              onPress={() => setGender('female')}
            >
              <Text style={styles.genderIcon}>♀</Text>
              <Text style={[styles.genderLabel, gender === 'female' && styles.genderLabelActive]}>母</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>生日 <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity style={styles.select}>
            <Text style={styles.selectText}>2023-03-15</Text>
            <Ionicons name="calendar" size={16} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>体重 <Text style={styles.required}>*</Text></Text>
          <View style={styles.weightRow}>
            <TouchableOpacity
              style={styles.weightBtn}
              onPress={() => setWeight(String(Math.max(0, Number(weight) - 1)))}
            >
              <Ionicons name="remove" size={24} color={colors.secondary} />
            </TouchableOpacity>
            <TextInput
              style={styles.weightInput}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
            <Text style={styles.weightUnit}>kg</Text>
            <TouchableOpacity
              style={styles.weightBtn}
              onPress={() => setWeight(String(Number(weight) + 1))}
            >
              <Ionicons name="add" size={24} color={colors.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={[styles.label, { color: colors.accent, marginBottom: 16 }]}>进阶信息</Text>

        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => setNeutered(!neutered)}
        >
          <View style={styles.toggleLeft}>
            <View style={[styles.toggleIcon, { backgroundColor: 'rgba(185, 207, 50, 0.2)' }]}>
              <Ionicons name="cut-outline" size={20} color={colors.secondary} />
            </View>
            <Text style={styles.toggleText}>已绝育</Text>
          </View>
          <View style={[styles.toggle, !neutered && styles.toggleOff]}>
            <View style={[styles.toggleKnob, !neutered && styles.toggleKnobOff]} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.vaccineLink}
          onPress={() => navigation.navigate('Vaccine')}
        >
          <View style={styles.toggleLeft}>
            <View style={[styles.toggleIcon, { backgroundColor: 'rgba(146, 102, 153, 0.15)' }]}>
              <Ionicons name="medkit-outline" size={20} color={colors.accent} />
            </View>
            <View>
              <Text style={styles.toggleText}>疫苗记录</Text>
              <Text style={styles.vaccineSub}>已接种 3 项</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button fullWidth onPress={() => navigation.goBack()}>保存</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screenMargin, paddingBottom: 104 },
  avatarUpload: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  avatarCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: colors.white, borderWidth: 3, borderColor: colors.border,
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  avatarBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.bg,
  },
  avatarHint: { ...typography.caption, color: colors.textLight },
  field: { marginBottom: 24 },
  label: { ...typography.bodyBold, fontSize: 16, color: colors.secondary, marginBottom: 8 },
  required: { color: colors.danger },
  input: {
    backgroundColor: colors.white, borderRadius: spacing.radiusMd,
    padding: spacing.md, fontSize: 16, color: colors.textMain,
  },
  select: {
    backgroundColor: colors.white, borderRadius: spacing.radiusMd,
    padding: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  selectText: { fontSize: 16, color: colors.textMain },
  genderRow: { flexDirection: 'row', gap: 16 },
  genderBtn: {
    flex: 1, backgroundColor: colors.white, borderRadius: spacing.radiusMd,
    padding: spacing.md, alignItems: 'center', gap: 8, minHeight: 72,
    borderWidth: 2, borderColor: 'transparent',
  },
  genderBtnActive: { borderColor: colors.primary, backgroundColor: 'rgba(185, 207, 50, 0.1)' },
  genderIcon: { fontSize: 28 },
  genderLabel: { ...typography.bodyBold, color: colors.textLight },
  genderLabelActive: { color: colors.secondary, fontWeight: '800' },
  weightRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  weightBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.white, borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  weightInput: {
    flex: 1, backgroundColor: colors.white, borderRadius: spacing.radiusMd,
    padding: spacing.md, fontSize: 24, fontWeight: '800',
    color: colors.secondary, textAlign: 'center',
  },
  weightUnit: { ...typography.bodyBold, fontSize: 16, color: colors.secondary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8, marginBottom: 24 },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: spacing.radiusMd,
    padding: spacing.md, marginBottom: 16,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  toggleText: { ...typography.bodyBold, color: colors.textMain },
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
  vaccineLink: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: spacing.radiusMd, padding: spacing.md,
  },
  vaccineSub: { ...typography.caption, color: colors.textLight, marginTop: 2 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: spacing.md, backgroundColor: colors.bg,
    borderTopWidth: 1, borderBottomColor: colors.border,
  },
});
