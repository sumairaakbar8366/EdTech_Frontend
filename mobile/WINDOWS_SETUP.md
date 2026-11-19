# Skool EdTech app: Windows setup

Keep everything on **Drive F:**.

## 1. Install once
1. **Node.js 22 LTS** (https://nodejs.org). Check `node -v`.
2. Phone: install **Expo Go** (latest).
3. A free Expo account at https://expo.dev/signup (needed by Expo Go and the Expo CLI).

## 2. Unzip and install
Unzip so you have `F:\SkoolEdTechMobile\package.json`, then in PowerShell:
```powershell
mkdir F:\npm-cache, F:\npm-global, F:\tmp
npm config set cache F:\npm-cache
npm config set prefix F:\npm-global
$env:TEMP = "F:\tmp"; $env:TMP = "F:\tmp"
cd F:\SkoolEdTechMobile
copy .env.example .env
npm install
npx expo login
```

## 3. Start and scan
Phone and PC on the same Wi-Fi:
```powershell
npx expo start --clear
```
A QR code appears. Android: Expo Go, Scan QR. iPhone: Camera app, tap the Expo Go banner. On the phone, log in to Expo Go with the same Expo account.

If the phone cannot connect: allow Node.js in Windows Firewall (Private networks), or use `npm i -D @expo/ngrok` then `npx expo start --tunnel`.

## 4. Use it
Every time you open the app you see the welcome page: the logo zooms and comes together, then **Login**, **Sign up** and **Register your school** appear as 3D cards, with a switch for fingerprint / face unlock. **Login** opens your school's own sign-in page (the first time, the main sign-in; the app then remembers your school). Sign in with your school's email or User ID and password; everything after is the website. **Not your school? Use another school** on the welcome page forgets the school.

## Offline
Open the app once with internet (sign in, look at your pages): it saves the website and your school's data on the phone. After that it opens with no internet; changes you make (for example class attendance) are sent when you are online again. A bar at the bottom says when you are offline.

## 5. A real app file (APK)
```powershell
npm i -g eas-cli
eas login
eas init
eas build -p android --profile preview
```
After 10 to 20 minutes you get a download link and QR for the `.apk` (allow "install unknown apps"). An iPhone file needs a paid Apple Developer account; without it use Expo Go.

## If something is blank
The app shows the logo while starting and a "No internet connection" page if the website cannot load. For anything else:
shake the phone, Reload; stop Expo and run `npx expo start --clear`; send me any red text from PowerShell.
