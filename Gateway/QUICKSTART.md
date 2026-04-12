# API Gateway - Quick Start

## 🚀 Démarrage rapide

### 1. Configuration initiale

Le gateway est déjà configuré avec les routes par défaut. Vérifiez le fichier `src/main/resources/routes.yml`:

```yaml
routes:
  - path: /api/location
    microservice: http://localhost:8083
    methods: [ GET, POST, PUT, DELETE ]
  
  - path: /api/reservation
    microservice: http://localhost:8084
    methods: [ GET, POST, PUT, DELETE ]
```

### 2. Build du projet

```bash
cd Gateway
mvn clean package
```

### 3. Démarrage du gateway

#### Avec Maven
```bash
mvn spring-boot:run
```

#### Avec Java
```bash
java -jar target/Gateway-0.0.1-SNAPSHOT.jar
```

Le gateway démarre sur le port **8081**.

### 4. Vérifier que le gateway fonctionne

```bash
# Health Check
curl http://localhost:8081/api/gateway/health

# Vous devriez recevoir:
# {
#   "success": true,
#   "message": "Gateway is running",
#   "statusCode": 200
# }
```

## 📋 Endpoints disponibles

### Endpoints du Gateway

```bash
# Health Check
GET http://localhost:8081/api/gateway/health

# Voir toutes les routes
GET http://localhost:8081/api/gateway/routes
```

### Endpoints routés (exemple)

```bash
# Récupérer toutes les locations
GET http://localhost:8081/api/location

# Récupérer une location par ID
GET http://localhost:8081/api/location/1

# Créer une location
POST http://localhost:8081/api/location

# Mettre à jour une location
PUT http://localhost:8081/api/location/1

# Supprimer une location
DELETE http://localhost:8081/api/location/1
```

## 🧪 Tester le gateway

### Option 1: Scripts de test

**Linux/Mac:**
```bash
chmod +x test-gateway.sh
./test-gateway.sh
```

**Windows (PowerShell):**
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\test-gateway.ps1
```

### Option 2: Avec cURL

```bash
# Health check
curl http://localhost:8081/api/gateway/health

# Voir les routes
curl http://localhost:8081/api/gateway/routes

# Tester une requête GET
curl http://localhost:8081/api/location

# Tester une requête POST
curl -X POST http://localhost:8081/api/location \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Location",
    "city": "Paris",
    "country": "France"
  }'
```

### Option 3: Avec Postman

1. Importer dans Postman:
   - Base URL: `http://localhost:8081`
   - Créer une collection "Gateway"
   - Ajouter les requêtes GET, POST, PUT, DELETE

2. Tester les endpoints

## 📊 Comprendre les logs

Quand vous faites une requête, le gateway affiche:

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

## ⚙️ Modifier les routes

1. Ouvrir `src/main/resources/routes.yml`
2. Ajouter/modifier les routes
3. Redémarrer le gateway (Ctrl+C puis redémarrer)
4. Les logs afficheront: `✓ Loaded X routes from configuration`

Exemple - Ajouter une nouvelle route:

```yaml
  - path: /api/newservice
    microservice: http://localhost:8087
    methods: [ GET, POST ]
```

## 🔍 Dépannage

### Problem: Gateway n'affiche pas "Loaded X routes"

**Solution**: Vérifier que `routes.yml` existe dans `src/main/resources/`

### Problem: "Error communicating with microservice: Connection refused"

**Solution**: Vérifier que le microservice est démarré

```bash
# Tester la connexion directement
curl http://localhost:8083/api/location
```

### Problem: "Route not found for path: /api/..."

**Solution**: Ajouter la route dans `routes.yml`

### Problem: "Method X not supported"

**Solution**: Ajouter la méthode dans la liste des méthodes de la route

## 📚 Documentation complète

- [README_GATEWAY.md](README_GATEWAY.md) - Documentation complète
- [ARCHITECTURE.md](ARCHITECTURE.md) - Fonctionnement détaillé
- [CONFIGURATION.md](CONFIGURATION.md) - Guide de configuration avancée

## 🎯 Cas d'usage

### 1. Test simple - Health Check

```bash
curl http://localhost:8081/api/gateway/health
```

### 2. Test avec microservice Location

**Prérequis**: Microservice Location sur port 8083

```bash
# Voir les locations
curl http://localhost:8081/api/location

# Créer une location
curl -X POST http://localhost:8081/api/location \
  -H "Content-Type: application/json" \
  -d '{"name":"Studio","city":"Paris","country":"France","price":150,"capacity":2}'
```

### 3. Test complet

Voir le fichier `test-gateway.sh` ou `test-gateway.ps1`

## ✅ Checklist de démarrage

- [ ] Gateway compilé (`mvn clean package`)
- [ ] Port 8081 disponible
- [ ] `routes.yml` configuré
- [ ] Gateway démarré
- [ ] Health check OK (`curl http://localhost:8081/api/gateway/health`)
- [ ] Routes affichées (`curl http://localhost:8081/api/gateway/routes`)
- [ ] Microservices disponibles (optionnel)

## 🔗 Ports par défaut

- Gateway: 8081
- Location: 8083
- Reservation: 8084
- User: 8085
- Payment: 8086

## 💡 Tips et Tricks

```bash
# Pretty print JSON réponse
curl http://localhost:8081/api/gateway/routes | jq

# Inclure les headers de réponse
curl -i http://localhost:8081/api/gateway/health

# Afficher tous les détails (headers, timing, etc.)
curl -v http://localhost:8081/api/gateway/health

# Sauvegarder la réponse dans un fichier
curl http://localhost:8081/api/gateway/routes > response.json
```

## 📞 Support

Si vous rencontrez des problèmes:

1. Vérifiez les logs du gateway
2. Vérifiez la configuration dans `routes.yml`
3. Testez la connectivité vers les microservices
4. Vérifiez que les requêtes matchent les routes configurées
