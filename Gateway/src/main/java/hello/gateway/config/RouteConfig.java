package hello.gateway.config;

import java.util.List;

/**
 * Route configuration class
 */
public class RouteConfig {
    private String path;
    private String microservice;
    private List<String> methods;

    // Default constructor
    public RouteConfig() {}

    // Constructor
    public RouteConfig(String path, String microservice, List<String> methods) {
        this.path = path;
        this.microservice = microservice;
        this.methods = methods;
    }

    // Getters and Setters
    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getMicroservice() {
        return microservice;
    }

    public void setMicroservice(String microservice) {
        this.microservice = microservice;
    }

    public List<String> getMethods() {
        return methods;
    }

    public void setMethods(List<String> methods) {
        this.methods = methods;
    }

    @Override
    public String toString() {
        return "RouteConfig{" +
                "path='" + path + '\'' +
                ", microservice='" + microservice + '\'' +
                ", methods=" + methods +
                '}';
    }
}
