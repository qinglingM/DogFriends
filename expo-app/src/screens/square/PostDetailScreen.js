import React, { useMemo, useRef, useState, useCallback } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, Button } from '../../components';
import { useSquare } from '../../contexts/SquareContext';

function countCommentNodes(comments = []) {
  return comments.reduce(
    (sum, comment) => sum + 1 + countCommentNodes(comment.replies || []),
    0
  );
}

// 把任意深度的回复树扁平成一维列表（保留顺序）
function flattenReplies(replies = []) {
  const out = [];
  const walk = (arr) => {
    for (const r of arr) {
      out.push(r);
      if (r.replies?.length) walk(r.replies);
    }
  };
  walk(replies);
  return out;
}

export default function PostDetailScreen({ route, navigation }) {
  const id = route?.params?.id;
  const {
    getPost,
    toggleLike,
    toggleFavorite,
    addComment,
    addCommentReply,
    toggleCommentLike,
  } = useSquare();
  const inputRef = useRef(null);
  const [commentText, setCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({ tabBarStyle: { display: 'none' } });
      return () => {
        parent?.setOptions({
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            height: spacing.bottomTabHeight,
            paddingBottom: 8,
            paddingTop: 8,
          },
        });
      };
    }, [navigation])
  );

  const post = getPost(id) || getPost('post_1');
  const comments = post?.comments || [];
  const commentCount = useMemo(
    () => countCommentNodes(comments),
    [comments]
  );

  if (!post) return null;

  const submitComment = () => {
    const text = commentText.trim();
    if (!text) return;

    if (replyTarget) {
      addCommentReply(post.id, replyTarget.id, replyTarget.authorName, text);
      setReplyTarget(null);
    } else {
      addComment(post.id, text);
    }
    setCommentText('');
  };

  const openAuthorProfile = () => {
    navigation.navigate('UserProfile', { userName: post.authorName });
  };

  const startReply = (comment) => {
    setReplyTarget({ id: comment.id, authorName: comment.authorName });
    inputRef.current?.focus();
  };

  const renderCommentNode = (comment, depth = 0) => {
    // 顶层评论：把整棵回复树扁平到一层；下层回复：不再继续嵌套
    const flatReplies = depth === 0 ? flattenReplies(comment.replies) : [];

    return (
      <View
        key={comment.id}
        style={[
          styles.commentItem,
          depth > 0 && styles.nestedCommentItem,
        ]}
      >
        <View style={[styles.commentAvatar, depth > 0 && styles.replyAvatar]}>
          <Text style={styles.commentAvatarText}>{comment.authorName.slice(0, 1)}</Text>
        </View>
        <View style={styles.commentMain}>
          <View style={styles.commentTop}>
            <Text style={styles.commentAuthor}>
              {comment.authorName}
              {!!comment.replyTo && (
                <Text style={styles.replyToText}> 回复 {comment.replyTo}</Text>
              )}
            </Text>
            <TouchableOpacity
              style={styles.commentLike}
              onPress={() => toggleCommentLike(post.id, comment.id)}
            >
              <Ionicons
                name={comment.liked ? 'heart' : 'heart-outline'}
                size={15}
                color={comment.liked ? colors.danger : colors.textLight}
              />
              <Text style={styles.commentLikeText}>{comment.likes || 0}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.commentBody}>{comment.text}</Text>

          <TouchableOpacity style={styles.replyButton} onPress={() => startReply(comment)}>
            <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.secondary} />
            <Text style={styles.replyButtonText}>回复</Text>
          </TouchableOpacity>

          {flatReplies.length > 0 && (
            <View style={styles.replyList}>
              {flatReplies.map(reply => renderCommentNode(reply, 1))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <NavBar title="帖子详情" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.postCard}>
          <TouchableOpacity style={styles.authorRow} activeOpacity={0.75} onPress={openAuthorProfile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{post.authorAvatar}</Text>
            </View>
            <View style={styles.authorMain}>
              <Text style={styles.authorName}>{post.authorName}</Text>
              <Text style={styles.postMeta}>{post.createdAt}{post.location ? ` · ${post.location}` : ''}</Text>
            </View>
            {!!post.tag && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>#{post.tag}</Text>
              </View>
            )}
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

          <View style={styles.metaRow}>
            {!!post.location && post.visibility === 'public' ? (
              <View style={styles.locationInline}>
                <Ionicons name="location" size={14} color={colors.secondary} />
                <Text style={styles.locationText} numberOfLines={1}>{post.location}</Text>
              </View>
            ) : (
              <View style={{ flex: 1 }} />
            )}

            <View style={styles.actionsInline}>
              <TouchableOpacity style={styles.actionMini} onPress={() => toggleLike(post.id)}>
                <Ionicons
                  name={post.liked ? 'heart' : 'heart-outline'}
                  size={18}
                  color={post.liked ? colors.danger : colors.textLight}
                />
                <Text style={[styles.actionMiniText, post.liked && styles.actionTextActive]}>{post.likes}</Text>
              </TouchableOpacity>
              <View style={styles.actionMini}>
                <Ionicons name="chatbubble-outline" size={17} color={colors.textLight} />
                <Text style={styles.actionMiniText}>{commentCount}</Text>
              </View>
              <TouchableOpacity style={styles.actionMini} onPress={() => toggleFavorite(post.id)}>
                <Ionicons
                  name={post.favorited ? 'bookmark' : 'bookmark-outline'}
                  size={17}
                  color={post.favorited ? colors.secondary : colors.textLight}
                />
                <Text style={[styles.actionMiniText, post.favorited && styles.actionTextActive]}>{post.favorites}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.commentHeader}>
          <Text style={styles.sectionTitle}>评论</Text>
          <Text style={styles.commentCount}>{commentCount}</Text>
        </View>

        {comments.length === 0 ? (
          <View style={styles.commentEmpty}>
            <Ionicons name="chatbubble-ellipses-outline" size={28} color={colors.textLight} style={{ opacity: 0.6 }} />
            <Text style={styles.commentEmptyText}>说点什么吧</Text>
          </View>
        ) : (
          comments.map(comment => renderCommentNode(comment))
        )}
      </ScrollView>

      <View style={styles.inputWrap}>
        {replyTarget && (
          <View style={styles.replyingBar}>
            <Text style={styles.replyingText}>回复 {replyTarget.authorName}</Text>
            <TouchableOpacity onPress={() => setReplyTarget(null)} hitSlop={8}>
              <Ionicons name="close" size={18} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.commentInputRow}>
          <TextInput
            ref={inputRef}
            value={commentText}
            onChangeText={setCommentText}
            placeholder={replyTarget ? `回复 ${replyTarget.authorName}...` : '写下你的评论...'}
            placeholderTextColor={colors.textLight}
            style={styles.commentInput}
            multiline
          />
          <Button size="sm" onPress={submitComment} disabled={!commentText.trim()}>
            发送
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screenMargin, paddingBottom: 112 },
  postCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
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
  authorMain: { flex: 1 },
  authorName: { ...typography.bodyBold, color: colors.textMain },
  postMeta: { ...typography.caption, color: colors.textLight, marginTop: 2 },
  tag: {
    paddingHorizontal: 9,
    paddingVertical: 5,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  locationInline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  locationText: { ...typography.captionBold, color: colors.secondary, flexShrink: 1 },
  actionsInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 28,
  },
  actionMiniText: { ...typography.captionBold, color: colors.textLight },
  actionTextActive: { color: colors.secondary },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  commentEmpty: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  commentEmptyText: { ...typography.captionBold, color: colors.textLight },
  sectionTitle: { ...typography.h3, color: colors.secondary },
  commentCount: { ...typography.captionBold, color: colors.textLight },
  commentItem: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  nestedCommentItem: {
    paddingTop: 10,
    paddingBottom: 6,
    borderBottomWidth: 0,
  },
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.chipDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  commentAvatarText: { ...typography.captionBold, color: colors.secondary },
  commentMain: { flex: 1 },
  commentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  commentAuthor: { ...typography.captionBold, color: colors.textMain },
  replyToText: { ...typography.caption, color: colors.textLight },
  commentBody: { ...typography.body, color: colors.textMain, marginTop: 3 },
  commentLike: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  commentLikeText: { ...typography.caption, color: colors.textLight },
  replyButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    marginTop: 4,
  },
  replyButtonText: { ...typography.captionBold, color: colors.secondary },
  replyList: {
    marginTop: 6,
    paddingLeft: 0,
  },
  inputWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.screenMargin,
    paddingTop: 8,
    paddingBottom: 12,
  },
  replyingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgLight,
    borderRadius: spacing.radiusSm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  replyingText: { ...typography.captionBold, color: colors.secondary },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    maxHeight: 92,
    backgroundColor: colors.bgLight,
    borderRadius: spacing.radiusMd,
    paddingHorizontal: 12,
    paddingVertical: 9,
    ...typography.body,
    color: colors.textMain,
  },
});
