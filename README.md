# 📱 Habit Tracker

Une application mobile de suivi des habitudes quotidiennes, **100% hors-ligne**, construite avec **Expo**, **React Native**, **TypeScript** et **NativeWind (Tailwind CSS)**.

Aucun compte, aucun serveur, aucune connexion internet : toutes les données restent sur le téléphone (AsyncStorage).

## ✨ Fonctionnalités

### 🏠 Écran d'Accueil
- Liste des habitudes avec cartes interactives
- Toggle pour marquer une habitude comme complétée
- Affichage du streak (nombre de jours consécutifs)
- Bouton flottant pour créer une nouvelle habitude
- Date du jour et salutation personnalisée
- Réordonnancement par glisser-déposer

### 🗂️ Gestion des Habitudes
- Création, édition, suppression d'habitudes
- 8 catégories (Santé & Sport, Apprentissage, Travail, Bien-être, Social & Loisirs, Organisation, Finances, Autre)
- Fréquences : quotidienne, 2 à 5 fois par semaine, hebdomadaire, mensuelle
- Couleur et icône personnalisées
- Plages horaires configurables
- Notes par complétion
- Archive d'habitudes (archiver / restaurer / supprimer)

### 📊 Statistiques Détaillées
- Statistiques globales (total d'habitudes, complétées aujourd'hui)
- Graphiques de tendance et graphique mensuel avec dégradé d'intensité
- Comparaison hebdomadaire (semaine actuelle vs précédente)
- Heatmap annuelle style GitHub
- Classement des habitudes par performance
- Filtres par période (semaine, mois, année)

### 🏆 Badges et Récompenses
- 6 badges débloquables (Streak Master, Consistency, Milestone, Perfect Day, Week Warrior, Month Master)
- Animation de confettis lors du déblocage
- Progression vers les badges suivants

### 🔔 Notifications Locales
- Rappel 15 minutes avant le début et la fin de chaque habitude (si une plage horaire est définie)
- Mode vacances : streaks gelés + rappel la veille de la fin des vacances
- Aucune notification push : tout est programmé sur l'appareil

### 🎨 Paramètres et Personnalisation
- Thème Clair / Sombre / Auto
- 6 langues : français, anglais, italien, allemand, russe, espagnol
- Export des données en CSV ou HTML/PDF (feuille de partage)
- Réinitialisation des données avec confirmation

### 🎯 Premier Lancement
- Choix de la langue
- Onboarding en 8 slides
- Tutoriel interactif (coach marks) tant qu'aucune habitude n'existe

## 💾 Données

Tout est stocké localement dans AsyncStorage :

| Clé | Contenu |
|-----|---------|
| `habits` | Toutes les habitudes (actives et archivées), avec complétions et notes |
| `settings` | Thème, langue, notifications, mode vacances |
| `app_language` | Langue choisie au premier lancement |

⚠️ Il n'existe pas encore d'import de sauvegarde : désinstaller l'app ou changer de téléphone efface les données. Utilisez l'export CSV pour garder une copie.

## 🛠️ Stack Technique

| Technologie | Version | Utilité |
|-------------|---------|---------|
| **Expo** | 54 | Framework React Native |
| **React Native** | 0.81 | Framework mobile |
| **React** | 19 | Bibliothèque UI |
| **TypeScript** | 5.9 | Typage statique |
| **NativeWind** | 4 | Tailwind CSS pour React Native |
| **Expo Router** | 6 | Routage et navigation |
| **AsyncStorage** | 2.2 | Stockage local des données |
| **expo-notifications** | 0.32 | Notifications locales |
| **Vitest** | 2.1 | Tests unitaires |
| **i18n** | Personnalisé | Internationalisation |

## 📋 Prérequis

- **Node.js** (v18+) - [Télécharger](https://nodejs.org/)
- **pnpm** (v9+)
  ```bash
  npm install -g pnpm
  ```
- **Git**

Aucune variable d'environnement ni aucun service externe n'est nécessaire.

## 🚀 Démarrage Rapide

```bash
git clone <votre-repository-url> habit-tracker-app
cd habit-tracker-app
pnpm install
pnpm dev
```

`pnpm dev` démarre Metro sur http://localhost:8081 (aperçu web) et affiche un QR code dans le terminal.

## 📱 Aperçu de l'App

### Option 1 : Expo Go sur Téléphone (Recommandé)
1. Installez **Expo Go** depuis l'[App Store](https://apps.apple.com/app/expo-go/id982107779) ou [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Lancez `pnpm dev`
3. Scannez le QR code affiché dans le terminal

### Option 2 : Web
Ouvrez http://localhost:8081 dans votre navigateur.

### Option 3 : Émulateur
```bash
pnpm ios       # iOS
pnpm android   # Android
```

### Construire un APK
Voir [APK_BUILD_GUIDE.md](./APK_BUILD_GUIDE.md) ou lancez `scripts/build-apk.sh`.

## 📂 Structure du Projet

```
habit-tracker-app/
├── app/                           # Écrans et routes (Expo Router)
│   ├── (tabs)/                    # Écrans avec barre de navigation
│   │   ├── index.tsx              # Accueil
│   │   ├── statistics.tsx         # Statistiques
│   │   ├── badges.tsx             # Badges
│   │   └── settings.tsx           # Paramètres
│   ├── habit-detail/[id].tsx      # Détail d'une habitude
│   ├── add-habit.tsx              # Création / édition
│   ├── archived-habits.tsx        # Habitudes archivées
│   ├── language-select.tsx        # Choix de langue (1er lancement)
│   ├── onboarding.tsx             # Onboarding
│   └── _layout.tsx                # Layout racine et providers
├── components/                    # Composants réutilisables (graphiques, calendrier, heatmap, modales…)
├── lib/                           # Logique métier
│   ├── habit-context.tsx          # État des habitudes + persistance AsyncStorage
│   ├── notification-scheduler.ts  # Programmation des notifications locales
│   ├── badges.ts                  # Logique des badges
│   ├── streak-utils.ts            # Calcul des streaks
│   ├── export-service.ts          # Export CSV / HTML
│   ├── tutorial-context.tsx       # Tutoriel coach marks
│   ├── i18n/                      # Traductions (fr, en, it, de, ru, es)
│   └── __tests__/                 # Tests unitaires
├── hooks/                         # Hooks (couleurs, thème, traduction)
├── assets/images/                 # Icônes et splash screen
├── scripts/                       # Build APK, hooks git, QR code
├── app.config.ts                  # Configuration Expo
└── todo.md                        # Suivi des tâches
```

## 🧪 Tests et Vérification

```bash
pnpm test                    # Lancer les tests
pnpm test -- --watch         # Mode watch
pnpm test -- --coverage      # Avec couverture
pnpm check                   # Vérifier TypeScript
pnpm lint                    # Linter
pnpm format                  # Formater
```

**État actuel :** ✅ 130 tests passent.

Un hook pre-commit (`scripts/pre-commit`, installé via `scripts/setup-hooks.sh`) lance TypeScript, ESLint et les tests avant chaque commit.

## 🎨 Thème et Styling

L'application utilise **NativeWind** avec une palette de tokens qui s'adapte automatiquement au mode sombre (sans préfixe `dark:`).

| Token | Utilité |
|-------|---------|
| `background` | Fond d'écran/page |
| `foreground` | Texte principal |
| `muted` | Texte secondaire |
| `primary` | Couleur d'accent |
| `surface` | Cartes/surfaces élevées |
| `border` | Bordures/séparateurs |
| `success` / `warning` / `error` | États |

## 🌍 Internationalisation

```tsx
import { useTranslation } from '@/hooks/use-translation';

export function MyComponent() {
  const t = useTranslation();
  return <Text>{t('common.welcome')}</Text>;
}
```

### Ajouter une Nouvelle Langue

1. Créez `lib/i18n/xx.json` en copiant la structure de `fr.json`
2. Traduisez toutes les clés
3. Importez-la dans `hooks/use-translation.ts`
4. Ajoutez le code au type `Language` dans `lib/types.ts` et à l'écran `app/language-select.tsx`

## 📦 Commandes Utiles

```bash
pnpm dev              # Démarrer Metro (web + QR code Expo Go)
pnpm ios              # Lancer sur iOS
pnpm android          # Lancer sur Android
pnpm test             # Tests
pnpm check            # TypeScript
pnpm lint             # ESLint
pnpm format           # Prettier
pnpm qr "exp://…"     # Générer un QR code (expo-qr-code.png) à partir d'une URL
```

## 🐛 Dépannage

### L'app ne démarre pas
```bash
rm -rf node_modules .expo
pnpm install
pnpm dev
```

### Les modifications ne s'affichent pas
- Rechargez l'app (touche `r` dans le terminal)
- Videz le cache : `npx expo start --clear`

### Port déjà utilisé
```bash
lsof -i :8081
kill -9 <PID>
```

### Les notifications ne s'affichent pas
- Vérifiez que les permissions de notification sont accordées
- Une plage horaire doit être définie sur l'habitude pour recevoir un rappel

## 📚 Ressources

- [Documentation Expo](https://docs.expo.dev/)
- [Documentation React Native](https://reactnative.dev/)
- [Documentation NativeWind](https://www.nativewind.dev/)
- [Documentation Expo Router](https://docs.expo.dev/router/introduction/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

## 📚 Prochaines Étapes

Voir [todo.md](./todo.md), notamment :
- Import d'une sauvegarde (aujourd'hui : export seulement)
- Tests manuels sur appareils iOS et Android
- Préparation de la publication sur les stores

## 👥 Contribution

1. Fork le repository
2. Créez une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Commitez (`git commit -m 'Ajout de ma fonctionnalité'`)
4. Poussez (`git push origin feature/ma-fonctionnalite`)
5. Ouvrez une Pull Request

---

**Version :** 1.0.0
