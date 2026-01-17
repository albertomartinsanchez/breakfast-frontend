# Android App Build & Deployment Checklist

## Phase 1: Push and Deploy Code

### Backend
- [ ] `cd C:/Users/capit/Documents/python/breakfast-backend`
- [ ] `git add .`
- [ ] `git commit -m "Add push notifications support"`
- [ ] `git push`
- [ ] Deploy to Render

### Frontend
- [ ] `cd C:/Users/capit/Documents/python/breakfast-frontend`
- [ ] `git add .`
- [ ] `git commit -m "Add Capacitor config and key entry screen"`
- [ ] `git push`
- [ ] Deploy to Render
- [ ] Verify https://sample-api-frontend.onrender.com/app loads correctly

---

## Phase 2: Firebase Setup

- [ ] Go to https://console.firebase.google.com/
- [ ] Click "Create a project"
- [ ] Project name: `BreakfastOrders`
- [ ] Disable Google Analytics (optional, simplifies setup)
- [ ] Click "Create project"

### Add Android App to Firebase
- [ ] In Firebase console, click Android icon to add app
- [ ] Package name: `com.breakfast.orders`
- [ ] App nickname: `Breakfast Orders`
- [ ] Click "Register app"
- [ ] Download `google-services.json`
- [ ] Save it somewhere safe (you'll need it in Phase 3)
- [ ] Click "Next" through remaining steps

### Get Backend Credentials
- [ ] In Firebase console, go to Project Settings (gear icon)
- [ ] Go to "Service accounts" tab
- [ ] Click "Generate new private key"
- [ ] Download the JSON file
- [ ] Save it to your backend server (e.g., `/path/to/firebase-credentials.json`)
- [ ] Add to backend `.env`: `FIREBASE_CREDENTIALS_PATH=/path/to/firebase-credentials.json`
- [ ] Redeploy backend with new env variable

---

## Phase 3: Create Android Project

```bash
cd C:/Users/capit/Documents/python/breakfast-frontend
```

- [ ] `npm install` (install all dependencies including Capacitor)
- [ ] `npx cap add android` (creates android/ folder)
- [ ] Copy `google-services.json` to `android/app/google-services.json`
- [ ] `npx cap sync android` (sync web assets and plugins)

---

## Phase 4: Install Android Studio

- [ ] Download from https://developer.android.com/studio
- [ ] Install Android Studio
- [ ] On first launch, install recommended SDK components
- [ ] Wait for downloads to complete

---

## Phase 5: Build APK

### Open Project
- [ ] Open Android Studio
- [ ] Click "Open"
- [ ] Navigate to `C:/Users/capit/Documents/python/breakfast-frontend/android`
- [ ] Click "OK"
- [ ] Wait for Gradle sync (can take several minutes first time)

### Create Signing Key (first time only)
- [ ] Menu: Build → Generate Signed Bundle / APK
- [ ] Select "APK" → Next
- [ ] Click "Create new..."
- [ ] Key store path: choose a safe location (e.g., `C:/Users/capit/keystores/breakfast.jks`)
- [ ] Set password (SAVE THIS PASSWORD - you need it forever)
- [ ] Fill in certificate info (name, organization, city, country)
- [ ] Key alias: `breakfast`
- [ ] Key password: (can be same as keystore password)
- [ ] Click "OK"

### Generate APK
- [ ] Select your keystore
- [ ] Enter passwords
- [ ] Click "Next"
- [ ] Select "release"
- [ ] Click "Create"
- [ ] Wait for build to complete
- [ ] APK location: `android/app/release/app-release.apk`

---

## Phase 6: Test on Real Device (Optional but Recommended)

### Enable USB Debugging on Phone
- [ ] Go to Settings → About Phone
- [ ] Tap "Build number" 7 times to enable Developer options
- [ ] Go to Settings → Developer options
- [ ] Enable "USB debugging"

### Run on Device
- [ ] Connect phone via USB
- [ ] In Android Studio, select your device from dropdown
- [ ] Click Run (green play button)
- [ ] Accept any prompts on phone
- [ ] Test the app

---

## Phase 7: Google Play Store

### Create Developer Account
- [ ] Go to https://play.google.com/console
- [ ] Sign in with Google account
- [ ] Pay $25 registration fee
- [ ] Complete account details

### Create App Listing
- [ ] Click "Create app"
- [ ] App name: `Breakfast Orders`
- [ ] Default language: English (or your preference)
- [ ] App or game: App
- [ ] Free or paid: Free
- [ ] Accept declarations
- [ ] Click "Create app"

### Store Listing (Required)
- [ ] Go to "Main store listing"
- [ ] Short description (max 80 chars): `Track your breakfast delivery orders in real-time`
- [ ] Full description: Write a longer description
- [ ] Upload app icon (512x512 PNG)
- [ ] Upload feature graphic (1024x500 PNG)
- [ ] Upload phone screenshots (minimum 2)
- [ ] Click "Save"

### Content Rating (Required)
- [ ] Go to "Content rating"
- [ ] Start questionnaire
- [ ] Answer questions about app content
- [ ] Submit for rating

### Privacy Policy (Required)
- [ ] Create a privacy policy page (can use a free generator)
- [ ] Host it somewhere (e.g., your website, GitHub pages)
- [ ] Go to "Privacy policy"
- [ ] Enter the URL
- [ ] Save

### Target Audience (Required)
- [ ] Go to "Target audience"
- [ ] Select age groups (probably 18+)
- [ ] Answer questions
- [ ] Save

### Upload APK
- [ ] Go to "Release" → "Production"
- [ ] Click "Create new release"
- [ ] Upload `app-release.apk`
- [ ] Add release notes (e.g., "Initial release")
- [ ] Click "Review release"
- [ ] Click "Start rollout to Production"

### Submit for Review
- [ ] Review all sections show green checkmarks
- [ ] Submit app for review
- [ ] Wait 1-7 days for approval

---

## Important Files to Keep Safe Forever

| File | Location | Why |
|------|----------|-----|
| Keystore (.jks) | `C:/Users/capit/keystores/breakfast.jks` | Required for all future app updates |
| Keystore password | Password manager | Can't recover if lost |
| google-services.json | `android/app/` | Firebase config |
| Firebase service account JSON | Backend server | Push notification credentials |

---

## Future Updates

When you want to update the app:

### If only frontend code changed:
Just deploy to Render. App updates automatically (remote mode).

### If native code/plugins changed:
```bash
cd C:/Users/capit/Documents/python/breakfast-frontend
npx cap sync android
# Then rebuild APK in Android Studio and upload to Play Store
```
