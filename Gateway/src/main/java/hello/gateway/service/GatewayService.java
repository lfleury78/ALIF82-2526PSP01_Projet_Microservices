package hello.gateway.service;

import hello.gateway.config.RoutesConfiguration;
import hello.gateway.response.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Service to handle request routing to microservices
 */
@Service
public class GatewayService {

    @Autowired
    private RoutesConfiguration routesConfiguration;

    @Autowired
    private RestTemplate restTemplate;

    /**
     * Route the request to the appropriate microservice
     * @param path The endpoint path (e.g., /api/location/1)
     * @param method The HTTP method (GET, POST, PUT, DELETE)
     * @param body The request body (for POST/PUT requests)
     * @param headers The request headers
     * @return ApiResponse with the result
     */
    public ApiResponse routeRequest(String path, String method, Object body, HttpHeaders headers) {
        // Find the microservice URL for this path
        String microserviceUrl = routesConfiguration.findMicroserviceUrl(path);

        // Check if the route exists
        if (microserviceUrl == null) {
            System.err.println("❌ No microservice found for path: " + path);
            return new ApiResponse(false, "Route not found for path: " + path, 404);
        }

        // Check if the HTTP method is supported
        if (!routesConfiguration.isMethodSupported(path, method)) {
            System.err.println("❌ Method " + method + " not supported for path: " + path);
            return new ApiResponse(false, "Method " + method + " not supported for this endpoint", 405);
        }

        // Construct the full URL
        String fullUrl = microserviceUrl + path;
        System.out.println("→ Routing " + method + " request from " + path + " to " + fullUrl);

        try {
            // Make the request to the microservice
            HttpEntity<?> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<?> response = restTemplate.exchange(
                    fullUrl,
                    HttpMethod.valueOf(method.toUpperCase()),
                    requestEntity,
                    Object.class
            );

            // Log success
            System.out.println("✓ Response received from microservice: " + response.getStatusCode().value());

            // Return success response with data
            return new ApiResponse(
                    true,
                    "Request processed successfully",
                    response.getBody(),
                    response.getStatusCode().value()
            );

        } catch (RestClientException e) {
            // Log error
            System.err.println("❌ Error calling microservice: " + e.getMessage());
            e.printStackTrace();

            return new ApiResponse(
                    false,
                    "Error communicating with microservice: " + e.getMessage(),
                    503
            );
        } catch (Exception e) {
            // Handle any other exceptions
            System.err.println("❌ Unexpected error: " + e.getMessage());
            e.printStackTrace();

            return new ApiResponse(
                    false,
                    "An unexpected error occurred: " + e.getMessage(),
                    500
            );
        }
    }

    /**
     * Get information about all configured routes
     * @return ApiResponse containing list of routes
     */
    public ApiResponse getRoutes() {
        System.out.println("→ Fetching all configured routes");
        return new ApiResponse(
                true,
                "Routes retrieved successfully",
                routesConfiguration.getRoutes(),
                200
        );
    }
}
