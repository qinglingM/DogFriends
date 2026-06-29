import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useSquare } from '../../contexts/SquareContext';
import { SQUARE_TAGS } from '../../data/squareData';
import { getPostImages } from '../../utils/postHelpers';
import { imageUrl } from '../../utils/imageUrl';
import { formatLocation } from '../../utils/location';

function splitColumns(posts) {
  return posts.reduce(
    (cols, post, index) => {
      cols[index % 2].push(post);
      return cols;
    },
    [[], []]
  );
}

export default function SquareScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { posts, 加载完成, refresh, toggleLike } = useSquare();
  const [activeTag, setActiveTag] = useState('all');
  const openAuthorProfile = (post) => {
    navigation.navigate('UserProfile', { profileId: post.authorId, userName: post.userName });
  };
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      if (post.visibility !== 'public') return false;
      if (activeTag === 'all') return true;
      if (post.tag !== activeTag) return false;
      return true;
    });
  }, [posts, activeTag]);
  const columns = splitColumns(filteredPosts);

  const renderPostCard = (post) => (
    <TouchableOpacity
      key={post.id}
      style={styles.postCard}
      activeOpacity={0.82}
      onPress={() => navigation.navigate('PostDetail', { id: post.id })}
    >
      <View style={styles.mediaWrap}>
        <Image source={{ uri: imageUrl(getPostImages(post)[0]) }} style={styles.media} resizeMode="cover" />
        {!!post.location && post.visibility === 'public' && (
          <View style={styles.locationOverlay}>
            <Ionicons name="location" size={10} color={colors.white} />
            <Text style={styles.locationOverlayText} numberOfLines={1}>{post.location ? formatLocation(post.location) : ''}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <TouchableOpacity
          style={styles.authorRow}
          activeOpacity={0.75}
          onPress={(event) => {
            event.stopPropagation();
            openAuthorProfile(post);
          }}
        >
          {post.authorAvatar?.length > 2 ? (
            <Image source={{ uri: imageUrl(post.authorAvatar) }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{post.authorAvatar}</Text>
            </View>
          )}
          <Text style={styles.userName} numberOfLines={1}>{post.userName}</Text>
        </TouchableOpacity>

        {!!post.title && (
          <Text style={styles.postTitle} numberOfLines={2}>{post.title}</Text>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.action}
            onPress={(event) => {
              event.stopPropagation();
              toggleLike(post.id);
            }}
          >
            <Ionicons name={post.liked ? 'heart' : 'heart-outline'} size={16} color={post.liked ? colors.danger : colors.textLight} />
            <Text style={styles.actionText}>{post.likes}</Text>
          </TouchableOpacity>
          <View style={styles.action}>
            <Ionicons name="chatbubble-outline" size={15} color={colors.textLight} />
            <Text style={styles.actionText}>{post.commentCount}</Text>
          </View>

        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={!加载完成} onRefresh={refresh} />}>
        <View style={styles.topRow}>
          <View style={styles.tagTabs}>
            {['all', ...SQUARE_TAGS].map(tag => {
              const active = activeTag === tag;
              return (
                <TouchableOpacity
                  key={tag}
                  style={styles.tagTab}
                  activeOpacity={0.75}
                  onPress={() => setActiveTag(tag)}
                >
                  <Text style={[styles.tagTabText, active && styles.tagTabTextActive]} numberOfLines={1}>
                    {tag === 'all' ? '全部' : tag}
                  </Text>
                  <View style={[styles.tagTabLine, active && styles.tagTabLineActive]} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.masonry}>
          <View style={styles.column}>{columns[0].map(renderPostCard)}</View>
          <View style={styles.column}>{columns[1].map(renderPostCard)}</View>
        </View>

        {filteredPosts.length === 0 && (
          <View style={styles.emptyWrap}>
            <Ionicons name="images-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>还没有帖子</Text>
            <Text style={styles.emptySub}>点击右下角按钮发布第一条</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <Ionicons name="add" size={28} color={colors.secondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: {
    padding: spacing.screenMargin,
    paddingBottom: 96,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 14,
    gap: 8,
  },
  tagTabs: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  tagTab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 4,
  },
  tagTabText: {
    ...typography.captionBold,
    color: colors.textLight,
    marginBottom: 7,
  },
  tagTabTextActive: {
    color: colors.secondary,
  },
  tagTabLine: {
    width: '70%',
    height: 3,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  tagTabLineActive: {
    backgroundColor: colors.secondary,
  },
  masonry: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  postCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    overflow: 'hidden',
  },
  mediaWrap: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#D3E0C8',
    position: 'relative',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  cardBody: {
    padding: 10,
    gap: 7,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(185, 207, 50, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.captionBold, color: colors.secondary },
  userName: { flex: 1, ...typography.captionBold, color: colors.textMain },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.chipDefault,
  },
  tagText: { ...typography.captionBold, color: colors.secondary },
  postTitle: { ...typography.bodyBold, color: colors.textMain },
  locationOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 18,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  locationOverlayText: { ...typography.caption, color: colors.white, fontSize: 11 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 2,
  },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  actionText: { ...typography.caption, color: colors.textLight },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 8,
  },
  emptyText: {
    ...typography.bodyBold,
    color: colors.textLight,
  },
  emptySub: {
    ...typography.caption,
    color: colors.textLight,
  },
});
