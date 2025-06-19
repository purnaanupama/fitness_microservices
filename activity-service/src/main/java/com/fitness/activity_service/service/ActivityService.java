package com.fitness.activity_service.service;

import com.fitness.activity_service.ActivityRepository;
import com.fitness.activity_service.dto.ActivityRequest;
import com.fitness.activity_service.dto.ActivityResponse;
import com.fitness.activity_service.model.Activity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final UserValidationService userValidationService;
    private final RabbitTemplate rabbitTemplate;
    private final DeleteRecommendationService deleteRecommendationService;

    @Value("${rabbitmq.exchange.name}")
    private String exchange;

    @Value("${rabbitmq.routing.key}")
    private String routingKey;

    @Value("${rabbitmq.report.exchange.name}")
    private String reportExchange;

    @Value("${rabbitmq.report.routing.key}")
    private String reportRoutingKey;

    public ActivityResponse trackActivity(ActivityRequest request) {
        boolean isValidUser = userValidationService.validateUser(request.getUserId());
        if (!isValidUser) {
            return ActivityResponse.builder()
                    .message("Invalid User: " + request.getUserId())
                    .success(false)
                    .build();
        }
        Activity activity =  Activity.builder()
                .userId(request.getUserId())
                .type(request.getType())
                .duration(request.getDuration())
                .caloriesBurned(request.getCaloriesBurned())
                .startTime(request.getStartTime())
                .additionalMetrics(request.getAdditionalMetrics())
                .build();

        Activity savedActivity = activityRepository.save(activity);

        //Publish to RabbitMQ for AI processing
        try {
           rabbitTemplate.convertAndSend(exchange, routingKey, savedActivity);
        } catch (Exception e){
           log.error("Failed to build connection to RMQ", e);
        }
        return mapToResponse(savedActivity);
    }

    public Void printReport(String activityId) {
        // Find the activity from id
        Activity existingActivity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found with id: " + activityId));
        try {
            // Send to report service using dedicated report exchange
            rabbitTemplate.convertAndSend(reportExchange, reportRoutingKey, existingActivity);
            log.info("Activity sent to report service: {}", activityId);
        } catch (Exception e) {
            log.error("Failed to send activity to report service", e);
        }
        return null;
    }

    private ActivityResponse mapToResponse(Activity activity){
        ActivityResponse activityResponse = new ActivityResponse();
        activityResponse.setId(activity.getId());
        activityResponse.setUserId(activity.getUserId());
        activityResponse.setType(activity.getType());
        activityResponse.setDuration(activity.getDuration());
        activityResponse.setCaloriesBurned(activity.getCaloriesBurned());
        activityResponse.setStartTime(activity.getStartTime());
        activityResponse.setAdditionalMetrics(activity.getAdditionalMetrics());
        activityResponse.setCreatedAt(activity.getCreatedAt());
        activityResponse.setUpdatedAt(activity.getUpdatedAt());
        return activityResponse;
    }

    public List<ActivityResponse> getUserActivities(String userId) {
        List<Activity> activities = activityRepository.findByUserId(userId);
        return activities.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ActivityResponse getActivity(String activityId) {
        return activityRepository.findById(activityId)
                .map(this::mapToResponse)
                .orElseThrow(()->new RuntimeException("Activity not found with id: " + activityId));
    }

    public boolean deleteById(String activityId) {
        if(activityRepository.existsById(activityId)){
            activityRepository.deleteById(activityId);
            //Delete recommendations associated with the activity
            deleteRecommendationService.deleteRecommendationByActivityId(activityId);
            return true;
        }
        return false;
    }


}
