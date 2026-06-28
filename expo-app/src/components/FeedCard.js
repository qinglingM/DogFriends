import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import WalkRecordPreview from './WalkRecordPreview';
import { formatPostTime } from '../utils/time';
import { imageUrl } from '../utils/imageUrl';
import { formatLocation } from '../utils/location';

const PHOTO_SIZE = Math.floor((Dimensions.get('window').width - 82) / 3);

export default function FeedCard({ item, profile, onPress, interactive = false, onDelete }) {
  const [liked, setLiked] = useState(item.liked);
  const [likes, setLikes] = useState(item.likes);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleLike = (e) => {
    e.stopPropagation();
    if (!interactive) return;
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setMenuVisible(prev => !prev);
  };

  const handleDeleteOption = (e) => {
    e.stopPropagation();
    setMenuVisible(false);
    Alert.alert(
      '删除帖子',
      '确定要删除这条动态吗？',
      [
        { text: '取消', style: 'cancel' },
        { text: '删除', style: 'destructive', onPress: () => onDelete?.(item.id) },
      ]
    );
  };

  return (
    <TouchableOpacity style={s.feedCard} activeOpacity={0.82} onPress={onPress}>
      <View style={s.feedAuthor}>
        <Image source={{ uri: imageUrl(profile.avatar) }} style={s.feedAvatar} />
        <View style={s.feedAuthorText}>
          <Text style={s.feedName}>{profile.name}</Text>
          <Text style={s.feedTime}>{formatPostTime(item.createdAt)}{item.location ? ` · ${formatLocation(item.location)}` : ''}</Text>
        </View>
      </View>
      <Text style={s.feedTitle}>{item.title}</Text>
      <Text style={s.feedText}>{item.text}</Text>
      {item.walkRecord ? (
        <WalkRecordPreview record={item.walkRecord} />
      ) : (
        <View style={s.photoRow}>
          {item.images.slice(0, 3).map((image, index) => (
            <Image key={`${item.id}_${index}`} source={{ uri: imageUrl(image) }} style={s.feedPhoto} />
          ))}
        </View>
      )}
      <View style={s.feedActions}>
        <TouchableOpacity style={s.feedAction} activeOpacity={0.7} onPress={handleLike}>
          <Ionicons
            name={interactive ? (liked ? 'heart' : 'heart-outline') : (item.liked ? 'heart' : 'heart-outline')}
            size={22}
            color={interactive ? (liked ? colors.danger : colors.textLight) : (item.liked ? colors.danger : colors.textLight)}
          />
          <Text style={[s.feedActionText, interactive && liked && { color: colors.danger }]}>
            {interactive ? likes : item.likes}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.feedAction} activeOpacity={0.7} onPress={(e) => e.stopPropagation()}>
          <Ionicons name="chatbubble-outline" size={22} color={colors.textLight} />
          <Text style={s.feedActionText}>{item.comments}</Text>
        </TouchableOpacity>
        {interactive && (
          <View style={s.moreWrap}>
            <TouchableOpacity style={s.feedActionMore} activeOpacity={0.7} onPress={handleMenuToggle}>
              <Ionicons name="ellipsis-horizontal" size={22} color={colors.textLight} />
            </TouchableOpacity>
            {menuVisible && (
              <View style={s.dropdown}>
                <TouchableOpacity style={s.dropdownItem} activeOpacity={0.7} onPress={handleDeleteOption}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  <Text style={s.dropdownItemText}>删除</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  feedCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  feedAuthor: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  feedAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.chipDefault },
  feedAuthorText: { flex: 1 },
  feedName: { ...typography.bodyBold, color: colors.textMain },
  feedTime: { ...typography.caption, color: colors.textLight },
  feedTitle: { ...typography.bodyBold, fontSize: 16, color: colors.textMain, marginBottom: spacing.sm },
  feedText: { ...typography.body, color: colors.textMain, marginBottom: spacing.sm },
  photoRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md, flexWrap: 'wrap' },
  feedPhoto: { width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: spacing.radiusSm, backgroundColor: colors.chipDefault },
  feedActions: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingTop: spacing.sm,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  feedAction: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minWidth: 64 },
  moreWrap: { position: 'relative' },
  feedActionMore: { padding: spacing.xs },
  feedActionText: { ...typography.body, color: colors.textLight },
  dropdown: {
    position: 'absolute',
    right: 0,
    bottom: 36,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusSm,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 100,
    zIndex: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dropdownItemText: {
    ...typography.body,
    color: colors.danger,
    fontSize: 14,
  },
});
