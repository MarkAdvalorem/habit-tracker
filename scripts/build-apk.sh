#!/bin/bash

# Script de construction automatisé pour l'APK Habit Tracker
# Usage: ./scripts/build-apk.sh [debug|release]

set -e

BUILD_TYPE=${1:-debug}
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔨 Habit Tracker APK Builder"
echo "=============================="
echo "Build Type: $BUILD_TYPE"
echo "Project Directory: $PROJECT_DIR"
echo ""

# Vérifier les prérequis
echo "✓ Vérification des prérequis..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

if ! command -v java &> /dev/null; then
    echo "❌ Java n'est pas installé"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | grep -oE 'version "[0-9]+"' | grep -oE '[0-9]+')
if [ "$JAVA_VERSION" -lt 17 ]; then
    echo "⚠️  Java 17+ est recommandé (vous avez Java $JAVA_VERSION)"
fi

# Étape 1 : Installer les dépendances
echo ""
echo "📦 Installation des dépendances..."
cd "$PROJECT_DIR"
npm install --legacy-peer-deps 2>&1 | tail -5

# Étape 2 : Générer les fichiers natifs
echo ""
echo "🔧 Génération des fichiers natifs..."
npx expo prebuild --clean --quiet

# Étape 3 : Construire l'APK
echo ""
echo "🏗️  Construction de l'APK ($BUILD_TYPE)..."
cd "$PROJECT_DIR/android"

if [ "$BUILD_TYPE" = "release" ]; then
    echo "⚠️  Pour la construction release, assurez-vous que keystore.properties est configuré"
    ./gradlew assembleRelease --no-daemon
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
else
    ./gradlew assembleDebug --no-daemon
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
fi

# Vérifier que l'APK a été généré
if [ ! -f "$APK_PATH" ]; then
    echo "❌ Erreur : L'APK n'a pas pu être généré"
    exit 1
fi

APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
echo ""
echo "✅ APK construit avec succès!"
echo "📍 Chemin : $APK_PATH"
echo "📊 Taille : $APK_SIZE"
echo ""

# Étape 4 : Installer sur appareil (optionnel)
if command -v adb &> /dev/null; then
    echo "📱 Appareils Android connectés :"
    adb devices | grep -v "List"
    
    read -p "Voulez-vous installer l'APK sur un appareil connecté? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📥 Installation de l'APK..."
        adb install -r "$APK_PATH"
        echo "✅ Installation terminée!"
    fi
else
    echo "💡 Conseil : Installez ADB pour installer automatiquement sur votre appareil"
    echo "   Android SDK Platform Tools : https://developer.android.com/tools/releases/platform-tools"
fi

echo ""
echo "🎉 Construction terminée!"
