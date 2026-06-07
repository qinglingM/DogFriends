import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';

export const commonStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  screenPadding: {
    paddingHorizontal: spacing.screenMargin,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    marginBottom: spacing.cardGap,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  col: {
    flexDirection: 'column',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
  },
  gap4: {
    gap: 4,
  },
  gap8: {
    gap: 8,
  },
  gap16: {
    gap: 16,
  },
  gap24: {
    gap: 24,
  },
  fullWidth: {
    width: '100%',
  },
  textCenter: {
    textAlign: 'center',
  },
});
