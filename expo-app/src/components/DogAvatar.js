import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { imageUrl } from '../utils/imageUrl';

export default function DogAvatar({ size = 56, name, icon = 'paw', image, borderColor }) {
  const [failed, setFailed] = useState(false);
  const fontSize = size * 0.5;

  if (image && !failed) {
    return (
      <Image
        source={{ uri: imageUrl(image) }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: borderColor || colors.border,
          backgroundColor: colors.chipDefault,
        }}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2, borderColor: borderColor || colors.border }]}>
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
  fallback: {
    borderWidth: 2,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontWeight: '800',
    color: colors.secondary,
    marginTop: 2,
  },
});
