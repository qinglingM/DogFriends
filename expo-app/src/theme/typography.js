import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  h1: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 32,
    fontFamily,
  },
  h2: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
    fontFamily,
  },
  h3: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    fontFamily,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    fontFamily,
  },
  bodyBold: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 22,
    fontFamily,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    fontFamily,
  },
  captionBold: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    fontFamily,
  },
  button: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    fontFamily,
  },
  timer: {
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 44,
    fontFamily,
    fontVariant: ['tabular-nums'],
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    fontFamily,
  },
};
