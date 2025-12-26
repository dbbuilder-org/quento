/**
 * AnimatedView Component - Reusable animation wrapper
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { useEffect, useRef, ReactNode } from 'react';
import { Animated, ViewStyle, StyleProp } from 'react-native';
import { ANIMATION } from '../../constants/theme';

type AnimationType = 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'scale' | 'bounce';

interface AnimatedViewProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  visible?: boolean;
}

export default function AnimatedView({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration = ANIMATION.normal,
  style,
  visible = true,
}: AnimatedViewProps) {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(animValue, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animValue, {
        toValue: 0,
        duration: ANIMATION.fast,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, animValue, delay, duration]);

  const getAnimatedStyle = (): Animated.WithAnimatedObject<ViewStyle> => {
    switch (animation) {
      case 'fadeIn':
        return {
          opacity: animValue,
        };
      case 'fadeInUp':
        return {
          opacity: animValue,
          transform: [
            {
              translateY: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        };
      case 'fadeInDown':
        return {
          opacity: animValue,
          transform: [
            {
              translateY: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        };
      case 'fadeInLeft':
        return {
          opacity: animValue,
          transform: [
            {
              translateX: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        };
      case 'fadeInRight':
        return {
          opacity: animValue,
          transform: [
            {
              translateX: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        };
      case 'scale':
        return {
          opacity: animValue,
          transform: [
            {
              scale: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        };
      case 'bounce':
        return {
          opacity: animValue,
          transform: [
            {
              scale: animValue.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.8, 1.1, 1],
              }),
            },
          ],
        };
      default:
        return { opacity: animValue };
    }
  };

  return (
    <Animated.View style={[style, getAnimatedStyle()]}>
      {children}
    </Animated.View>
  );
}

// Staggered animation container for lists
interface StaggeredListProps {
  children: ReactNode[];
  animation?: AnimationType;
  staggerDelay?: number;
  initialDelay?: number;
  style?: StyleProp<ViewStyle>;
}

export function StaggeredList({
  children,
  animation = 'fadeInUp',
  staggerDelay = 50,
  initialDelay = 0,
  style,
}: StaggeredListProps) {
  return (
    <Animated.View style={style}>
      {children.map((child, index) => (
        <AnimatedView
          key={index}
          animation={animation}
          delay={initialDelay + index * staggerDelay}
        >
          {child}
        </AnimatedView>
      ))}
    </Animated.View>
  );
}

// Pulse animation for attention
interface PulseViewProps {
  children: ReactNode;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function PulseView({ children, active = true, style }: PulseViewProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (active) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [active, pulseAnim]);

  return (
    <Animated.View style={[style, { transform: [{ scale: pulseAnim }] }]}>
      {children}
    </Animated.View>
  );
}

// Shake animation for errors/alerts
interface ShakeViewProps {
  children: ReactNode;
  shake?: boolean;
  style?: StyleProp<ViewStyle>;
  onShakeEnd?: () => void;
}

export function ShakeView({ children, shake = false, style, onShakeEnd }: ShakeViewProps) {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (shake) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start(() => {
        onShakeEnd?.();
      });
    }
  }, [shake, shakeAnim, onShakeEnd]);

  return (
    <Animated.View style={[style, { transform: [{ translateX: shakeAnim }] }]}>
      {children}
    </Animated.View>
  );
}
