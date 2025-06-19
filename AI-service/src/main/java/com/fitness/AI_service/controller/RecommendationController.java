package com.fitness.AI_service.controller;

import com.fitness.AI_service.model.Recommendation;
import com.fitness.AI_service.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/recommendations")
public class RecommendationController {
   private final RecommendationService recommendationService;

   @GetMapping("/user/{userId}")
    public ResponseEntity<List<Recommendation>> getUserRecommendation(@PathVariable String userId){
        return ResponseEntity.ok(recommendationService.getUserRecommendation(userId));
   }

    @GetMapping("/activity/{activityId}")
    public ResponseEntity<Recommendation> getActivityRecommendation(@PathVariable String activityId){
        return ResponseEntity.ok(recommendationService.getActivityRecommendation(activityId));
    }

    @DeleteMapping("/activity/{activityId}")
    public ResponseEntity<Void> deleteRecommendationByActivityId(@PathVariable String activityId) {
        boolean isDeleted = recommendationService.deleteRecommendationByActivityId(activityId);
        if (isDeleted) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

}
