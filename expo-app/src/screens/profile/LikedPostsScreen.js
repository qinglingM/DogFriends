import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar } from '../../components';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { getPostImages } from '../../utils/postHelpers';
import { imageUrl } from '../../utils/imageUrl';

function splitColumns(items) {
  return items.reduce((cols, item, index) => {
    cols[index % 2].push(item);
    return cols;
  }, [[], []]);
}

export default function LikedPostsScreen({ navigation }) {
  const { user } = useAuth();
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLikedPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: likes } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('profile_id', user.id);

    if (!likes || likes.length === 0) {
      setLikedPosts([]);
      setLoading(false);
      return;
    }

    const postIds = likes.map(l => l.post_id);
    const { data: rows } = await supabase
      .from('posts')
      .select('*')
      .in('id', postIds)
      .order('created_at', { ascending: false });

    if (!rows) {
      setLikedPosts([]);
      setLoading(false);
      return;
    }

    const profileIds = [...new Set(rows.map(r => r.profile_id).filter(Boolean))];
    let profileMap = {};
    if (profileIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, name, avatar').in('id', profileIds);
      if (profiles) profiles.forEach(p => { profileMap[p.id] = { name: p.name, avatar: p.avatar }; });
    }

    const posts = rows.map(row => ({
      id: row.id,
      authorId: row.profile_id,
      userName: profileMap[row.profile_id]?.name || '未知用户',
      authorAvatar: profileMap[row.profile_id]?.avatar || (profileMap[row.profile_id]?.name || '未知用户').slice(0, 1),
      title: row.title || '',
      tag: row.tag,
      text: row.text || '',
      mediaType: row.media_type || 'image',
      mediaUrl: row.media_url,
      images: row.images || [],
      location: row.location,
      visibility: row.visibility || 'public',
      likes: row.likes_count || 0,
      commentCount: row.comments_count || 0,
      liked: true,
      createdAt: row.created_at,
    }));

    setLikedPosts(posts);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchLikedPosts();
  }, [fetchLikedPosts]);

  const columns = splitColumns(likedPosts);

  const openAuthorProfile = (post) => {
    navigation.navigate('UserProfile', { profileId: post.authorId, userName: post.userName });
  };

  return (
    <View style={styles.screen}>
      <NavBar title="我的点赞" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchLikedPosts} />}
      >
        {likedPosts.length === 0 ? (
          <View style={styles.emptyBlock}>
            <Ionicons name="heart-outline" size={24} color={colors.textLight} />
            <Text style={styles.emptyTitle}>还没有点赞帖子</Text>
            <Text style={styles.emptyText}>在广场看到喜欢的内容，可以点赞支持。</Text>
          </View>
        ) : (
          <View style={styles.masonry}>
            {columns.map((column, columnIndex) => (
              <View key={columnIndex} style={styles.column}>
                {column.map(post => (
                  <TouchableOpacity
                    key={post.id}
                    style={styles.postCard}
                    activeOpacity={0.82}
                    onPress={() => navigation.getParent()?.navigate('Square', { screen: 'PostDetail', params: { id: post.id } })}
                  >
                    <View style={styles.mediaWrap}>
                      <Image source={{ uri: imageUrl(getPostImages(post)[0]) }} style={styles.media} resizeMode="cover" />
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
                        <View style={styles.action}>
                          <Ionicons name="heart" size={16} color={colors.danger} />
                          <Text style={styles.actionText}>{post.likes}</Text>
                        </View>
                        <View style={styles.action}>
                          <Ionicons name="chatbubble-outline" size={15} color={colors.textLight} />
                          <Text style={styles.actionText}>{post.commentCount}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screenMargin, paddingBottom: 48, flexGrow: 1 },
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
    gap: 8,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.captionBold,
    color: colors.secondary,
    fontSize: 10,
  },
  userName: {
    ...typography.captionBold,
    color: colors.textMain,
  },
  postTitle: {
    ...typography.bodyBold,
    color: colors.textMain,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  actionText: {
    ...typography.caption,
    color: colors.textLight,
  },
  emptyBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 80,
  },
  emptyTitle: { ...typography.bodyBold, color: colors.textMain },
  emptyText: { ...typography.caption, color: colors.textLight, textAlign: 'center' },
});
