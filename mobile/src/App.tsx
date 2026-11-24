import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, useFonts } from '@expo-google-fonts/inter';
import { BrandMark } from '@/components/brand';
import { accessPathFor, loginPathFor } from '@/native/bridge';
import { phoneDeps } from '@/native/phone';
import { LockScreen } from '@/screens/LockScreen';
import { WebScreen } from '@/screens/WebScreen';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { KEYS, secure } from '@/services/secureStore';
import { COLORS } from '@/theme';

type Phase = 'boot' | 'welcome' | 'lock' | 'web';

/**
 * Every time the app opens: the welcome page (animated logo, then Login / Sign up / Register). Login goes to the school
 * this phone signed in to before (its own sign-in page), or to the main sign-in the first time; once signed in the website
 * keeps the session, so Login continues straight to the school (after fingerprint / face, if chosen). The website does
 * the signing in and everything after (all roles, all pages).
 */
export default function App() {
  const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold });
  const [phase, setPhase] = useState<Phase>('boot');
  const [path, setPath] = useState('/login');
  const [school, setSchool] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState(false);
  const [quick, setQuick] = useState(false);
  const last = useRef<string | null>(null);
  const pending = useRef('/login');
  const schoolRef = useRef<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [signedIn, bio, lastPath, sch] = await Promise.all([secure.get(KEYS.signedIn), secure.get(KEYS.bio), secure.get(KEYS.lastPath), secure.get(KEYS.school)]);
        setQuick(bio === '1'); setHasSession(signedIn === '1'); setSchool(sch); schoolRef.current = sch; last.current = lastPath;
      } catch { /* the welcome page still opens */ }
      setPhase('welcome');
    })();
  }, []);

  const open = useCallback((to: string) => { setPath(to); setPhase('web'); }, []);

  const signedIn = useCallback((sch: string | null) => {
    setHasSession(true); void secure.set(KEYS.signedIn, '1');
    // The first sign-in teaches the app which school this phone belongs to.
    if (sch && sch !== schoolRef.current) { schoolRef.current = sch; setSchool(sch); void secure.set(KEYS.school, sch); }
  }, []);
  const signedOut = useCallback(() => { setHasSession(false); void secure.del(KEYS.signedIn); }, []);

  const login = () => {
    const target = hasSession ? (last.current && last.current.startsWith('/') ? last.current : school ? `/${school}` : '/') : loginPathFor(school);
    if (hasSession && quick) { pending.current = target; setPhase('lock'); } else open(target);
  };
  const switchSchool = () => { setSchool(null); schoolRef.current = null; setHasSession(false); last.current = null; void Promise.all([secure.del(KEYS.school), secure.del(KEYS.signedIn), secure.del(KEYS.lastPath)]); };
  const setQuickUnlock = useCallback(async (on: boolean) => setQuick(await phoneDeps.setQuickUnlock(on)), []);

  let body: React.ReactNode;
  if (phase === 'boot' || (!fontsLoaded && !fontError)) body = <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: '#F1F5F9' }}><BrandMark size={84} /><ActivityIndicator color={COLORS.action} /></View>;
  else if (phase === 'welcome') body = <WelcomeScreen school={school} signedIn={hasSession} quickUnlock={quick} onQuickUnlock={(on) => void setQuickUnlock(on)} onLogin={login} onRequestAccess={() => open(accessPathFor(school))} onRegister={() => open('/register')} onSwitchSchool={switchSchool} />;
  else if (phase === 'lock') body = <LockScreen onUnlocked={() => open(pending.current)} onUsePassword={() => { void secure.del(KEYS.bio); setQuick(false); open(pending.current); }} />;
  else body = <WebScreen startPath={path} deps={phoneDeps} onSignedIn={signedIn} onSignedOut={signedOut} />;

  return <SafeAreaProvider><StatusBar style="dark" />{body}</SafeAreaProvider>;
}
