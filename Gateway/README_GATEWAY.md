# API Gateway

API Gateway qui routage les requêtes vers les microservices appropriés basé sur la configuration des routes.

## Architecture

```
CLIENT
  ↓
GATEWAY (port 8081)
  ↓
Routes Configuration (routes.yml)
  ↓
Microservice approprié (port 8083, 8084, 8085, 8086, ...)
```

## Configuration des Routes

Les routes sont définies dans `src/main/resources/routes.yml` :

```yaml
routes:
  - path: /api/location
    microservice: http://localhost:8083
    methods: [ GET, POST, PUT, DELETE ]
  
  - path: /api/reservation
    microservice: http://localhost:8084
    methods: [ GET, POST, PUT, DELETE ]
```

### Structure d'une route

- **path**: Le chemin de l'endpoint (ex: `/api/location`)
- **microservice**: L'URL du microservice (ex: `http://localhost:8083`)
- **methods**: Les méthodes HTTP supportées (GET, POST, PUT, DELETE)

## Endpoints du Gateway

### 1. Endpoints génériques (routés vers les microservices)

Tous les appels à `/api/**` sont capturés et routés vers le microservice approprié :

```bash
# GET request
curl http://localhost:8081/api/location/1

# POST request
curl -X POST http://localhost:8081/api/location \
  -H "Content-Type: application/json" \
  -d '{"name": "Studio", "city": "Paris"}'

# PUT request
curl -X PUT http://localhost:8081/api/location/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Studio"}'

# DELETE request
curl -X DELETE http://localhost:8081/api/location/1
```

### 2. Endpoints du Gateway

#### Health Check
```bash
curl http://localhost:8081/api/gateway/health

# Réponse:
{
  "success": true,
  "message": "Gateway is running",
  "data": null,
  "statusCode": 200
}
```

#### Get All Routes
```bash
curl http://localhost:8081/api/gateway/routes

# Réponse:
{
  "success": true,
  "message": "Routes retrieved successfully",
  "data": [
    {
      "path": "/api/location",
      "microservice": "http://localhost:8083",
      "methods": ["GET", "POST", "PUT", "DELETE"]
    },
    ...
  ],
  "statusCode": 200
}
```

## Flux de Requête

### Exemple: GET /api/location/1

1. **Client** envoie: `GET http://localhost:8081/api/location/1`

2. **Gateway reçoit** la requête
   - Extrait le chemin: `/api/location/1`
   - Identifie la méthode: `GET`

3. **Gateway route** la requête
   - Cherche dans `routes.yml`
   - Trouve: path `/api/location` → microservice `http://localhost:8083`
   - Valide que GET est supporté ✓

4. **Gateway envoie** au microservice
   - Appel à: `http://localhost:8083/api/location/1`

5. **Microservice répond**
   - Retourne les données

6. **Gateway renvoie** au client
   ```json
   {
     "success": true,
     "message": "Request processed successfully",
     "data": { /* données du microservice */ },
     "statusCode": 200
   }
   ```

## Format de Réponse

### Succès (200, 201, etc.)
```json
{
  "success": true,
  "message": "Request processed successfully",
  "data": { /* données du microservice */ },
  "statusCode": 200
}
```

### Erreur - Route non trouvée (404)
```json
{
  "success": false,
  "message": "Route not found for path: /api/unknown",
  "data": null,
  "statusCode": 404
}
```

### Erreur - Méthode non supportée (405)
```json
{
  "success": false,
  "message": "Method PATCH not supported for this endpoint",
  "data": null,
  "statusCode": 405
}
```

### Erreur - Microservice non disponible (503)
```json
{
  "success": false,
  "message": "Error communicating with microservice: Connection refused",
  "data": null,
  "statusCode": 503
}
```

## Logs du Gateway

Le gateway affiche des logs détaillés pour chaque requête :

```
🔷 GATEWAY REQUEST
   Method: GET
   Path: /api/location/1
────────────────────────────────────────
→ Routing GET request from /api/location/1 to http://localhost:8083/api/location/1
✓ Response received from microservice: 200
────────────────────────────────────────
   Status: ✓ SUCCESS
   Message: Request processed successfully
```

## Démarrage

```bash
# Build
mvn clean package

# Run
mvn spring-boot:run

# Ou avec Java
java -jar target/Gateway-0.0.1-SNAPSHOT.jar
```

Le gateway est disponible à: `http://localhost:8081`

## Ajout de nouvelles routes

Pour ajouter une nouvelle route :

1. Ouvrir `src/main/resources/routes.yml`
2. Ajouter une nouvelle route :

```yaml
  - path: /api/newservice
    microservice: http://localhost:8087
    methods: [ GET, POST, PUT, DELETE ]
```

3. Redémarrer le gateway
4. Les logs afficheront: `✓ Loaded 5 routes from configuration`

## Limitations et Améliorations Futures

- Pagination des requêtes
- Cache des réponses
- Rate limiting
- Authentification/Autorisation
- Timeout management
- Retry logic
- Load balancing entre plusieurs instances d'un microservice
