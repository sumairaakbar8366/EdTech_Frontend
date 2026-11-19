(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
const mem: Record<string, string> = {};
(global as any).__mem = mem; (global as any).__web = null; (global as any).__injected = [] as string[]; (global as any).__opened = [] as string[];
jest.mock('expo-secure-store', () => ({
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 1, WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: 2,
  getItemAsync: async (k: string) => (global as any).__mem[k] ?? null,
  setItemAsync: async (k: string, v: string) => { (global as any).__mem[k] = v; },
  deleteItemAsync: async (k: string) => { delete (global as any).__mem[k]; },
}));
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: async () => true, isEnrolledAsync: async () => true, supportedAuthenticationTypesAsync: async () => [1],
  AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2 }, authenticateAsync: async () => ({ success: true }),
}));
(global as any).__net = { connected: true }; (global as any).__netHandler = null; (global as any).__savedShell = null; (global as any).__ensure = jest.fn(async () => true);
jest.mock('expo-network', () => ({
  getNetworkStateAsync: async () => ({ isConnected: (global as any).__net.connected, isInternetReachable: (global as any).__net.connected }),
  addNetworkStateListener: (fn: any) => { (global as any).__netHandler = fn; return { remove() {} }; },
}));
jest.mock('../src/offline/shellStore', () => ({
  loadShell: async () => ((global as any).__savedShell ? { html: (global as any).__savedShell, meta: { builtAt: 1, bytes: 1, site: 'x' } } : null),
  ensureShell: (...a: any[]) => (global as any).__ensure(...a),
}));
jest.mock('expo-location', () => ({ requestForegroundPermissionsAsync: async () => ({ status: 'granted' }) }));
jest.mock('expo-crypto', () => ({ getRandomBytesAsync: async (n: number) => new Uint8Array(require('crypto').randomBytes(n)) }));
jest.mock('@expo-google-fonts/inter', () => ({ useFonts: () => [true, null], Inter_400Regular: 1, Inter_600SemiBold: 1, Inter_700Bold: 1, Inter_800ExtraBold: 1 }));
jest.mock('lucide-react-native', () => {
  const React = require('react'); const { View } = require('react-native');
  return new Proxy({ __esModule: true }, { get: (t: any, name: string) => (name in t ? t[name] : (name === 'default' ? undefined : (props: any) => React.createElement(View, { testID: `icon-${name}`, ...props }))) });
});
jest.mock('react-native-webview', () => {
  const React = require('react'); const { View } = require('react-native');
  const WebView = React.forwardRef((props: any, ref: any) => {
    (global as any).__web = props;
    React.useImperativeHandle(ref, () => ({ goBack: jest.fn(), reload: jest.fn(), injectJavaScript: (s: string) => (global as any).__injected.push(s) }));
    return React.createElement(View, { testID: 'site' });
  });
  return { WebView, default: WebView };
});
jest.spyOn(require('react-native').Linking, 'openURL').mockImplementation((async (u: string) => { (global as any).__opened.push(u); return true; }) as never);
const RN = require('react-native');
RN.AccessibilityInfo.isReduceMotionEnabled = async () => true;
RN.AccessibilityInfo.addEventListener = () => ({ remove() {} });
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
