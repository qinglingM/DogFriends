import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const MAX_NOTE_LENGTH = 80;

export default function ValidationCard({ validation, helpful, onToggleHelpful, onReportInaccuracy }) {
  const [previewImage, setPreviewImage] = useState(null);
  const [noteExpanded, setNoteExpanded] = useState(false);

  const getDogSizeColor = (size) => {
    switch (size) {
      case '小型犬': return '#B9CF32';
      case '中型犬': return '#926699';
      case '大型犬': return '#347048';
      default: return '#B9CF32';
    }
  };

  const getDogSizeLabel = (size) => {
    switch (size) {
      case '小型犬': return '小';
      case '中型犬': return '中';
      case '大型犬': return '大';
      default: return '';
    }
  };

  const note = validation.note || '';
  const noteIsLong = note.length > MAX_NOTE_LENGTH;
  const displayNote = noteIsLong && !noteExpanded ? note.slice(0, MAX_NOTE_LENGTH) + '...' : note;

  const photos = Array.isArray(validation.photos) ? validation.photos : [];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>{validation.userAvatar || '🐶'}</Text>
          {validation.dogSize && (
            <View style={[styles.dogSizeIcon, { backgroundColor: getDogSizeColor(validation.dogSize) }]}>
              <Text style={styles.dogSizeText}>{getDogSizeLabel(validation.dogSize)}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerLeft}>
          <Text style={styles.userName}>{validation.userName}</Text>
        </View>
        <View style={styles.outcomeRow}>
          <Ionicons name="checkmark-circle" size={14} color={colors.secondary} />
          <Text style={styles.outcomeText}>{validation.outcomeLabel}</Text>
        </View>
      </View>

      {validation.tags?.length > 0 && (
        <View style={styles.tagRow}>
          {validation.tags.map((t, i) => (
            <View key={i} style={styles.tagChip}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
        </View>
      )}

      {note ? (
        <View style={styles.noteContainer}>
          <Text style={styles.note}>{displayNote}</Text>
          {noteIsLong && (
            <TouchableOpacity onPress={() => setNoteExpanded(!noteExpanded)} style={styles.expandBtn}>
              <Text style={styles.expandText}>{noteExpanded ? '收起' : '展开'}</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      {photos.length > 0 && (
        <View style={styles.photoRow}>
          {photos.map((photo, i) => (
            <TouchableOpacity key={i} onPress={() => setPreviewImage(photo)} style={styles.photoTouchable}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photoImage} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="image-outline" size={20} color={colors.secondary} style={{ opacity: 0.4 }} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.time}>{validation.time}</Text>
        <View style={styles.footerActions}>
          <TouchableOpacity style={styles.footerBtn} onPress={onToggleHelpful} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons
              name={helpful ? 'thumbs-up' : 'thumbs-up-outline'}
              size={16}
              color={helpful ? colors.secondary : colors.textLight}
            />
            <Text style={[styles.footerText, helpful && { color: colors.secondary, fontWeight: '700' }]}>
              有用 {validation.helpfulCount || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.footerBtn} onPress={onReportInaccuracy} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.textLight} />
            <Text style={styles.footerText}>信息不准</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={!!previewImage} transparent animationType="fade" onRequestClose={() => setPreviewImage(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setPreviewImage(null)}>
          <View style={styles.modalContent}>
            {previewImage && (
              <Image source={{ uri: previewImage }} style={styles.modalImage} resizeMode="contain" />
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setPreviewImage(null)}>
              <Ionicons name="close-circle" size={32} color={colors.white} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    paddingLeft: spacing.md + 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  dogSizeIcon: {
    position: 'absolute',
    left: -10,
    top: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  dogSizeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.white,
  },
  headerLeft: {
    flex: 1,
  },
  avatarEmoji: { fontSize: 20 },
  userName: { ...typography.bodyBold, color: colors.textMain },
  time: { ...typography.caption, color: colors.textLight, marginTop: 4 },
  outcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  outcomeText: { ...typography.captionBold, color: colors.secondary },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.chipDefault,
  },
  tagText: { ...typography.captionBold, color: colors.textMain },
  noteContainer: {
    marginBottom: 8,
  },
  note: { ...typography.body, color: colors.textMain },
  expandBtn: {
    marginTop: 4,
  },
  expandText: { ...typography.captionBold, color: colors.secondary },
  photoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  photoTouchable: {
    borderRadius: spacing.radiusSm,
    overflow: 'hidden',
  },
  photoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: spacing.radiusSm,
    backgroundColor: '#D3E0C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoImage: {
    width: 64,
    height: 64,
    borderRadius: spacing.radiusSm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: { ...typography.caption, color: colors.textLight, marginLeft: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '90%',
    height: '90%',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
});
