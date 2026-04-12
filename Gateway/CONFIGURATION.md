# Configuration Guide - API Gateway

## Configuration basique

Le gateway utilise un fichier de configuration YAML `routes.yml` pour définir les routes vers les microservices.

## Structure du fichier routes.yml

```yaml
routes:
  # Definité une route vers le microservice Location
  - path: /api/location
    microservice: http://localhost:8083
    methods: [ GET, POST, PUT, DELETE ]
  
  # Définit une route vers le microservice Reservation
  - path: /api/reservation
    microservice: http://localhost:8084
    methods: [ GET, POST, PUT, DELETE ]
  
  # Définit une route vers le microservice User
  - path: /api/user
    microservice: http://localhost:8085
    methods: [ GET, POST, PUT, DELETE ]
  
  # Définit une route vers le microservice Payment
  - path: /api/payment
    microservice: http://localhost:8086
    methods: [ GET, POST, PUT, DELETE ]
```

## Champ de configuration

### path
- **Description**: Le chemin de base de l'endpoint
- **Format**: Doit commencer par `/api/`
- **Exemples**: `/api/location`, `/api/reservation`, `/api/user/profile`
- **Matching**: La route match les endpoints qui <b>commencent par</b> ce path
  - `/api/location` match `/api/location`
  - `/api/location` match `/api/location/1`
  - `/api/location` match `/api/location/1/details`

### microservice
- **Description**: L'URL du microservice qui traite cette route
- **Format**: URL complète avec protocole et port
- **Exemples**: 
  - `http://localhost:8083`
  - `http://192.168.1.10:8083`
  - `http://microservice-name:8083`

### methods
- **Description**: Les méthodes HTTP autorisées
- **Valeurs possibles**: GET, POST, PUT, DELETE, PATCH
- **Format**: Liste YAML
- **Exemples**:
  - `[ GET ]` - Seulement GET
  - `[ GET, POST ]` - GET et POST
  - `[ GET, POST, PUT, DELETE ]` - Toutes les méthodes

## Exemples de configuration

### Configuration pour une architecture microservices classique

```yaml
routes:
  # Services métier
  - path: /api/location
    microservice: http://localhost:8083
    methods: [ GET, POST, PUT, DELETE ]
  
  - path: /api/reservation
    microservice: http://localhost:8084
    methods: [ GET, POST, PUT, DELETE ]
  
  - path: /api/user
    microservice: http://localhost:8085
    methods: [ GET, POST, PUT, DELETE ]
  
  - path: /api/payment
    microservice: http://localhost:8086
    methods: [ GET, POST, PUT ]
  
  # Services supports
  - path: /api/notification
    microservice: http://localhost:8087
    methods: [ POST ]
  
  - path: /api/search
    microservice: http://localhost:8088
    methods: [ GET ]
```

### Configuration pour un seul endpoint simple

```yaml
routes:
  - path: /api/hello
    microservice: http://localhost:3000
    methods: [ GET ]
```

### Configuration avec routes multiples vers le même service

```yaml
routes:
  # Routes vers le même microservice avec des path différents
  - path: /api/location
    microservice: http://localhost:8083
    methods: [ GET, POST, PUT, DELETE ]
  
  - path: /api/location/search
    microservice: http://localhost:8083
    methods: [ GET ]
  
  - path: /api/location/favorites
    microservice: http://localhost:8083
    methods: [ GET, POST, DELETE ]
```

## Matching des routes - Ordre d'importance

Les routes sont matchées dans l'ordre où elles apparaissent. La première route qui correspond est utilisée.

### Exemple problématique:

```yaml
routes:
  - path: /api/location
    microservice: http://localhost:8083
    methods: [ GET, POST, PUT, DELETE ]
  
  - path: /api/location/special
    microservice: http://localhost:8089
    methods: [ GET ]
```

Dans ce cas:
- `/api/location/1` → http://localhost:8083/api/location/1 ✓
- `/api/location/special/events` → http://localhost:8083/api/location/special/events (pas 8089!)
  
**Raison**: `/api/location` match déjà `/api/location/special/events`

### Solution - Ordre correct:

```yaml
routes:
  # Routes plus spécifiques d'abord
  - path: /api/location/special
    microservice: http://localhost:8089
    methods: [ GET ]
  
  # Routes plus générales après
  - path: /api/location
    microservice: http://localhost:8083
    methods: [ GET, POST, PUT, DELETE ]
```

## Configuration avancée

### Variables d'environnement (à implémenter)

Vous pouvez utiliser des variables d'environnement :

```yaml
routes:
  - path: /api/location
    microservice: ${LOCATION_SERVICE_URL:http://localhost:8083}
    methods: [ GET, POST, PUT, DELETE ]
```

Puis définir les variables dans `application.properties` ou comme variables système :

```bash
export LOCATION_SERVICE_URL=http://192.168.1.10:8083
java -jar Gateway-0.0.1-SNAPSHOT.jar
```

### Configuration par profils Spring (à implémenter)

Créer plusieurs fichiers de configuration selon l'environnement :

- `routes-dev.yml` pour développement
- `routes-prod.yml` pour production
- `routes-test.yml` pour tests

Activer un profil :

```bash
java -jar Gateway-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## Format YAML pour les débutants

### Validité du YAML

```yaml
# ✓ Valide - liste sans espace
methods: [GET, POST, PUT, DELETE]

# ✓ Valide - liste avec espaces
methods: [ GET, POST, PUT, DELETE ]

# ✓ Valide - liste multi-ligne
methods:
  - GET
  - POST
  - PUT
  - DELETE

# ✗ Invalide - pas de guillemets
path: /api location

# ✓ Valide - avec guillemets
path: "/api location"

# ✗ Invalide - mauvais indentation
routes:
- path: /api/location
  microservice: http://localhost:8083
  methods: [ GET, POST ]
 - path: /api/user
   microservice: http://localhost:8085
   methods: [ GET ]

# ✓ Valide - indentation correcte
routes:
  - path: /api/location
    microservice: http://localhost:8083
    methods: [ GET, POST ]
  
  - path: /api/user
    microservice: http://localhost:8085
    methods: [ GET ]
```

## Validation de la configuration

### Vérifier les logs au démarrage

Quand vous lancez le gateway, les logs doivent afficher:

```
✓ Loaded 4 routes from configuration
  → RouteConfig{path='/api/location', microservice='http://localhost:8083', methods=[GET, POST, PUT, DELETE]}
  → RouteConfig{path='/api/reservation', microservice='http://localhost:8084', methods=[GET, POST, PUT, DELETE]}
  → RouteConfig{path='/api/user', microservice='http://localhost:8085', methods=[GET, POST, PUT, DELETE]}
  → RouteConfig{path='/api/payment', microservice='http://localhost:8086', methods=[GET, POST, PUT]}
```

Si vous voyez une erreur comme:

```
routes.yml file not found!
```

Vérifiez que le fichier existe dans: `src/main/resources/routes.yml`

### Tester une route

```bash
# Voir toutes les routes
curl http://localhost:8081/api/gateway/routes

# Teste une route
curl http://localhost:8081/api/location/1
```

## Erreurs courantes

### Erreur : "Route not found"

```
{
  "success": false,
  "message": "Route not found for path: /api/unknown",
  "statusCode": 404
}
```

**Solution**: Ajouter la route dans `routes.yml` et redémarrer.

### Erreur : "Method not supported"

```
{
  "success": false,
  "message": "Method PATCH not supported for this endpoint",
  "statusCode": 405  
}
```

**Solution**: Ajouter la méthode dans la liste des méthodes de la route.

```yaml
# Avant
- path: /api/location
  methods: [ GET, POST, PUT, DELETE ]

# Après
- path: /api/location
  methods: [ GET, POST, PUT, DELETE, PATCH ]
```

### Erreur : "Error communicating with microservice: Connection refused"

```
{
  "success": false,
  "message": "Error communicating with microservice: Connection refused",
  "statusCode": 503
}
```

**Solution**: Vérifier que le microservice est démarré et accessible:

```bash
# Tester la connexion
curl http://localhost:8083/api/location

# Ou utiliser netstat
netstat -an | grep 8083
```

## Modifications de la configuration

Après modifier `routes.yml`:

1. Toutes les routes doivent être valides en YAML
2. Redémarrer l'application
3. Vérifier dans les logs que les routes sont chargées

```bash
# Redémarrer
Ctrl+C  (ou tuer le processus)
mvn spring-boot:run
```

Le gateway relira le fichier `routes.yml` au prochain démarrage.
