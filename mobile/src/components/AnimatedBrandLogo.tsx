import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, View } from 'react-native';
import { LOGO } from './brand';
import { useReducedMotion } from '@/utils/useReducedMotion';

/** Replays the intro every so often, like the website. */
const REPLAY_MS = 9000;
/** The logo file is 1254 x 1254 in the website's coordinates; each piece is a rectangle of it. */
const U = 1254;
interface Piece { key: string; x: number; y: number; w: number; h: number; from: { x?: number; y?: number; rot?: number; scale?: number }; delay: number; spring?: boolean }
const PIECES: Piece[] = [
  { key: 's', x: 0, y: 295, w: 702, h: 570, from: { x: -0.45 }, delay: 0, spring: true },
  { key: 't', x: 702, y: 295, w: 552, h: 570, from: { x: 0.45 }, delay: 400, spring: true },
  { key: 'cap', x: 0, y: 0, w: 1254, h: 295, from: { y: -0.55, rot: -14 }, delay: 850, spring: true },
  { key: 'skool', x: 0, y: 865, w: 569, h: 205, from: { y: 0.12 }, delay: 1450 },
  { key: 'edtech', x: 569, y: 865, w: 685, h: 205, from: { y: 0.12 }, delay: 1700 },
  { key: 'tagline', x: 0, y: 1070, w: 1254, h: 184, from: { scale: 0.92 }, delay: 2000 },
];

/**
 * The Skool EdTech logo built piece by piece (the S slides in, then the T, the cap lands on top, then the
 * name and tagline), as on the website. Each piece is the same logo file cropped to a rectangle.
 */
export function AnimatedBrandLogo({ size = 168, radius = 26, padding = 0.1, zoom = false }: { size?: number; radius?: number; /** White margin around the logo, as a fraction of the card (so the text never touches the corners). */ padding?: number; /** Zoom in while the pieces come together, ease back out, then breathe gently (the welcome page). */ zoom?: boolean }) {
  const inner = size * (1 - 2 * padding);
  const f = inner / U;
  const progress = useRef(PIECES.map(() => new Animated.Value(0))).current;
  const float = useRef(new Animated.Value(0)).current;
  const z = useRef(new Animated.Value(1)).current;
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) { progress.forEach((v) => v.setValue(1)); return; }
    let alive = true;
    const run = () => {
      progress.forEach((v) => v.setValue(0));
      if (zoom) {
        // One 9 second cycle with the pieces: zoom in slowly, ease back out, then a gentle breath in and out.
        z.setValue(0.55);
        Animated.sequence([
          Animated.timing(z, { toValue: 1.14, duration: 2400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(z, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(z, { toValue: 1.035, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(z, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]).start();
      }
      Animated.parallel(PIECES.map((p, i) => (p.spring
        ? Animated.sequence([Animated.delay(p.delay), Animated.spring(progress[i]!, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true })])
        : Animated.sequence([Animated.delay(p.delay), Animated.timing(progress[i]!, { toValue: 1, duration: 550, easing: Easing.out(Easing.cubic), useNativeDriver: true })])))).start();
    };
    run();
    const timer = setInterval(() => { if (alive) run(); }, REPLAY_MS);
    // A slow float, like the website's cards.
    Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(float, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
    return () => { alive = false; clearInterval(timer); float.stopAnimation(); z.stopAnimation(); progress.forEach((v) => v.stopAnimation()); };
  }, [progress, float, z, zoom, reduce]);

  return (
    <Animated.View accessibilityLabel="Skool EdTech" style={{ width: size, height: size, borderRadius: radius, backgroundColor: '#fff', overflow: 'hidden', shadowColor: '#0F172A', shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 10 }, elevation: 8, transform: [{ perspective: 900 }, { scale: z }, { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }, { rotateX: float.interpolate({ inputRange: [0, 1], outputRange: ['2deg', '-2deg'] }) }] }}>
      <View style={{ position: 'absolute', left: size * padding, top: size * padding, width: inner, height: inner, overflow: 'hidden' }}>
      {PIECES.map((p, i) => {
        const v = progress[i]!;
        const t: any[] = [];
        if (p.from.x !== undefined) t.push({ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [p.from.x * p.w * f, 0] }) });
        if (p.from.y !== undefined) t.push({ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [p.from.y * p.h * f * 3, 0] }) });
        if (p.from.rot !== undefined) t.push({ rotate: v.interpolate({ inputRange: [0, 1], outputRange: [`${p.from.rot}deg`, '0deg'] }) });
        if (p.from.scale !== undefined) t.push({ scale: v.interpolate({ inputRange: [0, 1], outputRange: [p.from.scale, 1] }) });
        return (
          <Animated.View key={p.key} style={{ position: 'absolute', left: p.x * f - 0.5, top: p.y * f - 0.5, width: p.w * f + 1, height: p.h * f + 1, overflow: 'hidden', opacity: v.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, 1, 1] }), transform: t }}>
            <Image source={LOGO} resizeMode="stretch" style={{ position: 'absolute', left: -(p.x * f) + 0.5, top: -(p.y * f) + 0.5, width: inner, height: inner }} />
          </Animated.View>
        );
      })}
      </View>
    </Animated.View>
  );
}
