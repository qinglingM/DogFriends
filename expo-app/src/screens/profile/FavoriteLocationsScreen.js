import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { NavBar, Card } from '../../components';
import { useExplore } from '../../contexts/ExploreContext';
import { useSquare } from '../../contexts/SquareContext';
import { getPostImages } from '../../utils/postHelpers';
import { CATEGORIES } from '../../data/exploreData';
import { getCategoryIcon } from '../../data/profileData';
import CityPickerModal from '../../components/CityPickerModal';

function LocationThumbnail({ location }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = location.thumbnailUrl && !imageFailed;

  return (
    <View style={styles.thumbnail}>
      {showImage ? (
        <Image
          source={{ uri: location.thumbnailUrl }}
          style={styles.thumbnailImage}
          resizeMode="cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <Ionicons name={getCategoryIcon(location.category)} size={18} color={colors.secondary} />
      )}
    </View>
  );
}

function splitColumns(items) {
  return items.reduce(
    (cols, item, index) => {
      cols[index % 2].push(item);
      return cols;
    },
    [[], []]
  );
}

export default function FavoriteLocationsScreen({ navigation }) {
  const { locations, favorites, toggleFavorite } = useExplore();
  const { posts, toggleFavorite: togglePostFavorite } = useSquare();
  const [contentType, setContentType] = useState('locations');
  const [city, setCity] = useState('all');
  const [category, setCategory] = useState('all');
  const [openFilter, setOpenFilter] = useState(null);
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const favoriteLocations = locations.filter(loc => favorites[loc.id]);
  const favoritePosts = posts.filter(post => post.favorited);
  const postColumns = splitColumns(favoritePosts);
  const visibleCities = useMemo(() => {
    const cities = Array.from(new Set(favoriteLocations.map(loc => loc.city || '上海')));
    return ['all', ...cities];
  }, [favoriteLocations]);
  const visibleCategories = useMemo(() => {
    const cityFiltered = city === 'all'
      ? favoriteLocations
      : favoriteLocations.filter(loc => (loc.city || '上海') === city);
    const favoriteCategoryKeys = new Set(cityFiltered.map(loc => loc.category));
    return CATEGORIES.filter(cat => cat.key === 'all' || favoriteCategoryKeys.has(cat.key));
  }, [favoriteLocations, city]);
  const filteredLocations = useMemo(() => {
    return favoriteLocations.filter(loc => {
      if (city !== 'all' && (loc.city || '上海') !== city) return false;
      if (category !== 'all' && loc.category !== category) return false;
      return true;
    });
  }, [favoriteLocations, city, category]);

  const selectCity = (nextCity) => {
    setCity(nextCity);
    setCategory('all');
    setOpenFilter(null);
  };

  const selectCategory = (nextCategory) => {
    setCategory(nextCategory);
    setOpenFilter(null);
  };

  const selectedCityLabel = city === 'all' ? '全部城市' : city;
  const selectedCategoryLabel = visibleCategories.find(cat => cat.key === category)?.label || '全部';

  return (
    <View style={styles.screen}>
      <NavBar title="我的收藏" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.segment}>
          <TouchableOpacity
            style={[styles.segmentItem, contentType === 'locations' && styles.segmentItemActive]}
            onPress={() => {
              setContentType('locations');
              setOpenFilter(null);
            }}
          >
            <Text style={[styles.segmentText, contentType === 'locations' && styles.segmentTextActive]}>我收藏的地点</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentItem, contentType === 'posts' && styles.segmentItemActive]}
            onPress={() => {
              setContentType('posts');
              setOpenFilter(null);
            }}
          >
            <Text style={[styles.segmentText, contentType === 'posts' && styles.segmentTextActive]}>我收藏的帖子</Text>
          </TouchableOpacity>
        </View>

        {contentType === 'locations' && (
          <View style={styles.filterBar}>
            <TouchableOpacity
              style={[styles.filterBox, styles.filterBoxActive]}
              activeOpacity={0.75}
              onPress={() => setCityPickerOpen(true)}
            >
              <Ionicons name="location" size={16} color={colors.secondary} />
              <Text style={styles.filterBoxText} numberOfLines={1}>{selectedCityLabel}</Text>
              <Ionicons name="chevron-down" size={14} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterBox, openFilter === 'category' && styles.filterBoxActive]}
              activeOpacity={0.75}
              onPress={() => setOpenFilter(openFilter === 'category' ? null : 'category')}
            >
              <Ionicons name="options-outline" size={16} color={colors.secondary} />
              <Text style={styles.filterBoxText} numberOfLines={1}>{selectedCategoryLabel}</Text>
              <Ionicons name={openFilter === 'category' ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        )}

        {contentType === 'locations' && openFilter && (
          <Card noPadding style={styles.filterMenu}>
            {visibleCategories.map(option => {
              const key = option.key;
              const label = option.label;
              const icon = option.icon;
              const active = key === category;

              return (
                <TouchableOpacity
                  key={key}
                  style={styles.filterMenuItem}
                  activeOpacity={0.75}
                  onPress={() => selectCategory(key)}
                >
                  <Ionicons name={icon} size={16} color={colors.secondary} />
                  <Text style={styles.filterMenuText}>{label}</Text>
                  {active && <Ionicons name="checkmark" size={18} color={colors.secondary} />}
                </TouchableOpacity>
              );
            })}
          </Card>
        )}

        {contentType === 'locations' ? (
          <Card noPadding style={styles.listCard}>
            {filteredLocations.length === 0 ? (
              <View style={styles.emptyBlock}>
                <Ionicons name="bookmark-outline" size={24} color={colors.textLight} />
                <Text style={styles.emptyTitle}>{favoriteLocations.length === 0 ? '还没有收藏地点' : '这个分类下没有收藏'}</Text>
                <Text style={styles.emptyText}>
                  {favoriteLocations.length === 0 ? '看到适合带狗去的地方，可以先收藏起来。' : '切换分类看看其他收藏地点。'}
                </Text>
              </View>
            ) : (
              filteredLocations.map((location, index) => (
                <TouchableOpacity
                  key={location.id}
                  style={[styles.listItem, index === filteredLocations.length - 1 && styles.listItemLast]}
                  activeOpacity={0.75}
                  onPress={() => navigation.navigate('LocationDetail', { id: location.id })}
                  onLongPress={() => toggleFavorite(location.id)}
                >
                  <LocationThumbnail location={location} />
                  <View style={styles.listMain}>
                    <Text style={styles.listTitle} numberOfLines={1}>{location.name}</Text>
                    <Text style={styles.listMeta} numberOfLines={1}>
                      {location.categoryLabel} · {location.city || '上海'}
                    </Text>
                    <Text style={styles.listSub} numberOfLines={1}>{location.lastUpdatedLabel}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
                </TouchableOpacity>
              ))
            )}
          </Card>
        ) : favoritePosts.length === 0 ? (
          <View style={styles.emptyBlock}>
            <Ionicons name="bookmark-outline" size={24} color={colors.textLight} />
            <Text style={styles.emptyTitle}>还没有收藏帖子</Text>
            <Text style={styles.emptyText}>在广场看到有用内容，可以先收藏起来。</Text>
          </View>
        ) : (
          <View style={styles.postMasonry}>
            {postColumns.map((column, columnIndex) => (
              <View key={columnIndex} style={styles.postColumn}>
                {column.map(post => (
                  <TouchableOpacity
                    key={post.id}
                    style={styles.postCard}
                    activeOpacity={0.82}
                    onPress={() => navigation.getParent()?.navigate('Square', { screen: 'PostDetail', params: { id: post.id } })}
                  >
                    <Image source={{ uri: getPostImages(post)[0] }} style={styles.postImage} resizeMode="cover" />
                    <View style={styles.postBody}>
                      <Text style={styles.postText} numberOfLines={3}>{post.text}</Text>
                      <View style={styles.postActions}>
                        <View style={styles.postAction}>
                          <Ionicons name="heart-outline" size={14} color={colors.textLight} />
                          <Text style={styles.postActionText}>{post.likes}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.postAction}
                          onPress={(event) => {
                            event.stopPropagation();
                            togglePostFavorite(post.id);
                          }}
                        >
                          <Ionicons name="bookmark" size={14} color={colors.secondary} />
                          <Text style={styles.postActionText}>{post.favorites}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <CityPickerModal
        visible={cityPickerOpen}
        province={null}
        city={city === 'all' ? null : city}
        onConfirm={({ city: pickedCity }) => {
          selectCity(pickedCity || 'all');
          setCityPickerOpen(false);
        }}
        onCancel={() => setCityPickerOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screenMargin, paddingBottom: 48 },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    padding: 4,
    marginBottom: 12,
  },
  segmentItem: {
    flex: 1,
    minHeight: 40,
    borderRadius: spacing.radiusSm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentItemActive: {
    backgroundColor: colors.primary,
  },
  segmentText: { ...typography.bodyBold, color: colors.textLight },
  segmentTextActive: { color: colors.secondary },
  filterBar: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 12,
  },
  filterBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: spacing.radiusMd,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBoxActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(185, 207, 50, 0.12)',
  },
  filterBoxText: {
    flex: 1,
    ...typography.bodyBold,
    color: colors.textMain,
  },
  filterMenu: {
    marginTop: -4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  filterMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  filterMenuText: { flex: 1, ...typography.bodyBold, color: colors.textMain },
  listCard: { overflow: 'hidden' },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 88,
  },
  listItemLast: { borderBottomWidth: 0 },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(185, 207, 50, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  listMain: { flex: 1, minWidth: 0 },
  listTitle: { ...typography.bodyBold, color: colors.textMain, marginBottom: 2 },
  listMeta: { ...typography.caption, color: colors.textLight },
  listSub: { ...typography.captionBold, color: colors.secondary, marginTop: 4 },
  emptyBlock: {
    alignItems: 'center',
    padding: spacing.lg,
    gap: 6,
  },
  emptyTitle: { ...typography.bodyBold, color: colors.textMain },
  emptyText: { ...typography.caption, color: colors.textLight, textAlign: 'center' },
  postMasonry: {
    flexDirection: 'row',
    gap: 12,
  },
  postColumn: {
    flex: 1,
    gap: 12,
  },
  postCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#D3E0C8',
  },
  postBody: {
    padding: 10,
    gap: 8,
  },
  postText: { ...typography.caption, color: colors.textMain },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  postActionText: { ...typography.caption, color: colors.textLight },
});
