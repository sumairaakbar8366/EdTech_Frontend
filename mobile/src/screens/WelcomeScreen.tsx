import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, Switch, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Building2, ChevronRight, Fingerprint, LogIn, ScanFace, UserPlus, type LucideIcon } from 'lucide-react-native';
import { AnimatedBrandLogo } from '@/components/AnimatedBrandLogo';
import { IconTile, Text } from '@/components/brand';
import { biometricSupport, type BiometricSupport } from '@/services/deviceKey';
import { COLORS } from '@/theme';
import { useReducedMotion } from '@/utils/useReducedMotion';

/** First card appears after the logo has come together (about 2.8 s), then one every 0.35 s. */
const CARDS_AT = 2800;
const STEP = 350;

/** A card that tips up into place (3D) when it enters, and dips toward the finger when pressed. */
function DepthCard({ index, reduce, onPress, icon, title, subtitle, primary }: { index: number; reduce: boolean; onPress: () => void; icon: LucideIcon; title: string; subtitle: string; primary?: boolean }) {
  const enter = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) { enter.setValue(1); return; }
    const a = Animated.timing(enter, { toValue: 1, duration: 650, delay: CARDS_AT + index * STEP, easing: Easing.out(Easing.back(1.3)), useNativeDriver: true });
    a.start();
    return () => a.stop();
  }, [reduce, enter, index]);
  const to = (n: number) => Animated.spring(press, { toValue: n, friction: 6, tension: 140, useNativeDriver: true }).start();
  const style = {
    opacity: enter,
    transform: [
      { perspective: 900 },
      { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [46, 0] }) },
      { rotateX: enter.interpolate({ inputRange: [0, 1], outputRange: ['-38deg', '0deg'] }) },
      { scale: Animated.multiply(enter.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }), press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] })) },
    ],
  };
  return (
    <Animated.View style={style}>
      <Pressable accessibilityRole="button" onPress={onPress} onPressIn={() => to(1)} onPressOut={() => to(0)}
        style={{ backgroundColor: COLORS.card, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: primary ? COLORS.action + '55' : COLORS.cardBorder, shadowColor: '#0F172A', shadowOpacity: 0.16, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 5, borderBottomWidth: 3, borderBottomColor: primary ? COLORS.action : COLORS.cardBorder }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <IconTile icon={icon} size={44} color={primary ? '#fff' : COLORS.ink} bg={primary ? COLORS.action : COLORS.inkSoft} />
          <View style={{ flex: 1 }}><Text size={16} weight="800">{title}</Text><Text size={12.5} muted numberOfLines={2}>{subtitle}</Text></View>
          <ChevronRight size={20} color={COLORS.muted} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

interface Props {
  /** The school this phone signed in to before (its address name, e.g. "demo"), if any. */
  school: string | null;
  signedIn: boolean;
  onLogin: () => void;
  onRequestAccess: () => void;
  onRegister: () => void;
  onSwitchSchool: () => void;
  quickUnlock: boolean;
  onQuickUnlock: (on: boolean) => void;
}

/**
 * Every time the app opens: the logo comes together piece by piece while zooming in and slowly out, then Login, Sign up and
 * Register tip into place one after another. After that the person goes to their school's own sign-in page.
 */
export function WelcomeScreen({ school, signedIn, onLogin, onRequestAccess, onRegister, onSwitchSchool, quickUnlock, onQuickUnlock }: Props) {
  const reduce = useReducedMotion();
  const { width } = useWindowDimensions();
  const logo = Math.min(240, Math.round(width * 0.62));
  const text = useRef(new Animated.Value(0)).current;
  const [support, setSupport] = useState<BiometricSupport | null>(null);
  useEffect(() => { void biometricSupport().then(setSupport); }, []);
  useEffect(() => {
    if (reduce) { text.setValue(1); return; }
    const a = Animated.timing(text, { toValue: 1, duration: 600, delay: 2300, useNativeDriver: true });
    a.start();
    return () => a.stop();
  }, [reduce, text]);
  const SenseIcon = support?.kind === 'face' ? ScanFace : Fingerprint;
  const where = school ? school.replace(/[-_]/g, ' ') : 'your school';

  return (
    <LinearGradient colors={['#F8FAFC', '#E2E8F0']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 18, gap: 14 }} showsVerticalScrollIndicator={false}>
          <View style={{ alignItems: 'center', paddingVertical: 10 }}>
            <AnimatedBrandLogo size={logo} radius={34} padding={0.1} zoom />
            <Animated.View style={{ opacity: text, alignItems: 'center', gap: 4, marginTop: 20, paddingHorizontal: 12 }}>
              <Text size={19} weight="800" style={{ textAlign: 'center' }}>Welcome to your school</Text>
              <Text size={13.5} muted style={{ textAlign: 'center', lineHeight: 20 }}>Log in with the details your school gave you, and use your own account.</Text>
            </Animated.View>
          </View>

          <View style={{ gap: 12 }}>
            <DepthCard index={0} reduce={reduce} primary onPress={onLogin} icon={LogIn} title="Login"
              subtitle={signedIn ? `Continue to ${where}` : school ? `Sign in to ${where}` : 'Sign in with your email or User ID'} />
            <DepthCard index={1} reduce={reduce} onPress={onRequestAccess} icon={UserPlus} title="Sign up" subtitle="Ask your school for a login" />
            <DepthCard index={2} reduce={reduce} onPress={onRegister} icon={Building2} title="Register your school" subtitle="New school? Apply here" />
          </View>

          {school ? (
            <Animated.View style={{ opacity: text }}>
              <Pressable accessibilityRole="button" onPress={onSwitchSchool} style={{ alignSelf: 'center', paddingVertical: 4 }}>
                <Text size={13} weight="700" style={{ color: COLORS.action }}>Not {where}? Use another school</Text>
              </Pressable>
            </Animated.View>
          ) : null}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.card, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: COLORS.border }}>
            <IconTile icon={SenseIcon} size={38} />
            <View style={{ flex: 1 }}>
              <Text weight="700" size={13.5}>{support?.available ? `Unlock with ${support.label.toLowerCase()}` : 'Fingerprint / face unlock'}</Text>
              <Text size={12} muted>{support?.available ? 'Open your school with your phone\'s lock. Teachers also use it to mark attendance.' : support?.reason ?? 'Checking this phone…'}</Text>
            </View>
            <Switch value={quickUnlock && !!support?.available} onValueChange={onQuickUnlock} disabled={!support?.available} trackColor={{ true: COLORS.action }} accessibilityLabel="Unlock with fingerprint or face" />
          </View>
          <Text size={11.5} weight="600" style={{ color: COLORS.muted, textAlign: 'center' }}>Powered by ANet Cyber Solutions</Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
