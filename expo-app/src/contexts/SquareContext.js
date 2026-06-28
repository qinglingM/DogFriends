import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const SquareContext = createContext(null);

async function buildNameMap(profileIds) {
  const ids = [...new Set(profileIds.filter(Boolean))];
  if (ids.length === 0) return {};
  const { data } = await supabase.from('profiles').select('id, name').in('id', ids);
  const map = {};
  if (data) data.forEach(p => { map[p.id] = p.name; });
  return map;
}

function flatToTree(flatComments, likedMap) {
  const map = {};
  const roots = [];

  flatComments.forEach(c => {
    map[c.id] = {
      id: c.id,
      userName: c._userName || '未知用户',
      text: c.text,
      likes: c.likes_count || 0,
      liked: !!likedMap[c.id],
      replyTo: c.reply_to_name,
      replies: [],
      createdAt: c.created_at,
    };
  });

  flatComments.forEach(c => {
    if (c.parent_id && map[c.parent_id]) {
      map[c.parent_id].replies.push(map[c.id]);
    } else if (!c.parent_id) {
      roots.push(map[c.id]);
    }
  });

  return roots;
}

function rowToPost(row, likedMap, favMap, authorName) {
  return {
    id: row.id,
    userName: authorName,
    authorAvatar: authorName.slice(0, 1),
    title: row.title || '',
    tag: row.tag,
    text: row.text || '',
    mediaType: row.media_type || 'image',
    mediaUrl: row.media_url,
    images: row.images || [],
    location: row.location,
    visibility: row.visibility || 'public',
    likes: row.likes_count || 0,
    comments: [],
    favorites: row.favorites_count || 0,
    liked: !!likedMap[row.id],
    favorited: !!favMap[row.id],
    createdAt: row.created_at,
  };
}

const initialState = { posts: [], 加载完成: false };

function reducer(state, action) {
  switch (action.type) {
    case 'SET_POSTS':
      return { ...state, posts: action.posts, 加载完成: true };
    case 'SET_LOADING':
      return { ...state, 加载完成: false };
    case 'ADD_POST':
      return { ...state, posts: [action.post, ...state.posts] };
    case 'UPDATE_POST':
      return {
        ...state,
        posts: state.posts.map(p => p.id === action.postId ? { ...p, ...action.updates } : p),
      };
    case 'SET_COMMENTS': {
      const { postId, comments } = action;
      return {
        ...state,
        posts: state.posts.map(p => p.id === postId ? { ...p, comments } : p),
      };
    }
    default:
      return state;
  }
}

export function SquareProvider({ children }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!user) return;
    fetchPosts();
  }, [user]);

  async function fetchPosts() {
    const { data: rows, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('fetchPosts error', fetchError);
    }
    if (!rows) return;

    const nameMap = await buildNameMap(rows.map(r => r.profile_id));

    let likedMap = {};
    let favMap = {};

    if (user) {
      const postIds = rows.map(r => r.id);
      const [likesRes, favsRes] = await Promise.all([
        supabase.from('post_likes').select('post_id').in('post_id', postIds).eq('profile_id', user.id),
        supabase.from('post_favorites').select('post_id').in('post_id', postIds).eq('profile_id', user.id),
      ]);
      if (likesRes.data) likesRes.data.forEach(l => { likedMap[l.post_id] = true; });
      if (favsRes.data) favsRes.data.forEach(f => { favMap[f.post_id] = true; });
    }

    const posts = rows.map(r => rowToPost(r, likedMap, favMap, nameMap[r.profile_id] || '未知用户'));
    dispatch({ type: 'SET_POSTS', posts });

    const allRows = rows;
    const { data: commentRows } = await supabase
      .from('post_comments')
      .select('*')
      .in('post_id', allRows.map(r => r.id))
      .order('created_at', { ascending: true });

    if (commentRows && user) {
      const commentNameMap = await buildNameMap(commentRows.map(r => r.profile_id));
      commentRows.forEach(c => { c._userName = commentNameMap[c.profile_id] || '未知用户'; });

      const { data: clRows } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .in('comment_id', commentRows.map(r => r.id))
        .eq('profile_id', user.id);

      const commentLikedMap = {};
      if (clRows) clRows.forEach(cl => { commentLikedMap[cl.comment_id] = true; });

      const postsWithComments = {};
      commentRows.forEach(c => {
        if (!postsWithComments[c.post_id]) postsWithComments[c.post_id] = [];
        postsWithComments[c.post_id].push(c);
      });

      Object.entries(postsWithComments).forEach(([postId, flat]) => {
        const tree = flatToTree(flat, commentLikedMap);
        dispatch({ type: 'SET_COMMENTS', postId, comments: tree });
      });
    }
  }

  const addPost = useCallback(async (draft) => {
    const row = {
      profile_id: user.id,
      title: draft.title || '',
      tag: draft.tag || null,
      text: draft.text || null,
      media_type: draft.mediaType || 'image',
      media_url: draft.mediaUrl || null,
      images: draft.images || [],
      location: draft.location || null,
      visibility: draft.visibility || 'public',
    };

    const { data, error } = await supabase
      .from('posts')
      .insert(row)
      .select()
      .single();

    if (!error && data) {
      const nameMap = await buildNameMap([data.profile_id]);
      const post = rowToPost(data, {}, {}, nameMap[data.profile_id] || '未知用户');
      dispatch({ type: 'ADD_POST', post });
    }
    return { data, error };
  }, [user]);

  const toggleLike = useCallback(async (postId) => {
    const existing = state.posts.find(p => p.id === postId);
    if (!existing) return;

    const wasLiked = existing.liked;
    dispatch({
      type: 'UPDATE_POST',
      postId,
      updates: { liked: !wasLiked, likes: existing.likes + (wasLiked ? -1 : 1) },
    });

    if (wasLiked) {
      await supabase.from('post_likes').delete().match({ post_id: postId, profile_id: user.id });
      await supabase.rpc('decrement_post_likes', { row_id: postId });
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, profile_id: user.id });
      await supabase.rpc('increment_post_likes', { row_id: postId });
    }
  }, [state.posts, user]);

  const toggleFavorite = useCallback(async (postId) => {
    const existing = state.posts.find(p => p.id === postId);
    if (!existing) return;

    const wasFav = existing.favorited;
    dispatch({
      type: 'UPDATE_POST',
      postId,
      updates: { favorited: !wasFav, favorites: existing.favorites + (wasFav ? -1 : 1) },
    });

    if (wasFav) {
      await supabase.from('post_favorites').delete().match({ post_id: postId, profile_id: user.id });
      await supabase.rpc('decrement_post_favorites', { row_id: postId });
    } else {
      await supabase.from('post_favorites').insert({ post_id: postId, profile_id: user.id });
      await supabase.rpc('increment_post_favorites', { row_id: postId });
    }
  }, [state.posts, user]);

  const addComment = useCallback(async (postId, text) => {
    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, profile_id: user.id, text })
      .select()
      .single();

    if (!error && data) {
      const nameMap = await buildNameMap([data.profile_id]);
      const existing = state.posts.find(p => p.id === postId);
      const comment = {
        id: data.id,
        userName: nameMap[data.profile_id] || '未知用户',
        text: data.text,
        likes: 0,
        liked: false,
        replies: [],
        createdAt: data.created_at,
      };
      dispatch({
        type: 'UPDATE_POST',
        postId,
        updates: { comments: [...(existing?.comments || []), comment] },
      });
      await supabase.rpc('increment_post_comments', { row_id: postId });
    }
  }, [state.posts, user]);

  const addCommentReply = useCallback(async (postId, targetId, replyTo, text) => {
    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, parent_id: targetId, profile_id: user.id, text, reply_to_name: replyTo })
      .select()
      .single();

    if (!error && data) {
      const nameMap = await buildNameMap([data.profile_id]);
      const existing = state.posts.find(p => p.id === postId);
      if (!existing) return;

      const reply = {
        id: data.id,
        userName: nameMap[data.profile_id] || '未知用户',
        replyTo,
        text: data.text,
        likes: 0,
        liked: false,
        replies: [],
        createdAt: data.created_at,
      };

      const newComments = appendReplyToThread(existing.comments, targetId, reply);
      dispatch({ type: 'UPDATE_POST', postId, updates: { comments: newComments } });
      await supabase.rpc('increment_post_comments', { row_id: postId });
    }
  }, [state.posts, user]);

  const toggleCommentLike = useCallback(async (postId, commentId) => {
    const existing = state.posts.find(p => p.id === postId);
    if (!existing) return;

    const newComments = toggleThreadLike(existing.comments, commentId);
    dispatch({ type: 'UPDATE_POST', postId, updates: { comments: newComments } });

    const target = findComment(existing.comments, commentId);
    if (!target) return;

    if (target.liked) {
      await supabase.from('comment_likes').insert({ comment_id: commentId, profile_id: user.id });
      await supabase.rpc('increment_comment_likes', { row_id: commentId });
    } else {
      await supabase.from('comment_likes').delete().match({ comment_id: commentId, profile_id: user.id });
      await supabase.rpc('decrement_comment_likes', { row_id: commentId });
    }
  }, [state.posts, user]);

  const getPost = useCallback((id) => state.posts.find(p => p.id === id), [state.posts]);

  const refresh = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' });
    await fetchPosts();
  }, [user]);

  const value = useMemo(() => ({
    posts: state.posts,
    加载完成: state.加载完成,
    addPost,
    toggleLike,
    toggleFavorite,
    addComment,
    addCommentReply,
    toggleCommentLike,
    getPost,
    refresh,
  }), [state.posts, state.加载完成, addPost, toggleLike, toggleFavorite, addComment, addCommentReply, toggleCommentLike, getPost, refresh]);

  return <SquareContext.Provider value={value}>{children}</SquareContext.Provider>;
}

export function useSquare() {
  const ctx = useContext(SquareContext);
  if (!ctx) throw new Error('useSquare must be used inside <SquareProvider>');
  return ctx;
}

function appendReplyToThread(comments, targetId, reply) {
  return comments.map(comment => {
    if (comment.id === targetId) {
      return { ...comment, replies: [...(comment.replies || []), reply] };
    }
    if (comment.replies?.length) {
      return { ...comment, replies: appendReplyToThread(comment.replies, targetId, reply) };
    }
    return comment;
  });
}

function toggleThreadLike(comments, targetId) {
  return comments.map(comment => {
    if (comment.id === targetId) {
      const liked = !comment.liked;
      return { ...comment, liked, likes: (comment.likes || 0) + (liked ? 1 : -1) };
    }
    if (comment.replies?.length) {
      return { ...comment, replies: toggleThreadLike(comment.replies, targetId) };
    }
    return comment;
  });
}

function findComment(comments, targetId) {
  for (const c of comments) {
    if (c.id === targetId) return c;
    if (c.replies?.length) {
      const found = findComment(c.replies, targetId);
      if (found) return found;
    }
  }
  return null;
}
