import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar } from '../../components';
import { useSquare } from '../../contexts/SquareContext';
import { SQUARE_TAGS } from '../../data/squareData';

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
  const { posts, toggleLike, toggleFavorite } = useSquare();
  const [activeTag, setActiveTag] = useState('all');
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
        <Image source={{ uri: post.mediaUrl }} style={styles.media} resizeMode="cover" />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.authorRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{post.authorAvatar}</Text>
          </View>
          <Text style={styles.authorName} numberOfLines={1}>{post.authorName}</Text>
        </View>

        {!!post.tag && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{post.tag}</Text>
          </View>
        )}

        <Text style={styles.postText} numberOfLines={3}>{post.text}</Text>

        {!!post.location && post.visibility === 'public' && (
          <View style={styles.locationRow}>
            <Ionicons name="location" size={12} color={colors.textLight} />
            <Text style={styles.locationText} numberOfLines={1}>{post.location}</Text>
          </View>
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
            <Text style={styles.actionText}>{post.comments.length}</Text>
          </View>
          <TouchableOpacity
            style={styles.action}
            onPress={(event) => {
              event.stopPropagation();
              toggleFavorite(post.id);
            }}
          >
            <Ionicons name={post.favorited ? 'bookmark' : 'bookmark-outline'} size={15} color={post.favorited ? colors.secondary : colors.textLight} />
            <Text style={styles.actionText}>{post.favorites}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <NavBar
        title="广场"
        rightIcon="add"
        rightAction={() => navigation.navigate('CreatePost')}
      />

      <ScrollView contentContainerStyle={styles.content}>
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

        <View style={styles.masonry}>
          <View style={styles.column}>{columns[0].map(renderPostCard)}</View>
          <View style={styles.column}>{columns[1].map(renderPostCard)}</View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: {
    padding: spacing.screenMargin,
    paddingBottom: 96,
  },
  tagTabs: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 14,
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
  authorName: { flex: 1, ...typography.captionBold, color: colors.textMain },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.chipDefault,
  },
  tagText: { ...typography.captionBold, color: colors.secondary },
  postText: { ...typography.caption, color: colors.textMain },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: { flex: 1, ...typography.caption, color: colors.textLight },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  actionText: { ...typography.caption, color: colors.textLight },
});
