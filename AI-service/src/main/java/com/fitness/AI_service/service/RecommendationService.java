package com.fitness.AI_service.service;

import com.fitness.AI_service.model.Recommendation;
import com.fitness.AI_service.repository.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationService {
    private final RecommendationRepository recommendationRepository;

    public List<Recommendation> getUserRecommendation(String userId) {
      return  recommendationRepository.findByUserId(userId);
    }

    public Recommendation getActivityRecommendation(String activityId) {
       return recommendationRepository.findByActivityId(activityId)
               .orElseThrow(()-> new RuntimeException("No recommendation Found for this activity: "+ activityId));
    }

    public boolean deleteRecommendationByActivityId(String activityId) {
        if (recommendationRepository.existsByActivityId(activityId)) {
            recommendationRepository.deleteByActivityId(activityId);
            return true;
        }
        return false;
    }

}
