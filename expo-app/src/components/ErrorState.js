import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export default function ErrorState({ message, onBack }) {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={48} color={colors.textLight} />
      <Text style={styles.message}>{message || '内容不存在'}</Text>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.btn}>
          <Text style={styles.btnText}>返回</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    gap: 12,
  },
  message: {
    ...typography.body,
    color: colors.textLight,
  },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  btnText: {
    ...typography.bodyBold,
    color: colors.secondary,
  },
});
