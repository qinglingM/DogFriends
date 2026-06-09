import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { INACCURACY_REASONS } from '../data/exploreData';
import Button from './Button';

export default function InaccuracySheet({ visible, onClose, onSubmit }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelected(null);
      setSubmitted(false);
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!selected) return;
    onSubmit(selected);
    setSubmitted(true);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        {submitted ? (
          <View style={styles.successWrap}>
            <Ionicons name="checkmark-circle" size={48} color={colors.secondary} />
            <Text style={styles.successTitle}>感谢反馈</Text>
            <Text style={styles.successText}>
              我们会结合更多用户反馈更新地点状态。
            </Text>
            <Button fullWidth onPress={onClose} style={{ marginTop: 16 }}>
              我知道了
            </Button>
          </View>
        ) : (
          <>
            <Text style={styles.title}>这条信息哪里不准确？</Text>
            <View style={{ marginTop: 8 }}>
              {INACCURACY_REASONS.map(reason => (
                <TouchableOpacity
                  key={reason}
                  style={styles.optionRow}
                  onPress={() => setSelected(reason)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[styles.radio, selected === reason && styles.radioActive]}
                  >
                    {selected === reason && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.optionText}>{reason}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              fullWidth
              onPress={handleSubmit}
              disabled={!selected}
              style={{ marginTop: 16 }}
            >
              提交反馈
            </Button>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: spacing.radiusLg,
    borderTopRightRadius: spacing.radiusLg,
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: { ...typography.h3, color: colors.textMain, textAlign: 'center', marginBottom: 8 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    marginBottom: 8,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioActive: {
    borderColor: colors.secondary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.secondary,
  },
  optionText: { ...typography.body, color: colors.textMain, flex: 1 },
  successWrap: { alignItems: 'center', paddingVertical: 16 },
  successTitle: { ...typography.h2, color: colors.secondary, marginTop: 12 },
  successText: { ...typography.body, color: colors.textLight, textAlign: 'center', marginTop: 4 },
});
