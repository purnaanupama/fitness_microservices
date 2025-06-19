package com.fitness.activity_service.service;


import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
public class UserValidationService {
    private final WebClient authServiceWebClient;

    public UserValidationService(@Qualifier("userServiceWebClient") WebClient authServiceWebClient) {
        this.authServiceWebClient = authServiceWebClient;
    }

    public boolean validateUser(String userId) {
        try {
            return Boolean.TRUE.equals(authServiceWebClient.get()
                    .uri("api/users/validate-user/{userId}", userId)
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block());
        } catch (WebClientResponseException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                throw new RuntimeException("User Not Found: " + userId);
            } else if (e.getStatusCode() == HttpStatus.BAD_REQUEST) {
                throw new RuntimeException("Bad request when validating user: " + userId);
            } else {
                throw new RuntimeException("Unexpected error: " + e.getStatusCode(), e);
            }
        }
    }

}
