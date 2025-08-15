@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*") // allow all origins
                .allowedMethods("*")        // allow all HTTP methods
                .allowedHeaders("*")        // allow all headers
                .exposedHeaders(
                        "Authorization",
                        "Access-Control-Allow-Origin",
                        "Access-Control-Allow-Credentials"
                )
                .allowCredentials(false)    // must be false if using *
                .maxAge(3600);
    }
}
