## [0.9.6] - 2026-08-16

### Fixed

- Correction de la gestion des statuts des séries suivies.
- Correction de la pagination des séries.
- Correction de la cohérence des métriques utilisateur.
- Correction de l’ordre des séries dans le feed À voir.

## [0.9.5] - 2026-08-10

### Fixed

- Correction du bouton utilisateur.
- Correction de la pagination des séries.
- Correction de la gestion des erreurs 401.
- Correction de l’import des séries.
- Blocage des requêtes invalides côté frontend.
- Correction de l’ordre du feed après le visionnage d’un épisode.
- Correction du bouton de téléchargement.

## [0.9.4] - 2026-08-09

### Fixed

- Modification et déplacement du bouton d'installation de l'application

## [0.9.3] - 2026-08-08

### Fixed

- Correction de l'infra

## [0.9.2] - 2026-08-08

### Fixed

- Correction de la configuration et du nommage des variables d’environnement de l’API.
- Correction et refactorisation de l’authentification du worker.
- Correction de plusieurs problèmes dans l’API.
- Correction de divers bugs mineurs.

## [0.9.1] - 2026-08-06

### Fixed

- Ajout du résumé des épisodes dans la section À VOIR.
- Ajout du défilement dans la fenêtre de détails d’un épisode.

## [0.9.0] - 2026-08-06

### Added

- Ajout d’une route API pour récupérer le prochain épisode à regarder de chaque série suivie.
- Ajout de la page À VOIR pour consulter et marquer les épisodes disponibles comme regardés.

## [0.8.0] - 2026-08-05

### Added

- Ajout d’une route API pour récupérer les séries modifiées sur TMDB.
- Ajout d’une route API pour recalculer les statuts des séries suivies.
- Mise à jour du worker pour synchroniser uniquement les séries modifiées.
- Recalcul automatique des statuts utilisateur après la synchronisation.

## [0.7.0] - 2026-08-04

### Added

- Ajout d’une saison au suivi depuis la page d’une série.
- Suppression d’une saison du suivi depuis la page d’une série.
- Ajout des endpoints API permettant d’ajouter et de supprimer une saison.

## [0.6.1] - 2026-08-02

### Fixed

- Correction des couleurs des badges de statut.
- Masquage de la case à cocher pour les épisodes à venir sur leur page de détail.

## [0.6.0] - 2026-08-02

### Added

- Possibilité d’ajouter une série au suivi depuis sa fiche.
- Ajout du statut de production des séries.

### Fixed

- Masquage des saisons ne contenant aucun épisode.
- Ajout d’un texte spécifique pour les épisodes dont la diffusion n’est pas encore planifiée.

## [0.5.0] - 2026-08-02

### Added

- Ajout du nombre de séries regardées dans les statistiques utilisateur.
- Ajout d’une barre de progression sur la page de détail d’une série.
- Affichage du temps restant avant la diffusion des prochains épisodes.

### Fixed

- Amélioration du positionnement du badge de statut sur les écrans mobiles.

## [0.4.1] - 2026-08-01

### Fixed

- Augmentation du délai maximal des transactions Prisma lors de la synchronisation des séries.

## [0.4.0] - 2026-08-01

### Added

- Ajout d’un worker Dagster pour les tâches en arrière-plan.
- Ajout d’une synchronisation quotidienne des séries avec TMDB.

## [0.3.1] - 2026-07-30

### Fixed

- Correction de l’ajout automatique d’une série lors du marquage de son premier épisode comme regardé

## [0.3.0] - 2026-07-30

### Added

- Ajout de la colonne `watchCount` sur les séries suivies par un utilisateur
- Ajout d’une barre de progression sur les cartes de séries du dashboard

### Fixed

- Mise à jour automatique du statut d’une série lors de l’ajout ou de la suppression d’un épisode regardé
- Prise en compte des épisodes spéciaux dans le calcul de la progression

## [0.2.0] - 2026-07-29

### Added

- Ajout d’un endpoint dédié au résumé du dashboard
- Ajout des statistiques globales de visionnage
- Ajout du nombre total d’épisodes regardés
- Ajout du temps total de visionnage
- Ajout d’un widget de statistiques sur le dashboard
- Ajout de la gestion globale du chargement du dashboard

## [0.1.0] - 2026-07-28

### Added

- Authentification utilisateur
- Recherche et import de séries
- Affichage des saisons et épisodes
- Suivi des épisodes vus
- Mises à jour optimistes
- Dashboard utilisateur
- Pagination par curseur
- Documentation Swagger

### Fixed

- Réinitialisation du scroll lors de la navigation
- Correction de la synchronisation des épisodes vus