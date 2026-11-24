import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import App from '../src/App';

const web = () => (global as any).__web as Record<string, any>;
const mem = () => (global as any).__mem as Record<string, string>;
const CASE = process.env.UI_CASE ?? 'welcome';
const SHELL = '<html><body><div id="root">saved copy of the website</div></body></html>';
beforeEach(() => { (global as any).__net.connected = true; (global as any).__savedShell = null; (global as any).__ensure.mockClear(); for (const k of Object.keys(mem())) delete mem()[k]; (global as any).__web = null; (global as any).__injected.length = 0; (global as any).__opened.length = 0; });

/** Opens the app and taps Login (the welcome page always comes first). */
async function goToWeb(card = 'Login') {
  render(<App />);
  await waitFor(() => expect(screen.getByText(card)).toBeTruthy(), { timeout: 5000 });
  fireEvent.press(screen.getByText(card));
  await waitFor(() => expect(web()).not.toBeNull(), { timeout: 5000 });
}
const t = (name: string, fn: () => Promise<void>) => (CASE === name ? it : it.skip)(name, fn);

t('welcome', async () => {
  render(<App />);
  await waitFor(() => expect(screen.getByText('Login')).toBeTruthy(), { timeout: 5000 });
  expect(screen.getByText('Welcome to your school')).toBeTruthy();
  expect(screen.getByText(/Log in with the details your school gave you/)).toBeTruthy();
  expect(screen.getByText('Sign up')).toBeTruthy();
  expect(screen.getByText('Register your school')).toBeTruthy();
  expect(screen.getByText('Powered by ANet Cyber Solutions')).toBeTruthy();
  await waitFor(() => expect(screen.getByText(/Unlock with fingerprint/)).toBeTruthy());
  expect(web()).toBeNull(); // the website opens only when the person chooses
});

t('first-login', async () => {
  await goToWeb();
  expect(web().source.uri).toBe('https://skooledtech.com/login'); // the school is not known yet
  expect(web().injectedJavaScriptBeforeContentLoaded).toContain('__skoolApp');
  expect(web().applicationNameForUserAgent).toMatch(/^SkoolEdTechApp\//);
  expect(web().sharedCookiesEnabled).toBe(true); expect(web().geolocationEnabled).toBe(true); expect(web().domStorageEnabled).toBe(true);
});

t('school-login', async () => {
  mem()['skool.school'] = 'demo'; // signed in here before, then signed out
  render(<App />);
  await waitFor(() => expect(screen.getByText('Sign in to demo')).toBeTruthy(), { timeout: 5000 });
  fireEvent.press(screen.getByText('Login'));
  await waitFor(() => expect(web()).not.toBeNull());
  expect(web().source.uri).toBe('https://skooledtech.com/demo/login'); // that school's own sign-in page
});

t('signup-register', async () => {
  mem()['skool.school'] = 'demo';
  await goToWeb('Sign up');
  expect(web().source.uri).toBe('https://skooledtech.com/demo/request-access');
});

t('register', async () => {
  await goToWeb('Register your school');
  expect(web().source.uri).toBe('https://skooledtech.com/register');
});

t('returning', async () => {
  mem()['skool.signedin'] = '1'; mem()['skool.school'] = 'demo'; mem()['skool.lastpath'] = '/demo/attendance';
  render(<App />);
  // Even when signed in, the welcome page comes first...
  await waitFor(() => expect(screen.getByText('Continue to demo')).toBeTruthy(), { timeout: 5000 });
  expect(web()).toBeNull();
  fireEvent.press(screen.getByText('Login'));
  // ...and Login continues to the school at the page they were on.
  await waitFor(() => expect(web()).not.toBeNull());
  expect(web().source.uri).toBe('https://skooledtech.com/demo/attendance');
});

t('lock', async () => {
  mem()['skool.signedin'] = '1'; mem()['skool.bio'] = '1'; mem()['skool.school'] = 'demo'; mem()['skool.lastpath'] = '/demo/students';
  await goToWeb(); // the (fake) phone accepts the fingerprint straight away
  expect(web().source.uri).toBe('https://skooledtech.com/demo/students');
});

t('learn-school', async () => {
  await goToWeb();
  act(() => { web().onNavigationStateChange({ url: 'https://skooledtech.com/demo/admin', canGoBack: false }); });
  await waitFor(() => expect(mem()['skool.school']).toBe('demo'));
  expect(mem()['skool.signedin']).toBe('1');
  // signing out lands on the school's sign-in page: the phone keeps the school, forgets the session
  act(() => { web().onNavigationStateChange({ url: 'https://skooledtech.com/demo/login', canGoBack: false }); });
  await waitFor(() => expect(mem()['skool.signedin']).toBeUndefined());
  expect(mem()['skool.school']).toBe('demo');
});

t('switch-school', async () => {
  mem()['skool.school'] = 'demo'; mem()['skool.signedin'] = '1';
  render(<App />);
  await waitFor(() => expect(screen.getByText(/Use another school/)).toBeTruthy(), { timeout: 5000 });
  fireEvent.press(screen.getByText(/Use another school/));
  await waitFor(() => expect(mem()['skool.school']).toBeUndefined());
  expect(mem()['skool.signedin']).toBeUndefined();
  fireEvent.press(screen.getByText('Login'));
  await waitFor(() => expect(web()).not.toBeNull());
  expect(web().source.uri).toBe('https://skooledtech.com/login');
});

t('web', async () => {
  mem()['skool.signedin'] = '1';
  await goToWeb();
  expect(web().onShouldStartLoadWithRequest({ url: 'https://skooledtech.com/demo/students' })).toBe(true);
  expect(web().onShouldStartLoadWithRequest({ url: 'https://evil.example.com/x' })).toBe(false);
  expect((global as any).__opened).toContain('https://evil.example.com/x');
  await act(async () => { await web().onMessage({ nativeEvent: { data: JSON.stringify({ id: 5, method: 'biometric.support' }) } }); });
  expect((global as any).__injected.join('')).toContain('__skoolNativeReply({"id":5,"ok":true,"data":{"available":true');
  await act(async () => { await web().onMessage({ nativeEvent: { data: 'not json' } }); });
  await act(async () => { web().onError({ nativeEvent: {} }); });
  await waitFor(() => expect(screen.getByText('No internet connection')).toBeTruthy());
  expect(screen.getByText('Try again')).toBeTruthy();
});

t('offline-saved', async () => {
  mem()['skool.signedin'] = '1'; mem()['skool.school'] = 'demo'; mem()['skool.lastpath'] = '/demo/attendance';
  (global as any).__net.connected = false; (global as any).__savedShell = SHELL;
  await goToWeb();
  expect(web().source.html).toBe(SHELL);
  expect(web().source.baseUrl).toBe('https://skooledtech.com/demo/attendance');
  expect(screen.queryByText('No internet connection')).toBeNull();
});

t('offline-new', async () => {
  mem()['skool.signedin'] = '1';
  (global as any).__net.connected = false;
  render(<App />);
  await waitFor(() => expect(screen.getByText('Login')).toBeTruthy(), { timeout: 5000 });
  fireEvent.press(screen.getByText('Login'));
  await waitFor(() => expect(screen.getByText('No internet connection')).toBeTruthy(), { timeout: 5000 });
  expect(screen.getByText(/Connect to the internet once/)).toBeTruthy();
});

t('reconnect', async () => {
  mem()['skool.signedin'] = '1'; mem()['skool.lastpath'] = '/demo';
  (global as any).__net.connected = false; (global as any).__savedShell = SHELL;
  await goToWeb();
  await waitFor(() => expect(web()?.source?.html).toBe(SHELL), { timeout: 5000 });
  await act(async () => { (global as any).__netHandler({ isConnected: true, isInternetReachable: true }); });
  await waitFor(() => expect(web().source.uri).toBe('https://skooledtech.com/demo'));
  await act(async () => { (global as any).__netHandler({ isConnected: false, isInternetReachable: false }); });
  await waitFor(() => expect(web().source.html).toBe(SHELL));
});

t('save-copy', async () => {
  mem()['skool.signedin'] = '1';
  await goToWeb();
  await act(async () => { web().onLoadEnd(); });
  expect((global as any).__ensure).toHaveBeenCalled();
  act(() => { web().onNavigationStateChange({ url: 'https://skooledtech.com/demo/students?x=1', canGoBack: true }); });
  await waitFor(() => expect(mem()['skool.lastpath']).toBe('/demo/students?x=1'));
});

t('live-fails', async () => {
  mem()['skool.signedin'] = '1'; (global as any).__savedShell = SHELL;
  await goToWeb();
  expect(web().source.uri).toBe('https://skooledtech.com/');
  await act(async () => { web().onError({ nativeEvent: {} }); });
  await waitFor(() => expect(web().source.html).toBe(SHELL));
  expect(screen.queryByText('No internet connection')).toBeNull();
});
