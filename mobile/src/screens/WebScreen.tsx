import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Linking, Platform, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView as RNWebView, type WebViewMessageEvent, type WebViewNavigation } from 'react-native-webview';
import * as Network from 'expo-network';
import * as Location from 'expo-location';
import { CloudOff, RefreshCw } from 'lucide-react-native';
import { IconTile, Text } from '@/components/brand';
import { APP_VERSION, SITE_URL } from '@/config';
import { handleBridge, injectedBeforeLoad, looksSignedIn, onSignInPage, opensInApp, replyScript, schoolOf, type BridgeDeps, type BridgeRequest } from '@/native/bridge';
import { ensureShell, loadShell } from '@/offline/shellStore';
import { KEYS, secure } from '@/services/secureStore';
import { COLORS } from '@/theme';

// react-native-webview's own typings and React 19's do not agree on props; the component itself works as documented.
const WebView = RNWebView as unknown as React.ComponentType<Record<string, unknown>>;

interface Props {
  startPath: string;
  deps: BridgeDeps;
  /** The person is inside a school (its address name, e.g. "demo"). */
  onSignedIn: (school: string | null) => void;
  /** The website showed a sign-in page (they signed out, or have not signed in). */
  onSignedOut: () => void;
}

type Mode = 'live' | 'saved';
const pathOf = (url: string): string | null => { try { const u = new URL(url); return u.origin === new URL(SITE_URL).origin ? `${u.pathname}${u.search}` : null; } catch { return null; } };

/**
 * The Skool EdTech website, full screen: every page and every role. With internet it is the live website; with no
 * internet it opens the copy of the website saved on the phone, and the website shows the school's data it saved
 * (changes made meanwhile wait and are sent when the connection returns, see apps/web/src/lib/offline).
 */
export function WebScreen({ startPath, deps, onSignedIn, onSignedOut }: Props) {
  const web = useRef<{ goBack: () => void; reload: () => void; injectJavaScript: (s: string) => void } | null>(null);
  const canGoBack = useRef(false);
  const askedLocation = useRef(false);
  const lastPath = useRef(startPath);
  const [shell, setShell] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<Mode>('live');
  const [failed, setFailed] = useState(false);
  const online = useRef(true);

  // Decide how to open: the live website when online; the saved copy when not.
  useEffect(() => {
    let alive = true;
    void (async () => {
      const [saved, net] = await Promise.all([loadShell(), Network.getNetworkStateAsync().catch(() => null)]);
      if (!alive) return;
      online.current = !net || (!!net.isConnected && net.isInternetReachable !== false);
      setShell(saved?.html ?? null);
      setMode(!online.current && saved ? 'saved' : 'live');
      setReady(true);
    })();
    return () => { alive = false; };
  }, []);

  // When the internet comes back, go back to the live website; when it goes, switch to the saved copy.
  useEffect(() => {
    const sub = Network.addNetworkStateListener((s) => {
      const now = !!s.isConnected && s.isInternetReachable !== false;
      const was = online.current; online.current = now;
      if (now && !was) { setFailed(false); setMode('live'); }
      if (!now && was && shell) setMode('saved');
    });
    return () => sub.remove();
  }, [shell]);

  // Android's back button goes back inside the website; only on its first page does it close the app.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => { if (canGoBack.current) { web.current?.goBack(); return true; } return false; });
    return () => sub.remove();
  }, []);

  const onNav = useCallback((nav: WebViewNavigation) => {
    canGoBack.current = nav.canGoBack;
    const p = pathOf(nav.url);
    if (looksSignedIn(nav.url, SITE_URL)) {
      onSignedIn(schoolOf(nav.url, SITE_URL));
      if (p) { lastPath.current = p; void secure.set(KEYS.lastPath, p); }
      // Location is asked once, after sign-in, so GPS check-in works inside the website.
      if (!askedLocation.current) {
        askedLocation.current = true;
        void (async () => {
          try {
            const r = await Location.requestForegroundPermissionsAsync();
            // Android: if the phone's location is switched off, ask the person to turn it on (the website's GPS needs it).
            if (r.granted && Platform.OS === 'android' && !(await Location.hasServicesEnabledAsync())) await Location.enableNetworkProviderAsync();
          } catch { /* the website then shows "No GPS" for the check-in */ }
        })();
      }
    } else if (onSignInPage(nav.url, SITE_URL)) onSignedOut();
  }, [onSignedIn, onSignedOut]);

  // A page loaded from the live website: save (or refresh) the copy used when there is no internet.
  const onLoadEnd = useCallback(() => { if (mode === 'live') void ensureShell().then((ok) => { if (ok) void loadShell().then((s) => { if (s) setShell(s.html); }); }); }, [mode]);

  const onMessage = useCallback(async (e: WebViewMessageEvent) => {
    let req: BridgeRequest;
    try { req = JSON.parse(e.nativeEvent.data) as BridgeRequest; } catch { return; }
    if (typeof req?.id !== 'number' || typeof req.method !== 'string') return;
    const reply = await handleBridge(req, deps);
    web.current?.injectJavaScript(replyScript(reply));
  }, [deps]);

  const onShould = useCallback((req: { url: string }) => {
    if (opensInApp(req.url, SITE_URL)) return true;
    void Linking.openURL(req.url).catch(() => undefined);
    return false;
  }, []);

  const onFail = useCallback(() => { if (shell) setMode('saved'); else setFailed(true); }, [shell]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={COLORS.action} /></View>;

  const source = mode === 'saved' && shell ? { html: shell, baseUrl: `${SITE_URL}${lastPath.current}` } : { uri: `${SITE_URL}${lastPath.current}` };
  const noShellOffline = !shell && !online.current;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flex: 1 }}>
        <WebView
          key={mode}
          ref={web}
          testID="site"
          source={source}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          geolocationEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          setSupportMultipleWindows={false}
          pullToRefreshEnabled
          allowsBackForwardNavigationGestures
          applicationNameForUserAgent={`SkoolEdTechApp/${APP_VERSION}`}
          injectedJavaScriptBeforeContentLoaded={injectedBeforeLoad(APP_VERSION, Platform.OS)}
          onNavigationStateChange={onNav}
          onShouldStartLoadWithRequest={onShould}
          onMessage={(e: WebViewMessageEvent) => { void onMessage(e); }}
          onLoadStart={() => setFailed(false)}
          onLoadEnd={onLoadEnd}
          onError={onFail}
          startInLoadingState
          renderLoading={() => <View style={{ ...fill, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}><ActivityIndicator color={COLORS.action} /></View>}
        />
        {failed || noShellOffline ? (
          <View style={{ ...fill, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 28 }}>
            <IconTile icon={CloudOff} size={64} color={COLORS.warn} bg={COLORS.warn + '22'} />
            <Text size={19} weight="800" style={{ textAlign: 'center' }}>No internet connection</Text>
            <Text muted style={{ textAlign: 'center' }}>Connect to the internet once so the app can save your school on this phone. After that it also works offline. This page opens again by itself when you are online.</Text>
            <Pressable accessibilityRole="button" onPress={() => { setFailed(false); setMode('live'); web.current?.reload(); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.action, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 }}>
              <RefreshCw size={17} color="#fff" /><Text weight="700" style={{ color: '#fff' }}>Try again</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const fill = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };
