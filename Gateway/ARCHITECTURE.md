# API Gateway - Architecture et Fonctionnement

## Vue d'ensemble de l'Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP Request
       │ GET /api/location/1
       ▼
┌──────────────────────────────────────────────────┐
│          API GATEWAY (Port 8081)                 │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  GatewayController                         │ │
│  │  - Capture toutes les requêtes /api/**    │ │
│  │  - Supporte GET, POST, PUT, DELETE        │ │
│  └────┬─────────────────────────────────────┘ │
│       │                                        │
│       ▼                                        │
│  ┌────────────────────────────────────────────┐ │
│  │  GatewayService                            │ │
│  │  - Route la requête vers le bon service   │ │
│  │  - Applique les transformations           │ │
│  │  - Gère les erreurs                       │ │
│  └────┬─────────────────────────────────────┘ │
│       │                                        │
│       ▼                                        │
│  ┌────────────────────────────────────────────┐ │
│  │  RoutesConfiguration                       │ │
│  │  - Charge routes.yml au démarrage         │ │
│  │  - Trouve le microservice via le path     │ │
│  │  - Valide les méthodes HTTP               │ │
│  └────┬─────────────────────────────────────┘ │
│       │                                        │
│       ▼                                        │
│  ┌────────────────────────────────────────────┐ │
│  │  routes.yml (Configuration)                │ │
│  │  ┌──────────────────────────────────────┐ │ │
│  │  │ /api/location ->                     │ │ │
│  │  │   http://localhost:8083              │ │ │
│  │  │   Méthodes: GET, POST, PUT, DELETE   │ │ │
│  │  ├──────────────────────────────────────┤ │ │
│  │  │ /api/reservation ->                  │ │ │
│  │  │   http://localhost:8084              │ │ │
│  │  │   Méthodes: GET, POST, PUT, DELETE   │ │ │
│  │  └──────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
       │
       │ Forward to appropriate microservice
       │
       ├──────────────────────┬──────────────────┬┬────────────────┐
       ▼                      ▼                  ▼▼                ▼
  ┌──────────────┐    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │  Location    │    │ Reservation  │  │    User      │  │  Payment     │
  │  Microservice│    │ Microservice │  │ Microservice │  │ Microservice │
  │ (Port 8083)  │    │ (Port 8084)  │  │ (Port 8085)  │  │ (Port 8086)  │
  └──────────────┘    └──────────────┘  └──────────────┘  └──────────────┘
       │                    │                   │                 │
       └────────────────────┴───────────────────┴─────────────────┘
              Chaque microservice traite la requête
              et retourne la réponse
                      │
                      │ Response
                      ▼
       ┌──────────────────────────┐
       │  API GATEWAY             │
       │  ┌──────────────────────┐│
       │  │  ApiResponse         ││
       │  │  {                   ││
       │  │    success: true,    ││
       │  │    message: "...",   ││
       │  │    data: {...},      ││
       │  │    statusCode: 200   ││
       │  │  }                   ││
       │  └──────────────────────┘│
       └──────────────────────────┘
              │
              │ Response
              ▼
       ┌─────────────┐
       │   Client    │
       └─────────────┘
```

## Flux détaillé pour GET /api/location/1

```
Étape 1: CLIENT ENVOIE LA REQUÊTE
  ┌─────────────────────────────────────┐
  │ GET http://localhost:8081/api/location/1
  │ Headers: {Content-Type: application/json}
  │ Body: null
  └─────────────────────────────────────┘

Étape 2: GATEWAY REÇOIT
  ║ GatewayController.handleGet() activé
  ║ ├─ Path: /api/location/1
  ║ ├─ Method: GET
  ║ └─ Body: null

Étape 3: EXTRACTION DU PATH
  ║ Enlève le préfixe /api
  ║ Path final: /api/location/1
  ║ QueryParams: null

Étape 4: RECHERCHE DANS LE ROUTING
  ║ GatewayService.routeRequest() appelé
  ║ ├─ Path: /api/location/1
  ║ ├─ Method: GET
  ║ ├─ RoutesConfiguration.findMicroserviceUrl()
  ║ │  └─ Cherche dans routes.yml
  ║ │  └─ "/" match "/api/location"
  ║ │  └─ Retourne: http://localhost:8083 ✓
  ║ └─ Valide GET est supporté ✓

Étape 5: APPEL AU MICROSERVICE
  ║ Construit l'URL: http://localhost:8083/api/location/1
  ║ RestTemplate.exchange(
  ║   URL: http://localhost:8083/api/location/1
  ║   Method: GET
  ║   Headers: {...}
  ║   Body: null
  ║ )

Étape 6: MICROSERVICE TRAITE
  ║ Location Microservice (8083)
  ║ ├─ Reçoit: GET /api/location/1
  ║ ├─ Traite la requête
  ║ ├─ Retourne: 200 OK with JSON

Étape 7: RESPONSE REÇUE
  ║ Status: 200
  ║ Body: {
  ║          "id": 1,
  ║          "name": "Location 1",
  ║          "city": "Paris"
  ║        }

Étape 8: CRÉATION DE LA RÉPONSE GATEWAY
  ║ ApiResponse {
  ║   success: true,
  ║   message: "Request processed successfully",
  ║   data: { /* from microservice */ },
  ║   statusCode: 200
  ║ }

Étape 9: RETOUR AU CLIENT
  └─────────────────────────────────────┐
    {
      "success": true,
      "message": "Request processed successfully",
      "data": {
        "id": 1,
        "name": "Location 1",
        "city": "Paris"
      },
      "statusCode": 200
    }
```

## Flux d'erreur: Route non trouvée

```
Client: GET /api/unknown

  ▼

Gateway Controller reçoit

  ▼

GatewayService.routeRequest()

  ▼

RoutesConfiguration.findMicroserviceUrl("/api/unknown")
  └─ Cherche dans routes.yml
  └─ Aucune route match
  └─ Retourne: null

  ▼

Détecte: microserviceUrl == null

  ▼

Retourne ApiResponse d'erreur:
  {
    "success": false,
    "message": "Route not found for path: /api/unknown",
    "data": null,
    "statusCode": 404
  }

  ▼

Client reçoit 404
```

## Flux d'erreur: Microservice indisponible

```
Client: GET /api/location/1

  ▼

Gateway envoie au microservice: http://localhost:8083/api/location/1

  ▼

RestTemplate lance RestClientException
  └─ Connection refused
  └─ Network timeout
  └─ Service indisponible

  ▼

Exception attrapée dans le try-catch

  ▼

Log: ❌ Error calling microservice: Connection refused

  ▼

Retourne ApiResponse d'erreur:
  {
    "success": false,
    "message": "Error communicating with microservice: Connection refused",
    "data": null,
    "statusCode": 503
  }

  ▼

Client reçoit 503 Service Unavailable
```

## Structure des Fichiers

```
Gateway/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── hello/gateway/
│   │   │       ├── config/
│   │   │       │   ├── RouteConfig.java
│   │   │       │   ├── RoutesConfiguration.java
│   │   │       │   └── GatewayConfiguration.java
│   │   │       ├── controller/
│   │   │       │   └── GatewayController.java
│   │   │       ├── service/
│   │   │       │   └── GatewayService.java
│   │   │       ├── response/
│   │   │       │   └── ApiResponse.java
│   │   │       └── GatewayApplication.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── routes.yml
│   └── test/
├── pom.xml
└── README_GATEWAY.md
```

## Exemple d'utilisation avec cURL

### 1. Health Check
```bash
curl http://localhost:8081/api/gateway/health
```

### 2. Voir toutes les routes
```bash
curl http://localhost:8081/api/gateway/routes
```

### 3. GET une location
```bash
curl http://localhost:8081/api/location/1
```

### 4. Créer une location
```bash
curl -X POST http://localhost:8081/api/location \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Studio Parisien",
    "city": "Paris",
    "country": "France"
  }'
```

### 5. Mettre à jour une location
```bash
curl -X PUT http://localhost:8081/api/location/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Studio Parisien Updated"
  }'
```

### 6. Supprimer une location
```bash
curl -X DELETE http://localhost:8081/api/location/1
```

## Trace de logs du Gateway

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
