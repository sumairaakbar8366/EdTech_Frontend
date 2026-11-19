# Skool EdTech phone app (shows the real website)

This app opens the **Skool EdTech website inside the app**. Every role (owner, admin, principal, accountant, teacher, staff,
student, parent) and every page is the website itself, so nothing is missing and every website update appears in the app at once.
The app adds what a browser cannot do:

* a **welcome page every time the app opens**: the logo comes together piece by piece while zooming in and slowly out, then three 3D cards tip into place one after another (**Login**, **Sign up**, **Register your school**); no marketing. **Login** then opens *that school's own* sign-in page (`/<school>/login`; the first time, the main `/login`, which also teaches the app the school), and continues to the school once signed in. "Not your school? Use another school" forgets the school;
* **fingerprint / face unlock** for the app (each person chooses it on the welcome page);
* **fingerprint / face attendance for teachers** (the website asks the app to sign the school's challenge with a key kept
  behind the phone's lock; only the public key goes to the school);
* **location** for the website's GPS check-in (asked once after sign-in), the Android back button, file / photo upload,
  and links to other sites opening in the phone's browser;
* **offline use** (see below).

```
mobile/
  src/App.tsx               welcome → (lock) → website
  src/screens/              WelcomeScreen, LockScreen, WebScreen (the website)
  src/native/bridge.ts      what the website may ask the phone (tested)
  src/services/             attendance key (P-256), secure storage
  __tests__/  __ui__/       unit tests and screen tests
```
Website side of the bridge: `apps/web/src/lib/nativeBridge.ts` and `apps/web/src/features/attendance/utils/biometric.ts`
(in a normal browser nothing changes). Backend side: `apps/api/src/attendance/biometric.service.ts` (`/staff-attendance/biometric/app/*`).

## Run

```bash
cp .env.example .env     # EXPO_PUBLIC_SITE_URL=https://skooledtech.com
npm install
npx expo start --clear   # scan the QR code with Expo Go (same free Expo account on PC and phone)
npm test                 # unit tests
npm run typecheck
```
Screen tests: `for k in welcome login register returning lock web signout; do UI_CASE=$k npx jest -c jest.ui.config.js; done`

## Build the Android app (APK) / iPhone

```bash
npm i -g eas-cli && eas login && eas init
eas build -p android --profile preview      # APK with a download link + QR
eas build -p ios --profile production       # needs an Apple Developer account
```

## Works offline too
* **Pages:** while online the app saves a one-file copy of the website (`src/offline/`). With no internet it opens that copy,
  at the page you were on, and goes back to the live website by itself when the connection returns.
* **Data:** the website (`apps/web/src/lib/offline/`) keeps every answer from the school, so screens open with saved data,
  and saves each role's first screens in advance (today's class lists for teachers, children's fee statements for parents, ...).
* **Changes made offline** wait in a queue and are sent in order when the internet is back: class attendance (the newest
  mark per class wins), task updates, messages and complaint replies, new complaints, leave and document requests, read marks,
  exam marks. A bar at the bottom shows "You are offline" / how many changes are waiting / any the school refused (review,
  discard or retry). Money, check-in / check-out (they need the phone's location and fingerprint at that moment), approvals and
  account changes always need the internet.
* **Another person** signing in on the same phone drops the previous person's saved copies. Signing out erases them.
* The same offline layer also works in a normal browser (laptop).
* First use must be online once (to save the website). Pages the person never opened before are not available offline, and
  a few rarely used pop-ups (import / export, the 3D home-page picture) load their code only when online.

## Deploying the two changes this app needs
0. Nothing in the app works offline until the **website with the offline layer is deployed** (step 2).
1. **API** (new attendance routes): `pm2 restart skooledtech-api` (about 3 seconds).
2. **Website** (bridge code): `npm run build -w @schoolerp/web` then `pm2 restart skooledtech-web`
   (restart the preview server after a build; it keeps the old index.html in memory).
Until then the app opens the website as it is today (online only); offline mode and fingerprint attendance need both.

## Fingerprint / face for attendance in Expo Go

In the installed app (APK / IPA) the phone itself guards the attendance key: every use asks for the fingerprint or face.
Expo Go on an iPhone has no Face ID permission, so there the app asks for the fingerprint / face (or the phone passcode) itself
before storing and before every use of the key. Setup works in both; the OS-enforced version needs a real build.
