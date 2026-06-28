import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, DogAvatar } from '../../components';

const NOTIFICATIONS = [
  { id: 'n1', type: 'like', userName: '豆豆妈妈', postId: 'post_1', message: '赞了你的动态', time: '2分钟前' },
  { id: 'n2', type: 'comment', userName: '可乐姐姐', postId: 'post_2', message: '评论了你: "好可爱！"', time: '1小时前' },
  { id: 'n3', type: 'bookmark', userName: '布丁爸', postId: 'post_3', message: '收藏了你的动态', time: '昨天' },
  { id: 'n4', type: 'like', userName: '栗子', postId: 'post_1', message: '赞了你的动态', time: '3天前' },
  { id: 'n5', type: 'comment', userName: '阿黄爸爸', postId: 'post_4', message: '回复了你: "下次一起"', time: '5天前' },
  { id: 'n6', type: 'like', userName: '狗蛋爸爸', postId: 'post_2', message: '赞了你的动态', time: '1周前' },
];

const TYPE_CONFIG = {
  like: { icon: 'heart', color: '#E74C3C', bg: 'rgba(231,76,60,0.1)' },
  comment: { icon: 'chatbubble', color: colors.secondary, bg: 'rgba(52,112,72,0.1)' },
  bookmark: { icon: 'bookmark', color: colors.accent, bg: 'rgba(146,102,153,0.1)' },
};

export default function NotificationScreen({ navigation }) {
  const handlePress = (item) => {
    navigation.navigate('Square', {
      screen: 'PostDetail',
      params: { id: item.postId },
    });
  };

  const renderItem = ({ item }) => {
    const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.like;
    return (
      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.7}
        onPress={() => handlePress(item)}
      >
        <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={20} color={cfg.color} />
        </View>
        <View style={styles.content}>
          <Text style={styles.message}>
            <Text style={styles.userName}>{item.userName}</Text>
            {` ${item.message}`}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Ionicons name="chevron-forward" size={14} color={colors.textLight} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <NavBar title="互动消息" onBack={() => navigation.goBack()} />
      <FlatList
        data={NOTIFICATIONS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-outline" size={48} color={colors.secondary} style={{ opacity: 0.3 }} />
            <Text style={styles.emptyTitle}>暂无消息</Text>
            <Text style={styles.emptyText}>当有人与你互动时，会显示在这里</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { paddingVertical: spacing.sm },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    padding: spacing.md, backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    minHeight: 72,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { flex: 1, gap: 4 },
  userName: { ...typography.bodyBold, color: colors.secondary, fontSize: 15 },
  message: { ...typography.body, color: colors.textMain, fontSize: 14 },
  time: { ...typography.caption, color: colors.textLight },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyTitle: { ...typography.bodyBold, color: colors.textMain },
  emptyText: { ...typography.caption, color: colors.textLight },
});
