# Guide de lancement - Reservation Service + Gateway

## 📋 Prérequis

- Java 17+ (pour Gateway)
- Node.js 18+ (pour Reservation Service)
- MySQL 8+ (avec base de données `hessbnb`)
- Port 8081 libre (Gateway)
- Port 8084 libre (Reservation Service)

---

## 🚀 Lancement étape par étape

### 1. Vérifier que MySQL est accessible

```powershell
# Tester la connexion MySQL
mysql -u root -p -h localhost

# La base de données hessbnb doit exister
# Si elle n'existe pas, créez-la avec:
# CREATE DATABASE hessbnb;
```

### 2. Lancer le Service Reservation

```powershell
# Accédez au dossier du service
cd .\services\reservation-service\

# Option A: Lancement en mode développement (recommandé)
npm run dev

# Option B: Build + Lancement en production
npm run build
npm start
```

**Vérification**: Vous devriez voir:
```
reservation-service listening on :8084
```

### 3. Lancer le Gateway

**Dans un NOUVEAU terminal PowerShell**:

```powershell
# Accédez au dossier Gateway
cd .\Gateway\

# Lancement du Gateway
mvn spring-boot:run
```

**Vérification**: Vous devriez voir dans les logs:
```
✓ Loaded 4 routes from configuration
  → RouteConfig{path='/api/location', microservice='http://localhost:8083', ...}
  → RouteConfig{path='/api/reservation', microservice='http://localhost:8084', ...}
  → RouteConfig{path='/api/user', microservice='http://localhost:8085', ...}
  → RouteConfig{path='/api/payment', microservice='http://localhost:8086', ...}
```

---

## 🧪 Tester l'intégration Gateway + Reservation Service

### 1️⃣ Health Check - Vérifier que le service est accessible

```powershell
# Test direct du service
curl http://localhost:8084/health

# Réponse attendue:
# {"ok": true, "db": true}
```

### 2️⃣ Test via le Gateway

```powershell
# Health Check via Gateway
curl http://localhost:8081/api/gateway/health

# Réponse attendue:
# {
#   "success": true,
#   "message": "Gateway is running",
#   "statusCode": 200
# }
```

### 3️⃣ Lister les réservations via Gateway

```powershell
# GET /api/reservation
curl http://localhost:8081/api/reservation

# Réponse attendue (liste vide ou avec données):
# {
#   "success": true,
#   "message": "Request processed successfully",
#   "data": [],
#   "statusCode": 200
# }
```

### 4️⃣ Créer une réservation via Gateway

```powershell
# POST /api/reservation
curl -X POST http://localhost:8081/api/reservation `
  -H "Content-Type: application/json" `
  -d '{
    "id_annonce": 1,
    "id_locataire": 1,
    "date_debut": "2026-04-20",
    "date_fin": "2026-04-25",
    "nb_voyageurs": 2
  }'

# Réponse attendue:
# {
#   "success": true,
#   "message": "Request processed successfully",
#   "data": {
#     "id_reservation": 1,
#     "prix_total": 750,
#     "nights": 5
#   },
#   "statusCode": 201
# }
```

### 5️⃣ Récupérer une réservation spécifique

```powershell
# GET /api/reservation/1
curl http://localhost:8081/api/reservation/1

# Réponse attendue:
# {
#   "success": true,
#   "message": "Request processed successfully",
#   "data": {
#     "id_reservation": 1,
#     "id_annonce": 1,
#     "id_locataire": 1,
#     "date_debut": "2026-04-20",
#     "date_fin": "2026-04-25",
#     "nb_voyageurs": 2,
#     "prix_total": 750,
#     "statut": "EN_ATTENTE",
#     "date_creation": "2026-04-12T10:30:00.000Z"
#   },
#   "statusCode": 200
# }
```

### 6️⃣ Mettre à jour le statut d'une réservation

```powershell
# PATCH /api/reservation/1/status
curl -X PATCH http://localhost:8081/api/reservation/1/status `
  -H "Content-Type: application/json" `
  -d '{
    "statut": "CONFIRMEE"
  }'

# Réponse attendue:
# {
#   "success": true,
#   "message": "Request processed successfully",
#   "data": {"ok": true},
#   "statusCode": 200
# }
```

### 7️⃣ Valider une réservation

```powershell
# POST /api/reservation/1/validate
curl -X POST http://localhost:8081/api/reservation/1/validate

# Réponse attendue:
# {
#   "success": true,
#   "message": "Request processed successfully",
#   "data": {"ok": true, "statut": "CONFIRMEE"},
#   "statusCode": 200
# }
```

### 8️⃣ Supprimer une réservation

```powershell
# DELETE /api/reservation/1
curl -X DELETE http://localhost:8081/api/reservation/1

# Réponse attendue:
# {
#   "success": true,
#   "message": "Request processed successfully",
#   "data": {"ok": true},
#   "statusCode": 200
# }
```

---

## 📍 Tableau des URLs

### Service Reservation (Direct)
| Méthode | Endpoint | URL |
|---------|----------|-----|
| GET | Health Check | `http://localhost:8084/health` |
| GET | Lister réservations | `http://localhost:8084/reservations` |
| GET | Détail réservation | `http://localhost:8084/reservations/1` |
| POST | Créer réservation | `http://localhost:8084/reservations` |
| PATCH | Changer statut | `http://localhost:8084/reservations/1/status` |
| POST | Valider | `http://localhost:8084/reservations/1/validate` |
| DELETE | Supprimer | `http://localhost:8084/reservations/1` |

### Via Gateway
| Méthode | Endpoint | URL |
|---------|----------|-----|
| GET | Lister réservations | `http://localhost:8081/api/reservation` |
| GET | Détail réservation | `http://localhost:8081/api/reservation/1` |
| POST | Créer réservation | `http://localhost:8081/api/reservation` |
| PATCH | Changer statut | `http://localhost:8081/api/reservation/1/status` |
| POST | Valider | `http://localhost:8081/api/reservation/1/validate` |
| DELETE | Supprimer | `http://localhost:8081/api/reservation/1` |

### Gateway Management
| Méthode | Endpoint | URL |
|---------|----------|-----|
| GET | Health | `http://localhost:8081/api/gateway/health` |
| GET | Voir routes | `http://localhost:8081/api/gateway/routes` |

---

## 🐛 Dépannage

### Erreur: "Connection refused" sur le port 8084

**Cause**: Le service Reservation n'est pas lancé
**Solution**: 
```powershell
cd .\services\reservation-service\
npm run dev
```

### Erreur: "Error communicating with microservice"

**Cause**: Le Gateway n'arrive pas à joindre le service
**Solution**: 
1. Vérifiez que le service Reservation écoute bien sur le port 8084
2. Vérifiez que `routes.yml` pointe vers `http://localhost:8084`
3. Redémarrez les deux services

### Erreur: "internal_error" lors de la création de réservation

**Cause**: Problème de connexion à la base de données
**Solution**:
1. Vérifiez que MySQL est lancé
2. Vérifiez les credentials dans `.env`
3. Vérifiez que la base de données `hessbnb` existe

### Erreur: "db: false" lors du health check

**Cause**: Impossible de se connecter à MySQL
**Solution**:
```powershell
# Vérifier la connexion MySQL
mysql -u root -p -h localhost

# Dans MySQL, vérifier que la base existe
SHOW DATABASES;

# Et que les tables existent
USE hessbnb;
SHOW TABLES;
```

---

## 📝 Structure des réservations

### Champs de création d'une réservation

```json
{
  "id_annonce": 1,
  "id_locataire": 1,
  "date_debut": "2026-04-20",
  "date_fin": "2026-04-25",
  "nb_voyageurs": 2
}
```

### Statuts possibles

- `EN_ATTENTE` - Nouvelle réservation
- `CONFIRMEE` - Réservation confirmée
- `ANNULEE` - Réservation annulée
- `TERMINEE` - Réservation complétée

### Filtres pour lister les réservations

```powershell
# Par locataire
curl "http://localhost:8081/api/reservation?id_locataire=1"

# Par annonce
curl "http://localhost:8081/api/reservation?id_annonce=1"

# Par statut
curl "http://localhost:8081/api/reservation?statut=CONFIRMEE"

# Combiner les filtres
curl "http://localhost:8081/api/reservation?id_locataire=1&statut=CONFIRMEE"
```

---

## ✅ Checklist de vérification

- [ ] MySQL est lancé et accessible
- [ ] Base de données `hessbnb` existe
- [ ] Service Reservation est lancé sur le port 8084
- [ ] Gateway est lancé sur le port 8081
- [ ] `npm run dev` ou `npm start` fonctionne (Reservation)
- [ ] `mvn spring-boot:run` fonctionne (Gateway)
- [ ] Les 4 routes sont chargées dans le Gateway
- [ ] Health check du service répond (8084)
- [ ] Health check du gateway répond (8081)
- [ ] Créer une réservation via le gateway fonctionne
- [ ] Les réservations s'affichent dans la liste

---

## 💡 Tips

### Voir les logs du Gateway

Les logs affichent toutes les requêtes:
```
🔷 GATEWAY REQUEST
   Method: POST
   Path: /api/reservation
────────────────────────────────────────
→ Routing POST request from /api/reservation to http://localhost:8084/api/reservation
✓ Response received from microservice: 201
────────────────────────────────────────
   Status: ✓ SUCCESS
   Message: Request processed successfully
```

### Utiliser PowerShell pour les tests

Tous les exemples utilisent `curl` qui fonctionne dans PowerShell 6+.

Si vous avez une erreur, utilisez `Invoke-WebRequest` à la place:
```powershell
# Au lieu de curl, utilisez:
Invoke-RestMethod -Uri "http://localhost:8081/api/reservation" -Method GET
```

### Ajouter d'autres routes au Gateway

Pour ajouter le service User, Location ou Payment:
1. Modifier `Gateway/src/main/resources/routes.yml`
2. Ajouter la route
3. Redémarrer le Gateway

```yaml
  - path: /api/user
    microservice: http://localhost:8085
    methods: [ GET, POST, PUT, DELETE ]
```
