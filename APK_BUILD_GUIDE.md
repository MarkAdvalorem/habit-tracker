# Guide de Construction et Installation de l'APK Habit Tracker

## Vue d'ensemble

Ce guide vous explique comment construire et installer l'APK de Habit Tracker sur votre appareil Android pour une utilisation personnelle.

## Prérequis

- **Appareil Android** avec Android 7.0 (API 24) ou supérieur
- **Ordinateur** avec Node.js 18+ installé
- **Android SDK** (optionnel, pour les tests locaux)
- **Git** pour cloner le repository

## Option 1 : Construction Locale (Recommandée pour Développeurs)

### Étape 1 : Cloner le Repository

```bash
git clone https://github.com/MarkAdvalorem/habit-tracker-app.git
cd habit-tracker-app
```

### Étape 2 : Installer les Dépendances

```bash
npm install
# ou
pnpm install
```

### Étape 3 : Générer les Fichiers Natifs

```bash
npx expo prebuild --clean
```

### Étape 4 : Construire l'APK Debug

```bash
cd android
./gradlew assembleDebug
```

**Résultat :** L'APK sera généré à :
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Étape 5 : Installer sur Appareil Android

```bash
# Via ADB (Android Debug Bridge)
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Ou transférer manuellement le fichier APK sur votre appareil
```

## Option 2 : Utiliser Expo Go (Plus Simple)

Si vous ne voulez pas construire l'APK, vous pouvez utiliser **Expo Go** pour tester l'application :

### Étape 1 : Installer Expo Go

Téléchargez l'application **Expo Go** depuis :
- [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- [Apple App Store](https://apps.apple.com/us/app/expo-go/id982107779)

### Étape 2 : Lancer le Serveur de Développement

```bash
npm run dev
# ou
pnpm dev
```

### Étape 3 : Scanner le Code QR

Ouvrez Expo Go et scannez le code QR affiché dans le terminal. L'application se chargera sur votre appareil.

## Option 3 : Construire l'APK Release (Pour Distribution)

### Étape 1 : Générer une Clé de Signature

```bash
keytool -genkey -v -keystore habit-tracker-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias habit-tracker
```

Répondez aux questions pour créer votre clé.

### Étape 2 : Configurer Gradle pour la Signature

Créez un fichier `android/keystore.properties` :

```properties
storeFile=../habit-tracker-key.keystore
storePassword=YOUR_PASSWORD
keyAlias=habit-tracker
keyPassword=YOUR_PASSWORD
```

### Étape 3 : Construire l'APK Release

```bash
cd android
./gradlew assembleRelease
```

**Résultat :** L'APK sera généré à :
```
android/app/build/outputs/apk/release/app-release.apk
```

## Installation sur Appareil Android

### Via USB (Recommandé)

1. **Activez le mode développeur** sur votre appareil :
   - Allez dans Paramètres → À propos du téléphone
   - Appuyez 7 fois sur "Numéro de version"
   - Retournez à Paramètres → Options pour développeurs

2. **Activez le débogage USB** :
   - Allez dans Paramètres → Options pour développeurs
   - Activez "Débogage USB"

3. **Connectez votre appareil** via USB à votre ordinateur

4. **Installez l'APK** :
   ```bash
   adb install app-debug.apk
   # ou
   adb install app-release.apk
   ```

### Via Transfert de Fichier

1. **Transférez l'APK** sur votre appareil via :
   - Câble USB
   - Email
   - Services cloud (Google Drive, OneDrive, etc.)

2. **Ouvrez le gestionnaire de fichiers** sur votre appareil

3. **Naviguez** vers le fichier APK

4. **Appuyez** sur le fichier APK pour l'installer

5. **Autorisez l'installation** depuis des sources inconnues si nécessaire :
   - Allez dans Paramètres → Sécurité
   - Activez "Sources inconnues"

## Dépannage

### Erreur : "Android Gradle plugin requires Java 17"

**Solution :** Installez Java 17 :
```bash
# macOS
brew install java17

# Ubuntu/Debian
sudo apt-get install openjdk-17-jdk

# Windows
# Téléchargez depuis https://adoptium.net/
```

### Erreur : "Gradle build daemon disappeared"

**Solution :** Augmentez la mémoire Gradle :
```bash
# Créez/modifiez android/gradle.properties
org.gradle.jvmargs=-Xmx4096m
```

### Erreur : "Failed to install APK"

**Solutions :**
1. Vérifiez que l'appareil est connecté : `adb devices`
2. Désinstallez la version précédente : `adb uninstall space.manus.habit.tracker`
3. Vérifiez que le débogage USB est activé

### L'application ne se lance pas

1. **Vérifiez les logs** :
   ```bash
   adb logcat | grep -i "habit"
   ```

2. **Vérifiez les permissions** :
   - Allez dans Paramètres → Applications → Habit Tracker → Permissions
   - Accordez les permissions nécessaires

3. **Réinstallez l'application** :
   ```bash
   adb uninstall space.manus.habit.tracker
   adb install app-debug.apk
   ```

## Configuration Requise pour l'Application

### Permissions Android

L'application demande les permissions suivantes :
- **Notifications** : Pour les rappels d'habitudes
- **Stockage** : Pour sauvegarder les données locales

## Mise à Jour de l'Application

Pour mettre à jour l'application :

1. **Tirez les dernières modifications** :
   ```bash
   git pull origin main
   ```

2. **Installez les dépendances** :
   ```bash
   npm install
   ```

3. **Reconstruisez l'APK** :
   ```bash
   npx expo prebuild --clean
   cd android
   ./gradlew assembleDebug
   ```

4. **Réinstallez sur votre appareil** :
   ```bash
   adb install -r android/app/build/outputs/apk/debug/app-debug.apk
   ```

## Ressources Utiles

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Android Developer Guide](https://developer.android.com/guide)
- [ADB Commands Reference](https://developer.android.com/tools/adb)

## Support

Si vous rencontrez des problèmes :

1. **Consultez les logs** :
   ```bash
   adb logcat
   ```

2. **Vérifiez les versions** :
   ```bash
   node --version
   npm --version
   java -version
   ```

3. **Ouvrez une issue** sur GitHub avec les détails du problème

---

**Dernière mise à jour :** Mai 2026  
**Version de l'application :** 1.0.0
