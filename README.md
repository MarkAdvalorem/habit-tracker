# 📱 Habit Tracker

Application mobile de suivi d'habitudes, **100% hors-ligne** : aucun compte, aucun serveur, toutes les données restent sur le téléphone (AsyncStorage).

Expo 54 · React Native 0.81 · TypeScript · NativeWind · Expo Router · Vitest

## ✨ Fonctionnalités

- **Habitudes** : création / édition / archivage, 8 catégories, fréquences (quotidienne à mensuelle), couleur, icône, notes par complétion, réordonnancement par glisser-déposer
- **Plage horaire optionnelle** : avec heure → rappel 15 min avant le début et la fin ; sans heure → section « Non planifié », aucun rappel
- **Statistiques** : tendances, graphique mensuel, comparaison hebdo, heatmap annuelle, classement, filtres de période
- **Badges** : 6 badges avec confettis
- **Mode vacances** : streaks gelés + rappel la veille de la fin
- **Réglages** : thème clair / sombre / auto, 6 langues (FR, EN, IT, DE, RU, ES), export CSV ou HTML/PDF, réinitialisation
- **Premier lancement** : choix de langue, onboarding en 8 slides, tutoriel interactif

## 🚀 Démarrage

Prérequis : Node.js 18+ et pnpm 9+. Aucune variable d'environnement n'est nécessaire.

```bash
pnpm install
pnpm dev
```

Puis ouvrez http://localhost:8081, ou scannez le QR code avec **Expo Go**. Pour un émulateur : `pnpm ios` / `pnpm android`. Pour un APK : voir [APK_BUILD_GUIDE.md](./APK_BUILD_GUIDE.md).

## 📦 Commandes

```bash
pnpm test        # Tests (ajouter -- --watch ou -- --coverage)
pnpm check       # TypeScript
pnpm lint        # ESLint
pnpm format      # Prettier
pnpm qr "exp://…"  # QR code à partir d'une URL
```

Un hook pre-commit (`scripts/setup-hooks.sh`) lance TypeScript, ESLint et les tests avant chaque commit.

## 💾 Données

| Clé AsyncStorage | Contenu |
|------------------|---------|
| `habits` | Toutes les habitudes (actives et archivées), complétions et notes |
| `settings` | Thème, langue, notifications, mode vacances |
| `app_language` | Langue choisie au premier lancement |

⚠️ Pas encore d'import de sauvegarde : désinstaller l'app ou changer de téléphone efface les données. Utilisez l'export CSV pour garder une copie.

## 📂 Structure

```
app/                  # Écrans (Expo Router) : (tabs)/, add-habit, habit-detail/[id], archived-habits, onboarding…
components/           # Composants (graphiques, calendrier, sélecteur d'heure, modales…)
lib/
├── habit-context.tsx          # État des habitudes + persistance
├── notification-scheduler.ts  # Notifications locales
├── i18n/                      # Traductions
└── __tests__/                 # Tests unitaires
hooks/                # Couleurs, thème, traduction
scripts/              # Build APK, hooks git, QR code
```

## 🌍 Ajouter une langue

1. Copier `lib/i18n/fr.json` vers `lib/i18n/xx.json` et traduire
2. L'importer dans `hooks/use-translation.ts`
3. Ajouter le code au type `Language` (`lib/types.ts`) et à `app/language-select.tsx`

## 🐛 Dépannage

- **L'app ne démarre pas** : `rm -rf node_modules .expo && pnpm install`
- **Modifications invisibles** : touche `r` dans le terminal, ou `npx expo start --clear`
- **Port 8081 occupé** : `lsof -i :8081` puis `kill <PID>`
- **Pas de notification** : vérifier les permissions et que la plage horaire est activée sur l'habitude

## 📌 Suite

Voir [todo.md](./todo.md) : import de sauvegarde, préparation de la publication sur les stores.
