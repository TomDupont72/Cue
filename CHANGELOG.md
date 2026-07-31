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