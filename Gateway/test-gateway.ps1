# API Gateway - Test Script (Windows PowerShell)
# Utilisez ce script pour tester les endpoints du gateway

$GATEWAY_URL = "http://localhost:8081"

Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║   API Gateway - Test Script (Windows)   ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# Function pour afficher les titres
function Write-TestHeader {
    param([string]$Number, [string]$Title)
    Write-Host "$Number $Title" -ForegroundColor Yellow
}

# Function pour faire des appels HTTP
function Test-GatewayEndpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Description
    )
    
    $url = "$GATEWAY_URL$Endpoint"
    Write-Host "   $Method $url`n" -ForegroundColor Cyan
    
    try {
        $params = @{
            Uri = $url
            Method = $Method
            Headers = @{"Content-Type" = "application/json"}
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params['Body'] = $Body | ConvertTo-Json
        }
        
        $response = Invoke-WebRequest @params
        
        Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Green
        $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10 | Write-Host
        
    } catch {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        try {
            $errorResponse = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorResponse)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Response Body:`n$errorBody" -ForegroundColor Red
            $reader.Dispose()
        } catch {}
    }
    
    Write-Host "`n" + ("=" * 60) + "`n"
}

# Test 1: Health Check
Write-TestHeader "1️⃣" "Health Check"
Test-GatewayEndpoint -Method "GET" -Endpoint "/api/gateway/health"

# Test 2: Get All Routes
Write-TestHeader "2️⃣" "Get All Routes"
Test-GatewayEndpoint -Method "GET" -Endpoint "/api/gateway/routes"

# Test 3: GET Location List
Write-TestHeader "3️⃣" "GET /api/location"
Test-GatewayEndpoint -Method "GET" -Endpoint "/api/location"

# Test 4: GET Location by ID
Write-TestHeader "4️⃣" "GET /api/location/1"
Test-GatewayEndpoint -Method "GET" -Endpoint "/api/location/1"

# Test 5: POST New Location
Write-TestHeader "5️⃣" "POST /api/location (New Location)"
$newLocationBody = @{
    name = "Studio from Gateway"
    description = "Test location created via gateway"
    city = "Paris"
    country = "France"
    price = 150
    capacity = 4
}
Test-GatewayEndpoint -Method "POST" -Endpoint "/api/location" -Body $newLocationBody

# Test 6: PUT Update Location
Write-TestHeader "6️⃣" "PUT /api/location/1 (Update)"
$updateLocationBody = @{
    name = "Updated Studio"
    description = "Updated via gateway"
}
Test-GatewayEndpoint -Method "PUT" -Endpoint "/api/location/1" -Body $updateLocationBody

# Test 7: DELETE Location
Write-TestHeader "7️⃣" "DELETE /api/location/1"
Test-GatewayEndpoint -Method "DELETE" -Endpoint "/api/location/1"

# Test 8: Route Not Found (404)
Write-TestHeader "8️⃣" "Route Not Found (404 Error)"
Test-GatewayEndpoint -Method "GET" -Endpoint "/api/nonexistent"

# Test 9: Get Reservations
Write-TestHeader "9️⃣" "GET /api/reservation"
Test-GatewayEndpoint -Method "GET" -Endpoint "/api/reservation"

# Résumé
Write-Host "════════════════════════════════════════" -ForegroundColor Blue
Write-Host "✓ Tests terminés" -ForegroundColor Green
Write-Host ""
Write-Host "Notes:" -ForegroundColor Yellow
Write-Host "1. Les tests 3-7 et 9 nécessitent que les microservices soient en cours d'exécution"
Write-Host "2. Les tests 1-2 et 8 doivent fonctionner même sans microservices"
Write-Host "3. Codes de réponse attendus:"
Write-Host "   - 200/201: Succès"
Write-Host "   - 404: Route non trouvée"
Write-Host "   - 405: Méthode non supportée"
Write-Host "   - 500: Erreur serveur"
Write-Host "   - 503: Service indisponible"
