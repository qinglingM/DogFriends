import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar } from '../../components';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatArea } from '../../data/cityData';

export default function FollowListScreen({ navigation, route }) {
  const type = route.params?.type || 'following';
  const title = type === 'following' ? '关注' : '粉丝';
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        if (type === 'following') {
          const { data, error } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', user.id);
          if (error) console.error('follows query error', error);
          const ids = data?.map(r => r.following_id) || [];
          if (ids.length > 0) {
            const { data: profiles, error: pErr } = await supabase
              .from('profiles')
              .select('id, name, avatar, province, city, following, followers')
              .in('id', ids);
            if (pErr) console.error('profiles query error', pErr);
            setUsers((profiles || []).map(p => ({ ...p, area: formatArea(p.province, p.city) })));
          }
        } else {
          const { data, error } = await supabase
            .from('follows')
            .select('follower_id')
            .eq('following_id', user.id);
          if (error) console.error('follows query error', error);
          const ids = data?.map(r => r.follower_id) || [];
          if (ids.length > 0) {
            const { data: profiles, error: pErr } = await supabase
              .from('profiles')
              .select('id, name, avatar, province, city, following, followers')
              .in('id', ids);
            if (pErr) console.error('profiles query error', pErr);
            setUsers((profiles || []).map(p => ({ ...p, area: formatArea(p.province, p.city) })));
          }
        }
      } catch (e) {
        console.error('FollowList load error', e);
      }
      setLoading(false);
    })();
  }, [user, type]);

  const openProfile = (item) => {
    navigation.navigate('PersonalProfile', { userName: item.name });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.7}
      onPress={() => openProfile(item)}
    >
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.chipDefault }]}>
          <Ionicons name="person" size={24} color={colors.textLight} />
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.level}>{item.area || ''}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <NavBar title={title} onBack={() => navigation.goBack()} />
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>暂无{title}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { paddingVertical: spacing.sm },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 12 },
  emptyText: { ...typography.bodyBold, color: colors.textLight },
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
});
