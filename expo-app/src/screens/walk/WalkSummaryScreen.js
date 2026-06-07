import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import {
  NavBar, Card, Button, Chip, DogAvatar, MapPlaceholder,
  NumberSelector, BristolScale, EmojiSelector, TipCard,
} from '../../components';

const ABNORMAL_OPTIONS = [
  '跛行', '过度喘气', '不愿走', '异常嗅探', '频繁挠痒', '呕吐迹象',
  '吠叫不止', '打架/攻击', '过度兴奋', '捡食异物', '拉拽严重', '其他',
];

const MOCK_DOGS = [
  { id: '1', name: '旺财' },
  { id: '2', name: '小白' },
];

function DogCheckinBlock({ dog, data, onChange }) {
  const update = (field, value) => onChange({ ...data, [field]: value });

  return (
    <View style={styles.dogBlock}>
      <View style={styles.dogBlockHeader}>
        <DogAvatar size={40} />
        <Text style={styles.dogBlockName}>{dog.name}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>排尿次数 <Text style={styles.required}>*</Text></Text>
        <NumberSelector
          value={data.pee}
          onChange={(v) => update('pee', v)}
          labels={[
            { value: 0, label: '没有尿' },
            { value: 1, label: '尿了1次' },
            { value: 2, label: '尿了2次' },
            { value: '3+', label: '好几次' },
          ]}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>排便次数 <Text style={styles.required}>*</Text></Text>
        <NumberSelector
          value={data.poop}
          onChange={(v) => update('poop', v)}
          labels={[
            { value: 0, label: '没有拉' },
            { value: 1, label: '拉了1次' },
            { value: 2, label: '拉了2次' },
            { value: '3+', label: '好几次' },
          ]}
        />
      </View>

      {data.poop && data.poop !== 0 && (
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>便便状态</Text>
          <BristolScale value={data.bristol} onChange={(v) => update('bristol', v)} />
        </View>
      )}

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>精神状态</Text>
        <EmojiSelector value={data.mood} onChange={(v) => update('mood', v)} />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>异常行为 (选填)</Text>
        <View style={styles.chipWrap}>
          {ABNORMAL_OPTIONS.map(opt => (
            <Chip
              key={opt}
              active={data.abnormal?.includes(opt)}
              onPress={() => {
                const list = data.abnormal || [];
                const newList = list.includes(opt)
                  ? list.filter(x => x !== opt)
                  : [...list, opt];
                update('abnormal', newList);
              }}
            >
              {opt}
            </Chip>
          ))}
        </View>
        {data.abnormal?.length > 0 && (
          <View style={styles.mediaRow}>
            <TouchableOpacity style={styles.mediaThumb}>
              <Ionicons name="image-outline" size={20} color={colors.secondary} style={{ opacity: 0.6 }} />
              <Text style={styles.mediaBadge}>照片</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaThumb}>
              <Ionicons name="videocam-outline" size={20} color={colors.secondary} style={{ opacity: 0.6 }} />
              <Text style={styles.mediaBadge}>视频</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaAdd}>
              <Ionicons name="add" size={20} color={colors.textLight} />
              <Text style={styles.mediaAddText}>补充</Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={styles.mediaHint}>选中异常行为后可上传照片或视频作为记录</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>备注 (选填)</Text>
        <TextInput
          style={styles.noteInput}
          placeholder={`记录${dog.name}的特殊情况...`}
          placeholderTextColor="#A0B3A2"
          multiline
          value={data.note}
          onChangeText={(v) => update('note', v)}
        />
      </View>
    </View>
  );
}

export default function WalkSummaryScreen({ navigation }) {
  const [checkinOpen, setCheckinOpen] = useState(true);
  const [dogData, setDogData] = useState({
    '1': { pee: 1, poop: 2, bristol: 'B4', mood: 'energetic', abnormal: ['不愿走'], note: '' },
    '2': { pee: 1, poop: 0, bristol: null, mood: 'happy', abnormal: [], note: '' },
  });

  const updateDog = (id, data) => {
    setDogData(prev => ({ ...prev, [id]: data }));
  };

  return (
    <View style={styles.screen}>
      <NavBar
        title="遛狗记录"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <TouchableOpacity
            style={styles.checkinHeader}
            onPress={() => setCheckinOpen(!checkinOpen)}
          >
            <View style={styles.checkinTitleRow}>
              <Ionicons name="clipboard-outline" size={20} color={colors.primary} />
              <Text style={styles.checkinTitle}>记录狗狗状态</Text>
            </View>
            <View style={styles.checkinToggleRow}>
              <Text style={styles.skipText} onPress={() => setCheckinOpen(false)}>跳过</Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.textLight}
                style={{ transform: [{ rotate: checkinOpen ? '180deg' : '0deg' }] }}
              />
            </View>
          </TouchableOpacity>

          {checkinOpen && (
            <View style={styles.checkinBody}>
              {MOCK_DOGS.map(dog => (
                <DogCheckinBlock
                  key={dog.id}
                  dog={dog}
                  data={dogData[dog.id]}
                  onChange={(data) => updateDog(dog.id, data)}
                />
              ))}

              <Button
                fullWidth
                onPress={() => {}}
                icon={<Ionicons name="checkmark-circle" size={20} color={colors.secondary} />}
              >
                保存打卡
              </Button>
            </View>
          )}
        </Card>

        <View style={styles.divider} />

        <MapPlaceholder
          height={200}
          label="路线回放"
          sublabel="高德地图路线回放"
        />

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Ionicons name="trending-up" size={20} color={colors.primary} style={{ marginBottom: 4 }} />
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>3.2</Text>
              <Text style={styles.statUnit}> km</Text>
            </View>
            <Text style={styles.statLabel}>总距离</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="timer-outline" size={20} color={colors.primary} style={{ marginBottom: 4 }} />
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>45</Text>
              <Text style={styles.statUnit}> min</Text>
            </View>
            <Text style={styles.statLabel}>总时长</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="speedometer-outline" size={20} color={colors.primary} style={{ marginBottom: 4 }} />
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>4.3</Text>
              <Text style={styles.statUnit}> km/h</Text>
            </View>
            <Text style={styles.statLabel}>平均配速</Text>
          </View>
        </View>

        <View style={styles.photoSection}>
          <View style={styles.photoSectionHeader}>
            <Text style={styles.photoSectionTitle}>
              <Ionicons name="camera" size={14} color={colors.primary} /> 打卡照片
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
            {[1, 2, 3].map(i => (
              <View key={i} style={styles.photoItem}>
                <Ionicons name="image-outline" size={24} color={colors.secondary} style={{ opacity: 0.5 }} />
                <Text style={styles.photoTime}>10:{20 + i * 10}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <Button
          fullWidth
          onPress={() => navigation.navigate('WalkHome')}
          style={{ marginTop: 8 }}
        >
          完成
        </Button>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.screenMargin,
  },
  checkinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkinTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkinTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.secondary,
  },
  checkinToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skipText: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.textLight,
  },
  checkinBody: {
    marginTop: 16,
    gap: 16,
  },
  dogBlock: {
    backgroundColor: colors.bg,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    gap: 16,
  },
  dogBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dogBlockName: {
    ...typography.h3,
    fontSize: 16,
    color: colors.secondary,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.secondary,
  },
  required: {
    color: colors.danger,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  mediaThumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#D3E0C8',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  mediaBadge: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.white,
    backgroundColor: colors.secondary,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  mediaAdd: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  mediaAddText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textLight,
  },
  mediaHint: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 8,
    lineHeight: 14,
  },
  noteInput: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    fontSize: 14,
    color: colors.textMain,
    height: 80,
    textAlignVertical: 'top',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.cardGap,
  },
  statItem: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    ...typography.statValue,
    fontSize: 20,
    color: colors.secondary,
  },
  statUnit: {
    ...typography.captionBold,
    fontSize: 12,
    color: colors.secondary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: 4,
  },
  photoSection: {
    marginBottom: spacing.cardGap,
  },
  photoSectionHeader: {
    marginBottom: 12,
  },
  photoSectionTitle: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.secondary,
  },
  photoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  photoItem: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#D3E0C8',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  photoTime: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    fontSize: 8,
    color: colors.white,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
});
