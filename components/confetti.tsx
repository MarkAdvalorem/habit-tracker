import React, { useEffect, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface ConfettiPieceData {
  id: string;
  left: number;
  delay: number;
  duration: number;
  rotation: number;
  color: string;
}

const COLORS = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6B9D', '#C44569'];

export function Confetti({ isActive, onComplete }: { isActive: boolean; onComplete?: () => void }) {
  const windowWidth = useWindowDimensions().width;
  const windowHeight = useWindowDimensions().height;
  const [pieces, setPieces] = useState<ConfettiPieceData[]>([]);

  useEffect(() => {
    if (!isActive) {
      setPieces([]);
      return;
    }

    // Generate confetti pieces
    const newPieces: ConfettiPieceData[] = Array.from({ length: 50 }, (_, i) => ({
      id: `${i}`,
      left: Math.random() * windowWidth,
      delay: Math.random() * 200,
      duration: 2000 + Math.random() * 1000,
      rotation: Math.random() * 360,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    setPieces(newPieces);

    // Call onComplete after animation finishes
    const timer = setTimeout(() => {
      setPieces([]);
      onComplete?.();
    }, 3500);

    return () => clearTimeout(timer);
  }, [isActive, windowWidth, windowHeight, onComplete]);

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: windowWidth,
        height: windowHeight,
        overflow: 'hidden',
      }}
    >
      {pieces.map((piece) => (
        <ConfettiPiece
          key={piece.id}
          piece={piece}
          windowHeight={windowHeight}
          windowWidth={windowWidth}
        />
      ))}
    </View>
  );
}

function ConfettiPiece({
  piece,
  windowHeight,
  windowWidth,
}: {
  piece: ConfettiPieceData;
  windowHeight: number;
  windowWidth: number;
}) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Animate fall
    translateY.value = withTiming(windowHeight + 100, {
      duration: piece.duration,
      easing: Easing.linear,
    });

    // Fade out
    opacity.value = withTiming(0, {
      duration: piece.duration,
      easing: Easing.in(Easing.ease),
    });

    // Rotate
    rotation.value = withTiming(piece.rotation + 360, {
      duration: piece.duration,
      easing: Easing.linear,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotateZ: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: piece.left,
          top: -20,
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: piece.color,
        },
        animatedStyle,
      ]}
    />
  );
}
