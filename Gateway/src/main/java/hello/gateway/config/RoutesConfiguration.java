package hello.gateway.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Component to load and provide route configurations from routes.yml
 */
@Component
public class RoutesConfiguration {
    private List<RouteConfig> routes = new ArrayList<>();

    @PostConstruct
    public void loadRoutes() {
        try (InputStream inputStream = getClass().getClassLoader().getResourceAsStream("routes.yml")) {
            if (inputStream == null) {
                System.err.println("routes.yml file not found!");
                return;
            }

            ObjectMapper mapper = new ObjectMapper(new YAMLFactory());
            Map<String, Object> config = mapper.readValue(inputStream, Map.class);
            
            if (config.containsKey("routes")) {
                List<Map<String, Object>> routesList = (List<Map<String, Object>>) config.get("routes");
                for (Map<String, Object> routeMap : routesList) {
                    RouteConfig route = new RouteConfig();
                    route.setPath((String) routeMap.get("path"));
                    route.setMicroservice((String) routeMap.get("microservice"));
                    route.setMethods((List<String>) routeMap.get("methods"));
                    routes.add(route);
                }
                System.out.println("✓ Loaded " + routes.size() + " routes from configuration");
                routes.forEach(r -> System.out.println("  → " + r));
            }

        } catch (IOException e) {
            System.err.println("Error loading routes.yml: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Find the microservice URL for a given endpoint path
     * @param endpointPath The endpoint path (e.g., /api/location/1)
     * @return The microservice URL if found, null otherwise
     */
    public String findMicroserviceUrl(String endpointPath) {
        for (RouteConfig route : routes) {
            if (endpointPath.startsWith(route.getPath())) {
                return route.getMicroservice();
            }
        }
        return null;
    }

    /**
     * Check if a route supports a specific HTTP method
     * @param endpointPath The endpoint path
     * @param method The HTTP method (GET, POST, PUT, DELETE)
     * @return true if the method is supported, false otherwise
     */
    public boolean isMethodSupported(String endpointPath, String method) {
        for (RouteConfig route : routes) {
            if (endpointPath.startsWith(route.getPath())) {
                return route.getMethods().contains(method.toUpperCase());
            }
        }
        return false;
    }

    /**
     * Get all configured routes
     * @return List of RouteConfig objects
     */
    public List<RouteConfig> getRoutes() {
        return routes;
    }
}
