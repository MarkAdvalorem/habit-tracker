# Habit Tracker - TODO

> **Architecture : 100% hors-ligne.** Aucune connexion, aucun compte, aucun serveur.
> Toutes les données (habitudes, complétions, notes, archives, réglages) vivent dans AsyncStorage sur l'appareil.
> L'historique détaillé des sprints 1 à 53 (dont l'ère Supabase) est dans l'historique git de ce fichier.

## Fonctionnalités en place

- [x] Liste des habitudes, toggle de complétion, streaks, salutation + date du jour
- [x] Création / édition / suppression d'habitudes (catégories, couleurs, icônes, fréquences, plage horaire optionnelle)
- [x] Détail d'une habitude : calendrier mensuel, édition des jours passés, notes par complétion
- [x] Statistiques : globales, graphique mensuel, comparaison hebdo, heatmap annuelle, classement, filtres de période
- [x] Badges et confettis
- [x] Archive d'habitudes (archiver / restaurer / supprimer)
- [x] Réordonnancement par glisser-déposer
- [x] Mode vacances (streaks gelés + rappel J-1)
- [x] Notifications **locales** : rappel de début et de fin d'habitude, rappel de fin de vacances
- [x] Thème clair / sombre / auto
- [x] 6 langues (FR, EN, IT, DE, RU, ES) + écran de choix de langue au premier lancement
- [x] Onboarding (8 slides) + tutoriel in-app (coach marks)
- [x] Export CSV / HTML (PDF) via la feuille de partage
- [x] Réinitialisation des données (locale, avec confirmation)

## Sprint 54 — Passage au 100% hors-ligne — **COMPLÉTÉ**

### Stockage local
- [x] `lib/habit-context.tsx` réécrit : une seule liste `habits` (actives + archivées) persistée dans AsyncStorage (clé `habits`)
- [x] Réglages sous la clé `settings` (plus de clé par utilisateur)
- [x] `archivedHabits` exposé par le contexte ; `app/archived-habits.tsx` lit le contexte au lieu de Supabase
- [x] `resetAllData()` : vide habitudes + réglages et annule toutes les notifications (plus de mot de passe)
- [x] Correctif : `updateHabit` reprogrammait les notifications avec l'ancienne version de l'habitude

### Navigation
- [x] Parcours : choix de langue → onboarding → onglets (plus d'écran de login)
- [x] Suppression de l'écran « pas de connexion », de la bannière hors-ligne et de la bannière email non vérifié
- [x] Paramètres : suppression du bouton de déconnexion et de la modale de mot de passe

### Ménage
- [x] Supprimés : `app/auth/*`, `app/oauth/*`, Supabase (client, fetch, realtime, file de synchro), tRPC, push tokens, `server/`, `drizzle/`, `shared/`, `supabase/`, scripts Supabase
- [x] Dépendances retirées : `@supabase/supabase-js`, `@trpc/*`, `@tanstack/react-query`, `@react-native-community/netinfo`, `express`, `drizzle-orm`, `mysql2`, `jose`, `axios`, `cookie`, `superjson`, `zod`, `expo-server-sdk`, `expo-secure-store` (+ outils serveur en dev)
- [x] Scripts npm : `pnpm dev` lance uniquement Metro ; scripts serveur et `db:push` supprimés
- [x] i18n : clés `auth.*`, `offline.*`, déconnexion et mot de passe supprimées des 6 langues ; slide 7 « 100% hors-ligne & privé » ; « À propos » → AsyncStorage
- [x] Tests liés à Supabase / synchro / push supprimés

### Vérification
- [x] TypeScript : 0 erreur
- [x] ESLint : 0 erreur, 0 avertissement
- [x] Tests : 130 passés

## Sprint 55 — Sélecteur d'heure et plage horaire optionnelle — **COMPLÉTÉ**

- [x] Sélecteur d'heure : les colonnes heure / minute restent alignées après défilement (`snapToInterval` + recalage sur le web)
- [x] Plage horaire : suppression du double espace dans « 12:00 -  10:00 »
- [x] Interrupteur « Plage horaire » sur la création / édition d'habitude (même style que le mode vacances)
- [x] Habitude sans heure : section « Non planifié » sur l'accueil, jamais en retard, aucun rappel
- [x] Retirer l'heure d'une habitude existante annule ses rappels programmés
- [x] Tests manuels validés

## À faire

### Données
- [ ] Import d'une sauvegarde (aujourd'hui : export seulement → en cas de changement de téléphone, les données sont perdues)
- [ ] Récupérer les anciennes données Supabase des utilisateurs existants (export unique depuis le dashboard Supabase puis import) — seulement si besoin
- [ ] Test du `HabitProvider` réel (chargement / persistance AsyncStorage) — les tests actuels testent la logique copiée, pas le provider

### Tests manuels
- [x] Mode avion : créer, cocher, archiver, redémarrer l'app → tout est conservé
- [x] Notifications locales sur iOS et Android (appareil réel)
- [x] Traductions sur tous les écrans
- [x] Différentes tailles d'écran
- [x] Accessibilité
- [x] Performances avec beaucoup d'habitudes / un long historique

### Documentation et déploiement
- [x] Docs obsolètes (`SETUP_LOCAL.md`, `INSTALLATION_RAPIDE.md`) supprimées, section Supabase retirée d'`APK_BUILD_GUIDE.md`
- [ ] Nettoyer `.env` / `.env.local` (clés Supabase et JWT devenues inutiles)
- [ ] Renommer le bundle id (`space.manus...`) et le `name` du package (`app-template`) avant publication
- [ ] Préparer le déploiement sur App Store et Google Play
- [ ] Créer un guide utilisateur

## Notes

- Suivre les directives d'interface humaine Apple (HIG) pour iOS
- Assurer la cohérence du design à travers tous les écrans
