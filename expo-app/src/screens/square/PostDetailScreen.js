import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { formatPostTime } from '../../utils/time';
import { imageUrl } from '../../utils/imageUrl';
import { formatLocation } from '../../utils/location';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar } from '../../components';
import { useSquare } from '../../contexts/SquareContext';
import ErrorState from '../../components/ErrorState';

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
    addComment,
    addCommentReply,
    toggleCommentLike,
  } = useSquare();
  const inputRef = useRef(null);
  const insets = useSafeAreaInsets();
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
            height: spacing.bottomTabHeight + Math.max(insets.bottom + 8, 10) - 14,
            paddingTop: 4,
            paddingBottom: Math.max(insets.bottom + 8, 10),
          },
        });
      };
    }, [navigation])
  );

  const post = getPost(id);
  if (!post) {
    return <ErrorState message="帖子不存在" onBack={() => navigation.goBack()} />;
  }
  const comments = post.comments || [];
  const commentCount = useMemo(
    () => countCommentNodes(comments),
    [comments]
  );

  const images = post.images?.length > 0 ? post.images : (post.mediaUrl ? [post.mediaUrl] : []);
  const [imageRatios, setImageRatios] = useState({});

  useEffect(() => {
    images.forEach(url => {
      Image.getSize(url, (w, h) => {
        setImageRatios(prev => ({ ...prev, [url]: w / h }));
      }, () => {
        setImageRatios(prev => ({ ...prev, [url]: 4 / 3 }));
      });
    });
  }, []);

  const submitComment = () => {
    const text = commentText.trim();
    if (!text) return;

    if (replyTarget) {
      addCommentReply(post.id, replyTarget.id, replyTarget.userName, text);
      setReplyTarget(null);
    } else {
      addComment(post.id, text);
    }
    setCommentText('');
  };

  const openAuthorProfile = () => {
    navigation.navigate('UserProfile', { userName: post.userName });
  };

  const startReply = (comment) => {
    setReplyTarget({ id: comment.id, userName: comment.userName });
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
          <Text style={styles.commentAvatarText}>{(comment.userName || '').slice(0, 1)}</Text>
        </View>
        <View style={styles.commentMain}>
          <View style={styles.commentTop}>
            <Text style={styles.commentAuthor}>
              {comment.userName}
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

          <View style={styles.commentFooter}>
            <Text style={styles.commentTime}>{formatPostTime(comment.createdAt)}</Text>
            <TouchableOpacity style={styles.replyButton} onPress={() => startReply(comment)}>
              <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.secondary} />
              <Text style={styles.replyButtonText}>回复</Text>
            </TouchableOpacity>
          </View>

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
            {post.authorAvatar?.length > 2 ? (
              <Image source={{ uri: imageUrl(post.authorAvatar) }} style={styles.avatar} resizeMode="cover" />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{post.authorAvatar}</Text>
              </View>
            )}
            <View style={styles.authorMain}>
              <Text style={styles.userName}>{post.userName}</Text>
              <Text style={styles.postMeta}>{formatPostTime(post.createdAt)}{post.location ? ` · ${formatLocation(post.location)}` : ''}</Text>
            </View>
            {!!post.tag && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>#{post.tag}</Text>
              </View>
            )}
          </TouchableOpacity>

          {!!post.title && (
            <Text style={styles.postTitle}>{post.title}</Text>
          )}

          <Text style={styles.postText}>{post.text}</Text>

          {images.length > 1 ? (
            <View style={styles.imageGrid}>
              {images.map((url, i) => (
                <Image
                  key={i}
                  source={{ uri: imageUrl(url) }}
                  style={[styles.detailImage, { aspectRatio: imageRatios[url] || 4 / 3 }]}
                  resizeMode="cover"
                />
              ))}
            </View>
          ) : (
            <View style={[styles.mediaWrap, { aspectRatio: imageRatios[images[0]] || 4 / 3 }]}>
              <Image source={{ uri: imageUrl(images[0]) }} style={styles.media} resizeMode="cover" />
              {post.mediaType === 'video' && (
                <View style={styles.videoBadge}>
                  <Ionicons name="play" size={22} color={colors.white} />
                </View>
              )}
            </View>
          )}

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

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        {replyTarget && (
          <View style={styles.replyingBar}>
            <Text style={styles.replyingText}>回复 {replyTarget.userName}</Text>
            <TouchableOpacity onPress={() => setReplyTarget(null)} hitSlop={8}>
              <Ionicons name="close" size={18} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.bottomRow}>
          <TextInput
            ref={inputRef}
            value={commentText}
            onChangeText={setCommentText}
            placeholder={replyTarget ? `回复 ${replyTarget.userName}...` : '写下你的评论...'}
            placeholderTextColor={colors.textLight}
            style={styles.commentInput}
            maxLength={200}
            returnKeyType="done"
            onSubmitEditing={submitComment}
            blurOnSubmit
          />
          <View style={styles.bottomActions}>
            <TouchableOpacity style={styles.bottomAction} onPress={() => toggleLike(post.id)}>
              <Ionicons
                name={post.liked ? 'heart' : 'heart-outline'}
                size={20}
                color={post.liked ? colors.danger : colors.textLight}
              />
              <Text style={[styles.bottomActionText, post.liked && styles.bottomActionActive]}>{post.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomAction} onPress={() => inputRef.current?.focus()}>
              <Ionicons name="chatbubble-outline" size={19} color={colors.textLight} />
              <Text style={styles.bottomActionText}>{commentCount}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {commentText.length > 0 && (
          <Text style={styles.commentCounter}>{`${commentText.length}/200`}</Text>
        )}
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
  userName: { ...typography.bodyBold, color: colors.textMain },
  postMeta: { ...typography.caption, color: colors.textLight, marginTop: 2 },
  tag: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.chipDefault,
  },
  tagText: { ...typography.captionBold, color: colors.secondary },
  postText: { ...typography.body, color: colors.textMain, marginBottom: 14 },
  postTitle: { ...typography.bodyBold, color: colors.textMain, fontSize: 18, marginBottom: 8 },
  mediaWrap: {
    borderRadius: spacing.radiusMd,
    overflow: 'hidden',
    backgroundColor: '#D3E0C8',
    marginBottom: 12,
  },
  media: { width: '100%', height: '100%' },
  imageGrid: {
    gap: spacing.sm,
    marginBottom: 12,
  },
  detailImage: {
    width: '100%',
    borderRadius: spacing.radiusMd,
    backgroundColor: colors.chipDefault,
  },
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
  commentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  commentTime: { ...typography.caption, color: colors.textLight, fontSize: 11 },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  replyButtonText: { ...typography.captionBold, color: colors.secondary },
  replyList: {
    marginTop: 6,
    paddingLeft: 0,
  },
  bottomBar: {
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
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentInput: {
    flex: 1.4,
    height: 40,
    backgroundColor: colors.bgLight,
    borderRadius: spacing.radiusMd,
    paddingHorizontal: 12,
    paddingVertical: 9,
    ...typography.body,
    color: colors.textMain,
  },
  bottomActions: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  bottomAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    minHeight: 28,
  },
  bottomActionText: { ...typography.captionBold, color: colors.textLight },
  bottomActionActive: { color: colors.secondary },
  commentCounter: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: 2,
  },
});
