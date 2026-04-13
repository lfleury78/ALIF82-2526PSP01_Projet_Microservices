package fr.efrei.gateway.controller;

import fr.efrei.gateway.config.GatewayRoutesConfig;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.io.IOException;
import java.util.Enumeration;

@RestController
@RequiredArgsConstructor
public class ProxyController {

    private final GatewayRoutesConfig routesConfig;
    private final RestClient restClient = RestClient.create();

    @RequestMapping("/api/**")
    public ResponseEntity<byte[]> proxy(HttpServletRequest request) {
        String path = request.getRequestURI();
        String query = request.getQueryString();
        String targetUrl = resolveTargetUrl(path);

        if (targetUrl == null) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(("{\"error\":\"No route found for: " + path + "\"}").getBytes());
        }

        String fullUrl = targetUrl + path + (query != null ? "?" + query : "");

        byte[] body;
        try {
            body = request.getInputStream().readAllBytes();
        } catch (IOException e) {
            body = null;
        }

        HttpHeaders headers = new HttpHeaders();
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String name = headerNames.nextElement();
            if (!name.equalsIgnoreCase("host") && !name.equalsIgnoreCase("content-length")) {
                headers.addAll(name, java.util.Collections.list(request.getHeaders(name)));
            }
        }

        try {
            RestClient.RequestBodySpec spec = restClient.method(HttpMethod.valueOf(request.getMethod()))
                    .uri(fullUrl)
                    .headers(h -> h.addAll(headers));

            ResponseEntity<byte[]> response;
            if (body != null && body.length > 0) {
                response = spec.body(body).retrieve().toEntity(byte[].class);
            } else {
                response = spec.retrieve().toEntity(byte[].class);
            }

            return ResponseEntity.status(response.getStatusCode())
                    .headers(filterResponseHeaders(response.getHeaders()))
                    .body(response.getBody());
        } catch (RestClientResponseException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .headers(filterResponseHeaders(e.getResponseHeaders()))
                    .body(e.getResponseBodyAsByteArray());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(("{\"error\":\"Service unavailable: " + e.getMessage() + "\"}").getBytes());
        }
    }

    private String resolveTargetUrl(String path) {
        if (path.startsWith("/api/users")) return routesConfig.getRoutes().get("user-service");
        if (path.startsWith("/api/listings")) return routesConfig.getRoutes().get("listing-service");
        if (path.startsWith("/api/bookings")) return routesConfig.getRoutes().get("booking-service");
        if (path.startsWith("/api/rentals")) return routesConfig.getRoutes().get("rental-service");
        if (path.startsWith("/api/messages")) return routesConfig.getRoutes().get("message-service");
        if (path.startsWith("/api/reviews")) return routesConfig.getRoutes().get("review-service");
        return null;
    }

    private HttpHeaders filterResponseHeaders(HttpHeaders headers) {
        HttpHeaders filtered = new HttpHeaders();
        if (headers != null) {
            headers.forEach((name, values) -> {
                if (!name.equalsIgnoreCase("transfer-encoding")) {
                    filtered.addAll(name, values);
                }
            });
        }
        return filtered;
    }
}
