import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuth from 'expo-local-authentication';
import { Fingerprint } from 'lucide-react-native';
import { BrandMark, IconTile, Text } from '@/components/brand';
import { COLORS } from '@/theme';

/** Shown when the person chose fingerprint / face unlock: the app opens only after the phone's own check. */
export function LockScreen({ onUnlocked, onUsePassword }: { onUnlocked: () => void; onUsePassword: () => void }) {
  const [failed, setFailed] = useState(false);
  const ask = useCallback(async () => {
    setFailed(false);
    const ok = await LocalAuth.authenticateAsync({ promptMessage: 'Unlock Skool EdTech', cancelLabel: 'Use password' }).then((r) => r.success).catch(() => false);
    if (ok) onUnlocked(); else setFailed(true);
  }, [onUnlocked]);
  useEffect(() => { void ask(); }, [ask]);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
      <BrandMark size={72} />
      <Text size={22} weight="800">Skool EdTech</Text>
      <Text muted style={{ textAlign: 'center' }}>{failed ? 'The check did not pass.' : 'Unlock with your fingerprint or face.'}</Text>
      <Pressable accessibilityRole="button" onPress={() => void ask()}><IconTile icon={Fingerprint} size={64} color="#fff" bg={COLORS.action} /></Pressable>
      <Pressable accessibilityRole="button" onPress={onUsePassword}><Text weight="700" style={{ color: COLORS.action }}>Use password instead</Text></Pressable>
      <View />
    </SafeAreaView>
  );
}
