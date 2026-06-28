import React, { useRef, useState, useEffect } from 'react';
import {
  View, StyleSheet, Modal, TouchableOpacity, Text, Image, Dimensions,
  SafeAreaView, Animated, PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CROP_SIZE = Math.min(SCREEN_WIDTH - spacing.screenMargin * 2, 300);
const BOTTOM_BAR_HEIGHT = 80;

function dist(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export default function AvatarCropper({ visible, imageUri, onConfirm, onCancel, onReselect }) {
  const [imgSize, setImgSize] = useState(null);

  useEffect(() => {
    setImgSize(null);
    if (imageUri) {
      Image.getSize(imageUri, (w, h) => setImgSize({ w, h }), () => {});
    }
  }, [imageUri]);

  const scale = useRef(new Animated.Value(1)).current;
  const tx = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;

  const s = useRef(1);
  const sx = useRef(0);
  const sy = useRef(0);

  const panRef = useRef(null);

  if (!panRef.current) {
    let savedS = 1, savedX = 0, savedY = 0;
    let startS = 1, startX = 0, startY = 0;
    let initPinch = 0;

    const resetGesture = () => {
      savedS = s.current;
      savedX = sx.current;
      savedY = sy.current;
      startS = s.current;
      startX = sx.current;
      startY = sy.current;
      initPinch = 0;
    };

    panRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: resetGesture,

      onPanResponderMove: (evt, gs) => {
        const touches = evt.nativeEvent.touches;

        if (touches && touches.length >= 2) {
          const d = dist(touches[0].pageX, touches[0].pageY, touches[1].pageX, touches[1].pageY);
          if (initPinch === 0) {
            initPinch = d;
            return;
          }
          const newScale = Math.max(0.5, Math.min(5, startS * (d / initPinch)));
          s.current = newScale;
          scale.setValue(newScale);
        } else if (touches && touches.length === 1) {
          const newX = startX + gs.dx / s.current;
          const newY = startY + gs.dy / s.current;
          sx.current = newX;
          sy.current = newY;
          tx.setValue(newX);
          ty.setValue(newY);
        }
      },

      onPanResponderRelease: resetGesture,
      onPanResponderTerminate: resetGesture,
    });
  }

  const handleReset = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(tx, { toValue: 0, useNativeDriver: true }),
      Animated.spring(ty, { toValue: 0, useNativeDriver: true }),
    ]).start();
    s.current = 1;
    sx.current = 0;
    sy.current = 0;
  };

  const handleConfirm = async () => {
    if (!imageUri) { onCancel(); return; }

    try {
      let result = imageUri;

      if (imgSize) {
        const { w: imgW, h: imgH } = imgSize;
        const containerAspect = SCREEN_WIDTH / SCREEN_HEIGHT;
        const imgAspect = imgW / imgH;
        let displayScale, offsetX, offsetY;
        if (imgAspect > containerAspect) {
          displayScale = SCREEN_WIDTH / imgW;
          offsetX = 0;
          offsetY = (SCREEN_HEIGHT - imgH * displayScale) / 2;
        } else {
          displayScale = SCREEN_HEIGHT / imgH;
          offsetX = (SCREEN_WIDTH - imgW * displayScale) / 2;
          offsetY = 0;
        }

        const cropCenterX = SCREEN_WIDTH / 2;
        const cropCenterY = (SCREEN_HEIGHT - BOTTOM_BAR_HEIGHT) / 2;

        const imgX = (cropCenterX - sx.current - offsetX) / (displayScale * s.current);
        const imgY = (cropCenterY - sy.current - offsetY) / (displayScale * s.current);
        const cropRadius = (CROP_SIZE / 2) / (displayScale * s.current);

        const originX = Math.max(0, imgX - cropRadius);
        const originY = Math.max(0, imgY - cropRadius);
        const cropW = Math.min(cropRadius * 2, imgW - originX);
        const cropH = Math.min(cropRadius * 2, imgH - originY);

        if (cropW > 10 && cropH > 10) {
          const manipulated = await manipulateAsync(
            imageUri,
            [{ crop: { originX: Math.round(originX), originY: Math.round(originY), width: Math.round(cropW), height: Math.round(cropH) } }],
            { compress: 0.8, format: SaveFormat.JPEG }
          );
          result = manipulated.uri;
        }
      }

      onConfirm(result);
    } catch (e) {
      console.warn('[AvatarCropper] crop failed, using original', e);
      onConfirm(imageUri);
    }
  };

  const cropTop = (SCREEN_HEIGHT - BOTTOM_BAR_HEIGHT - CROP_SIZE) / 2;
  const cropLeft = (SCREEN_WIDTH - CROP_SIZE) / 2;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.container}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              transform: [
                { translateX: tx },
                { translateY: ty },
                { scale },
              ],
            },
          ]}
          {...panRef.current.panHandlers}
        >
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
          />
        </Animated.View>

        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={[styles.maskPanel, { top: 0, left: 0, right: 0, height: cropTop }]} />
          <View style={[styles.maskPanel, { top: cropTop, left: 0, width: cropLeft, height: CROP_SIZE }]} />
          <View style={[styles.maskPanel, { top: cropTop, left: cropLeft + CROP_SIZE, right: 0, height: CROP_SIZE }]} />
          <View style={[styles.maskPanel, { top: cropTop + CROP_SIZE, left: 0, right: 0, bottom: BOTTOM_BAR_HEIGHT }]} />

          <View
            style={[styles.circleRing, { top: cropTop, left: cropLeft }]}
          />
        </View>

        <SafeAreaView style={styles.bottomBar}>
          <View style={styles.bottomRow}>
            <TouchableOpacity onPress={onCancel} style={styles.btn}>
              <Ionicons name="close" size={22} color={colors.white} />
              <Text style={styles.btnLabel}>取消</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleReset} style={styles.btn}>
              <Ionicons name="refresh" size={22} color={colors.white} />
              <Text style={styles.btnLabel}>重置</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onReselect} style={styles.btn}>
              <Ionicons name="images" size={22} color={colors.white} />
              <Text style={styles.btnLabel}>重选</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleConfirm} style={styles.confirmBtn}>
              <Text style={styles.confirmLabel}>确定</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  image: { flex: 1, width: '100%', height: '100%' },
  maskPanel: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.5)' },
  circleRing: {
    position: 'absolute', width: CROP_SIZE, height: CROP_SIZE,
    borderRadius: CROP_SIZE / 2, borderWidth: 2, borderColor: colors.white,
  },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: BOTTOM_BAR_HEIGHT },
  bottomRow: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-around', paddingHorizontal: spacing.md,
  },
  btn: { alignItems: 'center', gap: 4, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  btnLabel: { ...typography.caption, color: colors.white },
  confirmBtn: {
    backgroundColor: colors.primary, paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg, borderRadius: spacing.radiusMd,
  },
  confirmLabel: { ...typography.bodyBold, color: colors.white, fontSize: 16 },
});
