import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { INITIAL_POSTS } from '../data/squareData';

const SquareContext = createContext(null);

const initialState = {
  posts: INITIAL_POSTS,
};

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_POST':
      return { ...state, posts: [action.post, ...state.posts] };

    case 'TOGGLE_LIKE':
      return {
        ...state,
        posts: state.posts.map(post => {
          if (post.id !== action.id) return post;
          const liked = !post.liked;
          return { ...post, liked, likes: post.likes + (liked ? 1 : -1) };
        }),
      };

    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        posts: state.posts.map(post => {
          if (post.id !== action.id) return post;
          const favorited = !post.favorited;
          return { ...post, favorited, favorites: post.favorites + (favorited ? 1 : -1) };
        }),
      };

    case 'ADD_COMMENT':
      return {
        ...state,
        posts: state.posts.map(post => {
          if (post.id !== action.id) return post;
          return {
            ...post,
            comments: [
              ...post.comments,
              {
                id: `comment_${Date.now()}`,
                authorName: '小明',
                text: action.text,
                likes: 0,
                liked: false,
              },
            ],
          };
        }),
      };

    case 'TOGGLE_COMMENT_LIKE':
      return {
        ...state,
        posts: state.posts.map(post => {
          if (post.id !== action.postId) return post;
          return {
            ...post,
            comments: post.comments.map(comment => {
              if (comment.id !== action.commentId) return comment;
              const liked = !comment.liked;
              return { ...comment, liked, likes: comment.likes + (liked ? 1 : -1) };
            }),
          };
        }),
      };

    default:
      return state;
  }
}

export function SquareProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addPost = useCallback((draft) => {
    dispatch({
      type: 'ADD_POST',
      post: {
        id: `post_${Date.now()}`,
        authorName: '小明',
        authorAvatar: 'M',
        likes: 0,
        comments: [],
        favorites: 0,
        liked: false,
        favorited: false,
        createdAt: new Date().toISOString().slice(0, 10),
        ...draft,
      },
    });
  }, []);

  const toggleLike = useCallback(id => dispatch({ type: 'TOGGLE_LIKE', id }), []);
  const toggleFavorite = useCallback(id => dispatch({ type: 'TOGGLE_FAVORITE', id }), []);
  const addComment = useCallback((id, text) => dispatch({ type: 'ADD_COMMENT', id, text }), []);
  const toggleCommentLike = useCallback((postId, commentId) => {
    dispatch({ type: 'TOGGLE_COMMENT_LIKE', postId, commentId });
  }, []);

  const value = useMemo(() => ({
    ...state,
    addPost,
    toggleLike,
    toggleFavorite,
    addComment,
    toggleCommentLike,
    getPost: id => state.posts.find(post => post.id === id),
  }), [state, addPost, toggleLike, toggleFavorite, addComment, toggleCommentLike]);

  return <SquareContext.Provider value={value}>{children}</SquareContext.Provider>;
}

export function useSquare() {
  const ctx = useContext(SquareContext);
  if (!ctx) throw new Error('useSquare must be used inside <SquareProvider>');
  return ctx;
}
