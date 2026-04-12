#!/bin/bash

# API Gateway - Test Script
# Utilisez ce script pour tester les endpoints du gateway

GATEWAY_URL="http://localhost:8081"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   API Gateway - Test Script             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}1️⃣  Test Health Check${NC}"
echo -e "   GET $GATEWAY_URL/api/gateway/health\n"
curl -X GET "$GATEWAY_URL/api/gateway/health" \
  -H "Content-Type: application/json" \
  -w "\n\nStatus Code: %{http_code}\n\n"

# Test 2: Get All Routes
echo -e "${YELLOW}2️⃣  Test Get All Routes${NC}"
echo -e "   GET $GATEWAY_URL/api/gateway/routes\n"
curl -X GET "$GATEWAY_URL/api/gateway/routes" \
  -H "Content-Type: application/json" \
  -w "\n\nStatus Code: %{http_code}\n\n"

# Test 3: GET Location List (si le microservice est disponible)
echo -e "${YELLOW}3️⃣  Test GET /api/location${NC}"
echo -e "   GET $GATEWAY_URL/api/location\n"
curl -X GET "$GATEWAY_URL/api/location" \
  -H "Content-Type: application/json" \
  -w "\n\nStatus Code: %{http_code}\n\n"

# Test 4: GET Location by ID
echo -e "${YELLOW}4️⃣  Test GET /api/location/1${NC}"
echo -e "   GET $GATEWAY_URL/api/location/1\n"
curl -X GET "$GATEWAY_URL/api/location/1" \
  -H "Content-Type: application/json" \
  -w "\n\nStatus Code: %{http_code}\n\n"

# Test 5: POST New Location (si le microservice supporte la création)
echo -e "${YELLOW}5️⃣  Test POST /api/location${NC}"
echo -e "   POST $GATEWAY_URL/api/location\n"
curl -X POST "$GATEWAY_URL/api/location" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Studio from Gateway",
    "description": "Test location created via gateway",
    "city": "Paris",
    "country": "France",
    "price": 150,
    "capacity": 4
  }' \
  -w "\n\nStatus Code: %{http_code}\n\n"

# Test 6: PUT Update Location
echo -e "${YELLOW}6️⃣  Test PUT /api/location/1${NC}"
echo -e "   PUT $GATEWAY_URL/api/location/1\n"
curl -X PUT "$GATEWAY_URL/api/location/1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Studio",
    "description": "Updated via gateway"
  }' \
  -w "\n\nStatus Code: %{http_code}\n\n"

# Test 7: DELETE Location
echo -e "${YELLOW}7️⃣  Test DELETE /api/location/1${NC}"
echo -e "   DELETE $GATEWAY_URL/api/location/1\n"
curl -X DELETE "$GATEWAY_URL/api/location/1" \
  -H "Content-Type: application/json" \
  -w "\n\nStatus Code: %{http_code}\n\n"

# Test 8: Test Route Not Found (404)
echo -e "${YELLOW}8️⃣  Test Route Not Found (404)${NC}"
echo -e "   GET $GATEWAY_URL/api/nonexistent\n"
curl -X GET "$GATEWAY_URL/api/nonexistent" \
  -H "Content-Type: application/json" \
  -w "\n\nStatus Code: %{http_code}\n\n"

# Test 9: Test Method Not Allowed (405) - si applicable
echo -e "${YELLOW}9️⃣  Test Method Not Allowed${NC}"
echo -e "   (Si le microservice ne supporte pas PATCH)\n"
echo "   PATCH $GATEWAY_URL/api/location/1\n"
curl -X PATCH "$GATEWAY_URL/api/location/1" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated"}' \
  -w "\n\nStatus Code: %{http_code}\n\n"

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Tests terminés${NC}\n"

# Notes additionnelles
echo -e "${YELLOW}Notes:${NC}"
echo "1. Les tests 3-7 nécessitent que les microservices soient en cours d'exécution"
echo "2. Les tests 1-2 et 8 doivent fonctionner même sans microservices"
echo "3. Vérifiez que les routes sont configurées dans routes.yml"
echo "4. Les codes de réponse attendus:"
echo "   - 200/201: Succès"
echo "   - 404: Route non trouvée"
echo "   - 405: Méthode non supportée"
echo "   - 500: Erreur serveur"
echo "   - 503: Service indisponible"
