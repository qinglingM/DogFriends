import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={s.container}>
          <Text style={s.emoji}>🐾</Text>
          <Text style={s.title}>出错了</Text>
          <Text style={s.message}>应用遇到了一个意外错误，请重试</Text>
          <TouchableOpacity
            style={s.btn}
            onPress={() => this.setState({ error: null })}
            activeOpacity={0.7}
          >
            <Text style={s.btnText}>重试</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F5F0', padding: 32 },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#5A6B5C', marginBottom: 8 },
  message: { fontSize: 14, color: '#8A9A8C', textAlign: 'center', marginBottom: 24 },
  btn: {
    backgroundColor: '#B9CF32', paddingVertical: 12, paddingHorizontal: 32,
    borderRadius: 24,
  },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
