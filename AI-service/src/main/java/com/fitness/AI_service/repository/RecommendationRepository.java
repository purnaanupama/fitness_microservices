package com.fitness.AI_service.repository;

import com.fitness.AI_service.model.Recommendation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecommendationRepository extends MongoRepository<Recommendation, String> {

    List<Recommendation> findByUserId(String userId);
    Optional<Recommendation> findByActivityId(String activityId);
    void deleteByActivityId(String activityId);
    boolean existsByActivityId(String activityId);
}
