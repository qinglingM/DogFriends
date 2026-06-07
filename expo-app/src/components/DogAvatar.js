import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export default function DogAvatar({ size = 56, name, icon = 'paw' }) {
  const fontSize = size * 0.5;

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name={icon} size={fontSize} color={colors.secondary} />
      {name && (
        <Text style={[styles.name, { fontSize: size * 0.22 }]} numberOfLines={1}>
          {name}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.bg,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontWeight: '800',
    color: colors.secondary,
    marginTop: 2,
  },
});
