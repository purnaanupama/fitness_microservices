package com.fitness.activity_service.controller;

import com.fitness.activity_service.dto.ActivityRequest;
import com.fitness.activity_service.dto.ActivityResponse;
import com.fitness.activity_service.service.ActivityService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/activities")
@AllArgsConstructor
public class ActivityController {
    private ActivityService activityService;
    @PostMapping
    public ResponseEntity<ActivityResponse> trackActivity(@RequestBody ActivityRequest request){
        if(request.getUserId() != null){
            request.setUserId(request.getUserId());
        }
        return ResponseEntity.ok(activityService.trackActivity(request));
    }

    @GetMapping("/print-report/{activityId}")  // Add {activityId} here
    public ResponseEntity<Void> printReport(@PathVariable String activityId){
        return ResponseEntity.ok(activityService.printReport(activityId));
    }

    @GetMapping("/user-activities/{userId}")
    public ResponseEntity<List<ActivityResponse>> getUserActivities(@PathVariable String userId) {
        return ResponseEntity.ok(activityService.getUserActivities(userId));
    }

    @DeleteMapping("/{activityId}")
    public ResponseEntity<Void> deleteActivity(@PathVariable String activityId){
        boolean deleted = activityService.deleteById(activityId);
        if (deleted) {
            return ResponseEntity.noContent().build(); // 204 No Content
        } else {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
    }

    @GetMapping("/{activityId}")
    public ResponseEntity<ActivityResponse> getActivity(@PathVariable String activityId){
        return ResponseEntity.ok(activityService.getActivity(activityId));
    }
}
