import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, Button } from '../../components';
import { useSquare } from '../../contexts/SquareContext';

export default function PostDetailScreen({ route, navigation }) {
  const id = route?.params?.id;
  const {
    getPost,
    toggleLike,
    toggleFavorite,
    addComment,
    toggleCommentLike,
  } = useSquare();
  const [commentText, setCommentText] = useState('');

  const post = getPost(id) || getPost('post_1');
  if (!post) return null;

  const submitComment = () => {
    const text = commentText.trim();
    if (!text) return;
    addComment(post.id, text);
    setCommentText('');
  };
  const openAuthorProfile = () => {
    navigation.navigate('UserProfile', { userName: post.authorName });
  };

  return (
    <View style={styles.screen}>
      <NavBar title="帖子详情" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.authorRow} activeOpacity={0.75} onPress={openAuthorProfile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{post.authorAvatar}</Text>
          </View>
          <View style={styles.authorMain}>
            <Text style={styles.authorName}>{post.authorName}</Text>
            {!!post.tag && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{post.tag}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <Text style={styles.postText}>{post.text}</Text>

        <View style={styles.mediaWrap}>
          <Image source={{ uri: post.mediaUrl }} style={styles.media} resizeMode="cover" />
          {post.mediaType === 'video' && (
            <View style={styles.videoBadge}>
              <Ionicons name="play" size={22} color={colors.white} />
            </View>
          )}
        </View>

        {!!post.location && post.visibility === 'public' && (
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={colors.secondary} />
            <Text style={styles.locationText}>{post.location}</Text>
          </View>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => toggleLike(post.id)}>
            <Ionicons name={post.liked ? 'heart' : 'heart-outline'} size={20} color={post.liked ? colors.danger : colors.secondary} />
            <Text style={styles.actionText}>{post.likes}</Text>
          </TouchableOpacity>
          <View style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={19} color={colors.secondary} />
            <Text style={styles.actionText}>{post.comments.length}</Text>
          </View>
          <TouchableOpacity style={styles.actionButton} onPress={() => toggleFavorite(post.id)}>
            <Ionicons name={post.favorited ? 'bookmark' : 'bookmark-outline'} size={19} color={colors.secondary} />
            <Text style={styles.actionText}>{post.favorites}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>评论</Text>
        {post.comments.map(comment => (
          <View key={comment.id} style={styles.commentItem}>
            <View style={styles.commentAvatar}>
              <Text style={styles.commentAvatarText}>{comment.authorName.slice(0, 1)}</Text>
            </View>
            <View style={styles.commentMain}>
              <Text style={styles.commentAuthor}>{comment.authorName}</Text>
              <Text style={styles.commentText}>{comment.text}</Text>
            </View>
            <TouchableOpacity
              style={styles.commentLike}
              onPress={() => toggleCommentLike(post.id, comment.id)}
            >
              <Ionicons name={comment.liked ? 'heart' : 'heart-outline'} size={16} color={comment.liked ? colors.danger : colors.textLight} />
              <Text style={styles.commentLikeText}>{comment.likes}</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.commentInputRow}>
          <TextInput
            value={commentText}
            onChangeText={setCommentText}
            placeholder="写下你的评论..."
            placeholderTextColor={colors.textLight}
            style={styles.commentInput}
          />
          <Button size="sm" onPress={submitComment}>发送</Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screenMargin, paddingBottom: 48 },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(185, 207, 50, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.bodyBold, color: colors.secondary },
  authorMain: { flex: 1, gap: 4 },
  authorName: { ...typography.bodyBold, color: colors.textMain },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.chipDefault,
  },
  tagText: { ...typography.captionBold, color: colors.secondary },
  postText: { ...typography.body, color: colors.textMain, marginBottom: 14 },
  mediaWrap: {
    aspectRatio: 3 / 4,
    borderRadius: spacing.radiusMd,
    overflow: 'hidden',
    backgroundColor: '#D3E0C8',
    marginBottom: 12,
  },
  media: { width: '100%', height: '100%' },
  videoBadge: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 52,
    height: 52,
    marginLeft: -26,
    marginTop: -26,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  locationText: { ...typography.captionBold, color: colors.secondary },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    paddingVertical: 12,
    marginBottom: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: { ...typography.bodyBold, color: colors.secondary },
  sectionTitle: { ...typography.h3, color: colors.secondary, marginBottom: 12 },
  commentItem: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    marginBottom: 10,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.chipDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: { ...typography.captionBold, color: colors.secondary },
  commentMain: { flex: 1 },
  commentAuthor: { ...typography.captionBold, color: colors.textMain, marginBottom: 3 },
  commentText: { ...typography.caption, color: colors.textMain },
  commentLike: {
    alignItems: 'center',
    gap: 2,
  },
  commentLikeText: { ...typography.caption, color: colors.textLight },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusPill,
    paddingHorizontal: 14,
    minHeight: 40,
    ...typography.body,
    color: colors.textMain,
  },
});
