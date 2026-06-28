import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar } from '../../components';
import { USER_PROFILES } from '../../data/userProfiles';

const USERS = Object.values(USER_PROFILES);

export default function FollowListScreen({ navigation, route }) {
  const type = route.params?.type || 'following';
  const title = type === 'following' ? '关注' : '粉丝';
  const [followed, setFollowed] = useState(new Set());

  const toggleFollow = (name) => {
    setFollowed(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const openProfile = (name) => {
    navigation.navigate('PersonalProfile', { userName: name });
  };

  const renderItem = ({ item }) => {
    const isFollowed = followed.has(item.name);
    return (
      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.7}
        onPress={() => openProfile(item.name)}
      >
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.level}>{item.level} · {item.area}</Text>
        </View>
        <TouchableOpacity
          style={[styles.followBtn, isFollowed && styles.followedBtn]}
          activeOpacity={0.7}
          onPress={(e) => { e.stopPropagation(); toggleFollow(item.name); }}
        >
          <Text style={[styles.followBtnText, isFollowed && styles.followedBtnText]}>
            {isFollowed ? '已关注' : '关注'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <NavBar title={title} onBack={() => navigation.goBack()} />
      <FlatList
        data={USERS}
        keyExtractor={item => item.name}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { paddingVertical: spacing.sm },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    minHeight: 72,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.chipDefault,
  },
  info: { flex: 1, gap: 2 },
  name: { ...typography.bodyBold, color: colors.secondary, fontSize: 16 },
  level: { ...typography.caption, color: colors.textLight },
  followBtn: {
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    borderRadius: spacing.radiusPill,
    backgroundColor: colors.secondary,
    minWidth: 72, alignItems: 'center',
  },
  followedBtn: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  followBtnText: { ...typography.captionBold, color: colors.white, fontSize: 13 },
  followedBtnText: { color: colors.textLight },
});
