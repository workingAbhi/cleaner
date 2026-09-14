import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '../../../core/theme';

interface ShimmerProps {
  width: DimensionValue;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * A single shimmer bone — slides a lighter highlight left-to-right
 * over a grey base using only React Native's built-in Animated API.
 * No external dependency required.
 */
const Shimmer = ({
  width,
  height,
  borderRadius = 8,
  style,
}: ShimmerProps) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <View style={[{ width, height, borderRadius }, style]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { borderRadius, backgroundColor: Colors.disabled, opacity },
        ]}
      />
    </View>
  );
};

/**
 * Skeleton card that mirrors the layout of InspectionPhotoCard exactly:
 *  - title line
 *  - image block  (height 220, borderRadius 12)
 *  - status line
 *  - two action buttons
 */
export const InspectionPhotoCardSkeleton = () => (
  <View style={styles.card}>
    {/* title */}
    <Shimmer width="55%" height={16} borderRadius={6} style={styles.mb10} />

    {/* image */}
    <Shimmer width="100%" height={220} borderRadius={12} style={styles.mb10} />

    {/* status line */}
    <Shimmer width="40%" height={13} borderRadius={5} style={styles.mb12} />

    {/* two buttons */}
    <View style={styles.buttonRow}>
      <Shimmer width="48%" height={40} borderRadius={10} />
      <Shimmer width="48%" height={40} borderRadius={10} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
  },
  mb10: { marginBottom: 10 },
  mb12: { marginBottom: 12 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default Shimmer;
