package com.fitness.activity_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
public class DeleteRecommendationService {

    private final WebClient aiServiceWebClient;

    public DeleteRecommendationService (@Qualifier("aiServiceWebClient") WebClient aiServiceWebClient) {
        this.aiServiceWebClient = aiServiceWebClient;
    }
    public void deleteRecommendationByActivityId(String activityId) {
        try {
            aiServiceWebClient
                    .delete()
                    .uri("/api/recommendations/activity/{activityId}", activityId)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (WebClientResponseException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                throw new RuntimeException("No recommendation found for activity ID: " + activityId);
            } else if (e.getStatusCode().is4xxClientError()) {
                throw new RuntimeException("Client error while deleting recommendation: " + e.getMessage(), e);
            } else if (e.getStatusCode().is5xxServerError()) {
                throw new RuntimeException("AI service error: " + e.getStatusCode(), e);
            } else {
                throw new RuntimeException("Unexpected error: " + e.getStatusCode(), e);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to call AI service: " + e.getMessage(), e);
        }
    }
}

