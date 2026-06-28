import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { imageUrl } from '../utils/imageUrl';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ImageViewer({ visible, images, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scales, setScales] = useState({});

  const openIndex = initialIndex;
  if (visible && currentIndex !== openIndex && scales[currentIndex] === 1) {
    setCurrentIndex(openIndex);
  }

  const goNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(i => i + 1);
    }
  }, [currentIndex, images.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    }
  }, [currentIndex]);

  const handleScroll = useCallback((e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  }, [currentIndex]);

  if (!images || images.length === 0) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <View style={s.header}>
          <Text style={s.counter}>{currentIndex + 1} / {images.length}</Text>
          <TouchableOpacity style={s.closeBtn} onPress={(e) => { e.stopPropagation(); onClose(); }} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={s.body}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={100}
            contentContainerStyle={s.scrollContent}
          >
            {images.map((uri, index) => (
              <ScrollView
                key={index}
                contentContainerStyle={s.imageWrapper}
                maximumZoomScale={3}
                minimumZoomScale={1}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              >
                <Image source={{ uri: imageUrl(uri) }} style={s.image} resizeMode="contain" />
              </ScrollView>
            ))}
          </ScrollView>

          {currentIndex > 0 && (
            <TouchableOpacity style={[s.navBtn, s.navBtnLeft]} onPress={(e) => { e.stopPropagation(); goPrev(); }} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={28} color={colors.white} />
            </TouchableOpacity>
          )}
          {currentIndex < images.length - 1 && (
            <TouchableOpacity style={[s.navBtn, s.navBtnRight]} onPress={(e) => { e.stopPropagation(); goNext(); }} activeOpacity={0.7}>
              <Ionicons name="chevron-forward" size={28} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>

        {images.length > 1 && (
          <View style={s.footer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[s.dot, index === currentIndex && s.dotActive]}
              />
            ))}
          </View>
        )}
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 50,
    paddingBottom: spacing.md,
  },
  counter: {
    ...typography.bodyBold,
    color: colors.white,
    fontSize: 16,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    alignItems: 'center',
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 200,
    resizeMode: 'contain',
  },
  navBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  navBtnLeft: {
    left: 12,
  },
  navBtnRight: {
    right: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 34,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: colors.white,
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
});