package com.fitness.gateway_service.config;

import com.fitness.gateway_service.utils.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor  // Keep only this annotation for constructor injection
public class CustomGlobalFilter implements org.springframework.cloud.gateway.filter.GlobalFilter, Ordered {

    private final JwtUtils jwtUtils;  // Add 'final' to ensure it's injected

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        // Skip authentication check for public endpoints
        if (path.equals("/api/users/register") ||
                path.equals("/api/users/login") ||
                path.equals("/api/users/send-reset-otp") ||
                path.equals("/api/users/reset-password") ||
                path.equals("/api/users/verify-reset-otp") ||
                path.equals("/api/users/logout")) {
            return chain.filter(exchange);
        }

        // Extract JWT from Authorization header or cookie
        String jwtToken = null;
        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwtToken = authHeader.substring(7);
        } else {
            var cookie = exchange.getRequest().getCookies().getFirst("jwt");
            if (cookie != null) {
                jwtToken = cookie.getValue();
            }
        }

        // Validate JWT
        if (jwtToken != null && jwtUtils.isTokenValid(jwtToken)) {
            System.out.println("✅ Valid JWT: " + jwtUtils.extractEmail(jwtToken));
            return chain.filter(exchange);
        } else {
            System.out.println("⛔ Invalid or missing JWT");
            // Custom JSON error response
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

            String errorResponse = """
                {
                  "status": 401,
                  "error": "Unauthorized",
                  "message": "Invalid or missing JWT token",
                  "path": "%s"
                }
                """.formatted(path);

            byte[] bytes = errorResponse.getBytes(StandardCharsets.UTF_8);
            return exchange.getResponse().writeWith(Mono.just(exchange.getResponse()
                    .bufferFactory()
                    .wrap(bytes)));
        }
    }

    @Override
    public int getOrder() {
        return -1; // Run early
    }
}