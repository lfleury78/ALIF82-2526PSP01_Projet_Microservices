# Exemples d'utilisation - API Gateway

## 📌 Table des matières

1. [Exemple 1: Health Check du Gateway](#exemple-1-health-check)
2. [Exemple 2: Lister toutes les routes](#exemple-2-routes)
3. [Exemple 3: GET simple](#exemple-3-get-simple)
4. [Exemple 4: POST avec body](#exemple-4-post)
5. [Exemple 5: PUT mise à jour](#exemple-5-put)
6. [Exemple 6: DELETE suppression](#exemple-6-delete)
7. [Exemple 7: Erreur - Route non trouvée](#exemple-7-404)
8. [Exemple 8: Erreur - Méthode non supportée](#exemple-8-405)

---

## Exemple 1: Health Check

### Requête
```bash
curl -X GET http://localhost:8081/api/gateway/health
```

### Réponse
```json
{
  "success": true,
  "message": "Gateway is running",
  "data": null,
  "statusCode": 200
}
```

---

## Exemple 2: Lister toutes les routes

### Requête
```bash
curl -X GET http://localhost:8081/api/gateway/routes
```

### Réponse
```json
{
  "success": true,
  "message": "Routes retrieved successfully",
  "data": [
    {
      "path": "/api/location",
      "microservice": "http://localhost:8083",
      "methods": ["GET", "POST", "PUT", "DELETE"]
    },
    {
      "path": "/api/reservation",
      "microservice": "http://localhost:8084",
      "methods": ["GET", "POST", "PUT", "DELETE"]
    },
    {
      "path": "/api/user",
      "microservice": "http://localhost:8085",
      "methods": ["GET", "POST", "PUT", "DELETE"]
    },
    {
      "path": "/api/payment",
      "microservice": "http://localhost:8086",
      "methods": ["GET", "POST", "PUT"]
    }
  ],
  "statusCode": 200
}
```

---

## Exemple 3: GET simple

### Requête 3a: Lister les locations

```bash
curl -X GET http://localhost:8081/api/location
```

#### Flux en détail:

1. Gateway reçoit: `GET /api/location`
2. Extrait le path: `/api/location`
3. Cherche dans routes.yml: `/api/location` → `http://localhost:8083`
4. Valide: GET est supporté ✓
5. Envoie vers: `http://localhost:8083/api/location`
6. Microservice respond
7. Gateway renvoie au client

#### Réponse réussie:

```json
{
  "success": true,
  "message": "Request processed successfully",
  "data": [
    {
      "id": 1,
      "name": "Studio Parisien",
      "city": "Paris",
      "country": "France",
      "price": 150,
      "capacity": 2
    },
    {
      "id": 2,
      "name": "Apartment Lyon",
      "city": "Lyon",
      "country": "France",
      "price": 95,
      "capacity": 3
    }
  ],
  "statusCode": 200
}
```

### Requête 3b: Récupérer une location spécifique

```bash
curl -X GET http://localhost:8081/api/location/1
```

#### Réponse:

```json
{
  "success": true,
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "name": "Studio Parisien",
    "city": "Paris",
    "country": "France",
    "price": 150,
    "capacity": 2,
    "description": "Vue sur la Tour Eiffel"
  },
  "statusCode": 200
}
```

---

## Exemple 4: POST - Créer une nouvelle location

### Requête

```bash
curl -X POST http://localhost:8081/api/location \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Villa en Provence",
    "city": "Aix-en-Provence",
    "country": "France",
    "price": 250,
    "capacity": 6,
    "description": "Belle villa avec piscine"
  }'
```

#### Flux:

1. Gateway reçoit POST avec body
2. Valide que POST est supporté pour `/api/location`
3. Envoie vers: `http://localhost:8083/api/location`
4. Microservice crée la location
5. Retourne la location créée

#### Réponse réussie (201 Created):

```json
{
  "success": true,
  "message": "Request processed successfully",
  "data": {
    "id": 3,
    "name": "Villa en Provence",
    "city": "Aix-en-Provence",
    "country": "France",
    "price": 250,
    "capacity": 6,
    "description": "Belle villa avec piscine"
  },
  "statusCode": 201
}
```

---

## Exemple 5: PUT - Mettre à jour une location

### Requête

```bash
curl -X PUT http://localhost:8081/api/location/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Studio Parisien - Vue Eiffel",
    "price": 175
  }'
```

#### Flux:

1. Gateway reçoit PUT pour `/api/location/1`
2. Valide PUT est supporté
3. Envoie vers: `http://localhost:8083/api/location/1`
4. Microservice met à jour
5. Retourne la location mise à jour

#### Réponse réussie:

```json
{
  "success": true,
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "name": "Studio Parisien - Vue Eiffel",
    "city": "Paris",
    "country": "France",
    "price": 175,
    "capacity": 2
  },
  "statusCode": 200
}
```

---

## Exemple 6: DELETE - Supprimer une location

### Requête

```bash
curl -X DELETE http://localhost:8081/api/location/1
```

#### Flux:

1. Gateway reçoit DELETE pour `/api/location/1`
2. Valide DELETE est supporté
3. Envoie vers: `http://localhost:8083/api/location/1`
4. Microservice supprime
5. Retourne confirmation

#### Réponse réussie:

```json
{
  "success": true,
  "message": "Request processed successfully",
  "data": {
    "message": "Location with ID 1 has been deleted"
  },
  "statusCode": 200
}
```

---

## Exemple 7: Erreur - Route non trouvée (404)

### Requête

```bash
curl -X GET http://localhost:8081/api/unknown/endpoint
```

#### Flux:

1. Gateway reçoit GET `/api/unknown/endpoint`
2. Cherche dans routes.yml
3. **Aucune route match** ❌
4. Retourne erreur 404

#### Réponse d'erreur:

```json
{
  "success": false,
  "message": "Route not found for path: /api/unknown/endpoint",
  "data": null,
  "statusCode": 404
}
```

#### Logs du Gateway:

```
🔷 GATEWAY REQUEST
   Method: GET
   Path: /api/unknown/endpoint
────────────────────────────────────────
❌ No microservice found for path: /api/unknown/endpoint
────────────────────────────────────────
   Status: ✗ ERROR
   Message: Route not found for path: /api/unknown/endpoint
```

---

## Exemple 8: Erreur - Méthode non supportée (405)

### Requête

Supposons que seul GET est supporté pour `/api/location/1`:

```bash
curl -X PATCH http://localhost:8081/api/location/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated"}'
```

#### Flux:

1. Gateway reçoit PATCH
2. Trouve la route pour `/api/location`
3. Valide les méthodes supportées: GET, POST, PUT, DELETE
4. **PATCH n'est pas dans la liste** ❌
5. Retourne erreur 405

#### Réponse d'erreur:

```json
{
  "success": false,
  "message": "Method PATCH not supported for this endpoint",
  "data": null,
  "statusCode": 405
}
```

#### Logs du Gateway:

```
🔷 GATEWAY REQUEST
   Method: PATCH
   Path: /api/location/1
────────────────────────────────────────
❌ Method PATCH not supported for path: /api/location/1
────────────────────────────────────────
   Status: ✗ ERROR
   Message: Method PATCH not supported for this endpoint
```

---

## Exemple 9: Erreur - Microservice indisponible (503)

### Requête

```bash
curl -X GET http://localhost:8081/api/location/1
```

*(Supposons que le microservice sur 8083 n'est pas démarré)*

#### Flux:

1. Gateway reçoit GET
2. Trouve la route: `/api/location` → `http://localhost:8083`
3. Essaye d'appeler le microservice
4. **Connexion refusée** ❌
5. Retourne erreur 503

#### Réponse d'erreur:

```json
{
  "success": false,
  "message": "Error communicating with microservice: Connection refused",
  "data": null,
  "statusCode": 503
}
```

#### Logs du Gateway:

```
🔷 GATEWAY REQUEST
   Method: GET
   Path: /api/location/1
────────────────────────────────────────
→ Routing GET request from /api/location/1 to http://localhost:8083/api/location/1
❌ Error calling microservice: I/O error on GET request for "http://localhost:8083/api/location/1": Connection refused
────────────────────────────────────────
   Status: ✗ ERROR
   Message: Error communicating with microservice: Connection refused
```

---

## Scripts cURL complets

### Test complet avec Bash

```bash
#!/bin/bash

BASE_URL="http://localhost:8081"

echo "1. Health Check"
curl -s $BASE_URL/api/gateway/health | jq

echo "2. Lister les routes"
curl -s $BASE_URL/api/gateway/routes | jq

echo "3. Créer une location"
LOCATION_ID=$(curl -s -X POST $BASE_URL/api/location \
  -H "Content-Type: application/json" \
  -d '{"name": "Studio Test", "city": "Paris", "price": 100, "capacity": 2}' | jq -r '.data.id')

echo "Location créée avec ID: $LOCATION_ID"

echo "5. Récupérer la location"
curl -s $BASE_URL/api/location/$LOCATION_ID | jq

echo "6. Mettre à jour"
curl -s -X PUT $BASE_URL/api/location/$LOCATION_ID \
  -H "Content-Type: application/json" \
  -d '{"name": "Studio Updated", "price": 150}' | jq

echo "7. Supprimer"
curl -s -X DELETE $BASE_URL/api/location/$LOCATION_ID | jq
```

### Test complet avec PowerShell

```powershell
$BASE_URL = "http://localhost:8081"

Write-Host "1. Health Check" -ForegroundColor Green
Invoke-RestMethod "$BASE_URL/api/gateway/health" | ConvertTo-Json

Write-Host "`n2. Lister les routes" -ForegroundColor Green
Invoke-RestMethod "$BASE_URL/api/gateway/routes" | ConvertTo-Json

Write-Host "`n3. Créer une location" -ForegroundColor Green
$newLocation = @{
    name = "Studio Test"
    city = "Paris"
    price = 100
    capacity = 2
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "$BASE_URL/api/location" -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $newLocation

$locationId = $response.data.id
Write-Host "Location créée avec ID: $locationId" -ForegroundColor Cyan

Write-Host "`n4. Récupérer la location" -ForegroundColor Green
Invoke-RestMethod "$BASE_URL/api/location/$locationId" | ConvertTo-Json

Write-Host "`n5. Supprimer" -ForegroundColor Green
Invoke-RestMethod -Uri "$BASE_URL/api/location/$locationId" -Method DELETE | ConvertTo-Json
```

---

## Récapitulatif codes d'erreur

| Code | Signification | Cause |
|------|---------------|-------|
| 200 | OK | Requête réussie |
| 201 | Created | Ressource créée avec succès |
| 400 | Bad Request | Requête malformée |
| 404 | Not Found | Route n'existe pas |
| 405 | Method Not Allowed | Méthode HTTP non supportée |
| 500 | Internal Server Error | Erreur serveur |
| 503 | Service Unavailable | Microservice indisponible |
