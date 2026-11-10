---
name: build-apk
description: Build an Android APK using EAS Build for local testing with and without network connectivity
---

## What I do
- Verify eas-cli is installed and available
- Check that eas.projectId is configured in app.config.ts
- Run `eas build --platform android --profile preview --non-interactive` to build an APK
- Display the build URL so the user can monitor progress
- The APK is built on Expo's cloud servers and downloadable when complete (~10-15 min)

## When to use me
Use this skill when the user asks to build an APK, test on a physical device, or create a distributable Android build.

## Prerequisites
- eas-cli installed globally (`pnpm add -g eas-cli`)
- Logged in to Expo (`eas login`)
- eas.projectId set in app.config.ts extra.eas.projectId
- eas.json configured with a "preview" profile that builds an APK

## How I build the APK
1. Check that `eas --version` is available, suggest installing if not
2. Verify app.config.ts has `extra.eas.projectId` configured
3. Run: `eas build --platform android --profile preview --non-interactive`
4. Extract the build URL from the output and share it with the user
5. The user can monitor the build at the URL or download the APK when complete

## Notes
- The "preview" profile in eas.json is configured to generate an APK (not app-bundle)
- The APK is built remotely on Expo's servers, no local Android SDK needed
- Build typically takes 10-15 minutes
- For production releases, use `--profile production` which generates an app-bundle
