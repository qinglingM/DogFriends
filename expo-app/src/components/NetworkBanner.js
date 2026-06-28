import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetworkState } from 'expo-network';

export default function NetworkBanner() {
  const { isConnected } = useNetworkState();

  if (isConnected !== false) return null;

  return (
    <View style={s.banner}>
      <Text style={s.text}>网络已断开，部分功能不可用</Text>
    </View>
  );
}

const s = StyleSheet.create({
  banner: {
    backgroundColor: '#E74C3C', paddingVertical: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  text: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
