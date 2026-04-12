# Reservation Service (`reservation-service`)

Ce README documente uniquement la partie **réservation**.

## Démarrage rapide

### Lancer MySQL + reservation-service

```bash
docker compose up -d --build mysql reservation-service
```

Services exposés :
- **MySQL**: `localhost:3307` (port 3306 pris, donc mappé en 3307)
- **reservation-service**: `http://localhost:3003`

## Auth (version simple)

Par défaut, l’auth est **optionnelle** (pas besoin de Keycloak pour tester).

Variable d’environnement (dans `docker-compose.yml`) :
- **`AUTH_MODE`**:
  - `optional` (défaut): token facultatif
  - `required`: token obligatoire + variables Keycloak obligatoires
  - `off`: aucune auth

## Endpoints (3003)

- **GET** `/health`
- **GET** `/reservations` (filtres):
  - `?id_locataire=1`
  - `?id_annonce=3`
  - `?statut=CONFIRMEE`
- **GET** `/reservations/:id`
- **POST** `/reservations` : crée une réservation (statut `EN_ATTENTE`)
- **POST** `/reservations/:id/validate` : valide une réservation (statut `CONFIRMEE`)
- **PATCH** `/reservations/:id/status` : met à jour le statut
- **DELETE** `/reservations/:id` : supprime une réservation

### POST /reservations

Body JSON :

```json
{
  "id_annonce": 1,
  "id_locataire": 1,
  "date_debut": "2026-08-10",
  "date_fin": "2026-08-12",
  "nb_voyageurs": 2
}
```

Règle anti double réservation :
- si le **logement** est déjà réservé sur la période (statut `EN_ATTENTE` ou `CONFIRMEE`), l’API renvoie **409** :

```json
{
  "error": "date_conflict",
  "message": "Le logement est déjà réservé pendant cette période"
}
```

### POST /reservations/:id/validate

Valide une réservation en la passant au statut `CONFIRMEE`.

- Endpoint **idempotent**: si la réservation est déjà `CONFIRMEE`, renvoie **200**.
- Transition autorisée: uniquement depuis `EN_ATTENTE` (sinon **409** `invalid_transition`).
- Vérifie aussi les conflits de dates sur le même logement (sinon **409** `date_conflict`).

### PATCH /reservations/:id/status

Body JSON :

```json
{ "statut": "CONFIRMEE" }
```

Valeurs possibles :
- `EN_ATTENTE`
- `CONFIRMEE`
- `ANNULEE`
- `TERMINEE`

## Exemples (curl)

```bash
curl http://localhost:3003/reservations
```

Créer une réservation :

```bash
curl -X POST http://localhost:3003/reservations \
  -H "Content-Type: application/json" \
  -d '{"id_annonce":1,"id_locataire":1,"date_debut":"2026-08-10","date_fin":"2026-08-12","nb_voyageurs":2}'
```

Valider une réservation :

```bash
curl -X POST http://localhost:3003/reservations/1/validate
```

## Tester via Postman (sans Keycloak)

- Base URL: `http://localhost:3003`
- **GET** `/health`
- **GET** `/reservations`
- **GET** `/reservations?id_locataire=1`
- **GET** `/reservations?id_annonce=3`
- **GET** `/reservations?statut=CONFIRMEE`
- **GET** `/reservations/1`
- **POST** `/reservations` (avec le JSON ci-dessus)
- **POST** `/reservations/1/validate`
- **PATCH** `/reservations/1/status` avec body `{"statut":"ANNULEE"}`
- **DELETE** `/reservations/1`