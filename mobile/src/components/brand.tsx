import React from 'react';
import { Image, Text as RNText, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { COLORS, FONT } from '@/theme';

/** The website's own logo files. */
export const LOGO = require('../../assets/brand/skool-edtech-logo.png');
export const MARK = require('../../assets/brand/skool-edtech-mark.png');

export function BrandMark({ size = 38 }: { size?: number }) {
  return <Image source={MARK} accessibilityLabel="Skool EdTech" style={{ width: size, height: size, borderRadius: size * 0.22, backgroundColor: '#fff' }} resizeMode="contain" />;
}

/** Text in the app's font and the website's ink colour. */
export function Text({ size = 14, weight = '400', muted, style, children, ...rest }: { size?: number; weight?: '400' | '600' | '700' | '800'; muted?: boolean; style?: object; children?: React.ReactNode; numberOfLines?: number }) {
  return <RNText {...rest} style={[{ color: muted ? COLORS.muted : COLORS.ink, fontSize: size, fontFamily: FONT[weight] }, style]}>{children}</RNText>;
}

/** A small rounded square holding an icon (the website's IconTile). */
export function IconTile({ icon: Icon, size = 40, color = COLORS.ink, bg = COLORS.inkSoft }: { icon: LucideIcon; size?: number; color?: string; bg?: string }) {
  return <View style={{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}><Icon size={size * 0.5} color={color} strokeWidth={2} /></View>;
}
