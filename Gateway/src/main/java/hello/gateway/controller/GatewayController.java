package hello.gateway.controller;

import hello.gateway.response.ApiResponse;
import hello.gateway.service.GatewayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Gateway Controller to handle all incoming requests and route them to appropriate microservices
 */
@RestController
@RequestMapping("/api")
public class GatewayController {

    @Autowired
    private GatewayService gatewayService;

    /**
     * Fallback handler for GET requests
     */
    @GetMapping("/**")
    public ResponseEntity<ApiResponse> handleGet(HttpServletRequest request) {
        return routeRequest(request, "GET", null);
    }

    /**
     * Fallback handler for POST requests
     */
    @PostMapping("/**")
    public ResponseEntity<ApiResponse> handlePost(HttpServletRequest request, @RequestBody(required = false) Object body) {
        return routeRequest(request, "POST", body);
    }

    /**
     * Fallback handler for PUT requests
     */
    @PutMapping("/**")
    public ResponseEntity<ApiResponse> handlePut(HttpServletRequest request, @RequestBody(required = false) Object body) {
        return routeRequest(request, "PUT", body);
    }

    /**
     * Fallback handler for DELETE requests
     */
    @DeleteMapping("/**")
    public ResponseEntity<ApiResponse> handleDelete(HttpServletRequest request) {
        return routeRequest(request, "DELETE", null);
    }

    /**
     * Get information about configured routes
     */
    @GetMapping("/gateway/routes")
    public ResponseEntity<ApiResponse> getRoutes() {
        System.out.println("\n📋 Gateway - Getting all routes\n");
        ApiResponse response = gatewayService.getRoutes();
        return new ResponseEntity<>(response, HttpStatus.valueOf(response.getStatusCode()));
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/gateway/health")
    public ResponseEntity<ApiResponse> health() {
        System.out.println("\n💚 Gateway - Health check\n");
        ApiResponse response = new ApiResponse(true, "Gateway is running", 200);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Route the request to the appropriate microservice
     */
    private ResponseEntity<ApiResponse> routeRequest(HttpServletRequest request, String method, Object body) {
        String path = request.getRequestURI();
        // Remove the /api prefix since routes in config are /api/...
        if (path.startsWith("/api")) {
            path = path.substring(4); // Remove "/api"
        }

        // Append query parameters if any
        if (request.getQueryString() != null) {
            path = path + "?" + request.getQueryString();
        }

        System.out.println("\n🔷 GATEWAY REQUEST");
        System.out.println("   Method: " + method);
        System.out.println("   Path: " + path);
        System.out.println("─".repeat(40));

        // Get headers from the request
        HttpHeaders headers = new HttpHeaders();
        request.getHeaderNames().asIterator().forEachRemaining(headerName ->
                headers.add(headerName, request.getHeader(headerName))
        );

        // Route the request through the gateway service
        ApiResponse response = gatewayService.routeRequest(path, method, body, headers);

        System.out.println("─".repeat(40));
        System.out.println("   Status: " + (response.isSuccess() ? "✓ SUCCESS" : "✗ ERROR"));
        System.out.println("   Message: " + response.getMessage());
        System.out.println();

        return new ResponseEntity<>(response, HttpStatus.valueOf(response.getStatusCode()));
    }
}
