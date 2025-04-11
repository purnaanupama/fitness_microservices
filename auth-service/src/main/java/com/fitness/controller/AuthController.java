package com.fitness.controller;

import com.fitness.dto.RegisterRequest;
import com.fitness.dto.UserResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fitness.service.AuthService;

@RestController
@RequestMapping("/api/users")
@AllArgsConstructor
public class AuthController {

    private AuthService authService;
   @GetMapping("/{userId}")
   public ResponseEntity<UserResponse> getUserProfile(@PathVariable String userId){
       return ResponseEntity.ok(authService.getUserProfile(userId));
   }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request){
        return ResponseEntity.ok(authService.register(request));
    }
}
