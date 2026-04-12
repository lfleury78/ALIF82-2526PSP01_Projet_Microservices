package hello.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Spring configuration for Gateway application
 */
@Configuration
public class GatewayConfiguration {

    /**
     * Create RestTemplate bean for making HTTP requests to microservices
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
