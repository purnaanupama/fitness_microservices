package com.fitness.AI_service.service;

import com.fitness.AI_service.model.Activity;
import com.fitness.AI_service.model.Recommendation;
import com.fitness.AI_service.repository.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class ActivityMessageListener {

    private final ActivityAIService aiService;
    private final RecommendationRepository recommendationRepository;

    @RabbitListener(queues = "activity.queue")
    public void processActivity(Activity activity){
        log.info("Received activity for processing: {}", activity.getId());
        Recommendation recommendation = aiService.generateRecommendation(activity);
        recommendationRepository.save(recommendation);
    }
}
