# Cue

Cue regroupe une API Node.js, une interface React, un worker Dagster et une base
PostgreSQL. Le mode Docker Compose fournit l'ensemble de ces services sans réseau
ou base de données préexistants.

## Démarrage avec Docker Compose

Prérequis : Docker avec le plugin Compose.

1. Créez le fichier d'environnement Docker à partir du modèle versionné :

   ```bash
   cp .env.compose.example .env.compose
   ```

2. Dans `.env.compose`, remplacez les quatre valeurs commençant par
   `replace_with_`. `BETTER_AUTH_SECRET` et `WORKER_TOKEN` doivent contenir au
   moins 32 caractères. Vous pouvez générer chaque secret avec :

   ```bash
   openssl rand -hex 32
   ```

   Les identifiants TMDB proviennent des paramètres de votre compte TMDB. Ne
   commitez jamais `.env.compose`.

3. Construisez et démarrez l'environnement :

   ```bash
   docker compose --env-file .env.compose -f compose.dev.yaml up --build
   ```

Au premier démarrage, Compose crée PostgreSQL, attend qu'il soit prêt, applique
les migrations Prisma, puis démarre l'API, le frontend et les deux processus
Dagster.

Les services sont disponibles sur :

| Service | URL locale |
| --- | --- |
| Frontend | http://localhost:5173 |
| API | http://localhost:8000 |
| Documentation API | http://localhost:8000/docs |
| Dagster | http://localhost:3001 |
| PostgreSQL | `127.0.0.1:5432` |

Le navigateur appelle `/api` sur le frontend et Nginx transmet ces requêtes au
service Docker `backend`. Dans le réseau Compose, le backend et le worker
utilisent respectivement `postgres:5432` et `http://backend:8000`; aucune URL
interne ne doit pointer vers `127.0.0.1`.

### Installer Cue dans Chrome

Cue est une Progressive Web App. Après avoir ouvert le frontend, Chrome propose
`Installer l’application` dans la page ainsi que dans son menu d’installation.
L’application s’ouvre ensuite dans sa propre fenêtre sur ordinateur ou depuis
l’écran d’accueil sur Android. En production, le frontend doit être servi en
HTTPS; `localhost` reste autorisé pour le développement.

Le service worker met uniquement en cache l’interface et ses assets statiques.
Les routes `/api` authentifiées restent toujours réseau afin de ne jamais
conserver de réponse utilisateur dans le cache PWA.

Pour arrêter les conteneurs en conservant les données :

```bash
docker compose --env-file .env.compose -f compose.dev.yaml down
```

Pour repartir volontairement d'une base vide, ajoutez `--volumes` à cette
commande. Cela supprime les volumes PostgreSQL et Dagster.

## Exécution locale sans conteneur applicatif

Le fichier `.env.local` est réservé aux processus lancés directement sur la
machine. Créez-le depuis son modèle et adaptez notamment `DATABASE_URL` à votre
PostgreSQL local :

```bash
cp .env.local.example .env.local
set -a
. ./.env.local
set +a
```

Le backend et le frontend utilisent Node 24 (`nvm use` lit le fichier `.nvmrc`).
Les variables exportées sont ensuite disponibles pour les commandes lancées
depuis les sous-dossiers, par exemple `npm run dev` dans `backend/` et
`frontend/`. Dans ce mode, `VITE_API_URL` vaut
`http://localhost:8000/api` et le worker conserve tout son état dans
`worker/.dagster`. Il faut sourcer le fichier depuis la racine afin que les
chemins Dagster basés sur `${PWD}` deviennent absolus. Le modèle ne contient
aucun secret utilisable : les valeurs `replace_with_...` doivent être remplacées.

## Migration depuis les anciens `.env`

Les anciens fichiers `backend/.env` et `worker/.env` ne sont plus lus par
`compose.dev.yaml` et ne sont pas déplacés automatiquement. L'ancien
`frontend/.env` versionné est remplacé par le modèle racine `.env.local.example`.

- Pour Docker, copiez uniquement les secrets utiles dans `.env.compose` :
  `BETTER_AUTH_SECRET`, `WORKER_TOKEN`, `TMDB_API_TOKEN` et `TMDB_API_KEY`.
- Ne recopiez pas les anciennes valeurs de `DATABASE_URL`, `API_URL`,
  `DAGSTER_HOME`, `DAGSTER_STORAGE_DIR`, `DAGSTER_COMPUTE_LOGS_DIR` ou
  `VITE_API_URL`. Compose impose les valeurs adaptées à son
  réseau : PostgreSQL via `postgres`, l'API worker via `backend`, Dagster dans
  `/opt/dagster/dagster_home` et le frontend via `/api`.
- Pour une exécution sur l'hôte, reportez les valeurs nécessaires dans
  `.env.local`, dont les URLs utilisent `127.0.0.1` ou `localhost`.
- Après avoir vérifié les deux modes, vous pouvez archiver ou supprimer vous-même
  les anciens fichiers. Ils restent ignorés par Git entre-temps.

Cette séparation est volontaire : utilisez toujours `--env-file .env.compose`
avec Compose et ne réutilisez pas `.env.local` dans les conteneurs.

## Environnement de production

Les fichiers externes attendus par `compose.prod.yaml` disposent aussi de
modèles versionnés :

| Modèle | Destination sur le serveur |
| --- | --- |
| `.env.production.api.example` | `/etc/cue-api.env` |
| `.env.production.worker.example` | `/etc/cue-worker.env` |

Copiez-les sur le serveur avec des permissions restrictives, remplacez chaque
placeholder et utilisez exactement le même `WORKER_TOKEN` dans les deux
fichiers. Le fichier API contient toutes les variables validées au démarrage :
`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `CLIENT_ORIGIN`,
`WORKER_TOKEN`, `TMDB_API_TOKEN` et `TMDB_API_KEY`. Le fichier worker contient
`DATABASE_URL` et `WORKER_TOKEN`; Compose impose son `API_URL` et ses chemins
Dagster.

Dans les deux fichiers, `DATABASE_URL` doit utiliser le nom DNS PostgreSQL
joignable sur le réseau Docker `infrastructure`, jamais `127.0.0.1` ou
`localhost`. Vérifiez ensuite le rendu sans afficher les secrets :

```bash
docker compose -f compose.prod.yaml config --quiet
```

## Contrats API

Les schémas Zod et les routes du backend produisent la source de vérité OpenAPI
versionnée dans `contracts/openapi.json`. Après une modification d'endpoint :

```bash
cd backend
npm run openapi:generate

cd ../frontend
npm run api:generate
```

Le frontend consomme le SDK généré dans `frontend/src/api/generated`. Le worker
valide ses modèles Pydantic contre le même contrat. Les commandes
`openapi:check`, `api:check` et les tests de contrat du worker sont exécutés par
la CI afin de refuser tout artefact obsolète ou toute dérive de forme.
