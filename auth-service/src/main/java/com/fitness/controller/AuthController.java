package com.fitness.controller;

import com.fitness.dto.*;
import com.fitness.service.AppUserDetailService;
import com.fitness.service.EmailService;
import com.fitness.utils.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import com.fitness.service.AuthService;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;


@RestController
@AllArgsConstructor
public class AuthController {

    private AuthService authService;
    private AuthenticationManager authenticationManager;
    private AppUserDetailService appUserDetailService;
    private JwtUtil jwtUtil;
    private EmailService emailService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ProfileResponse register(@Valid @RequestBody ProfileRequest request){
        ProfileResponse response = authService.createProfile(request);
        emailService.sendWelcomeEmail(response.getEmail(), response.getName());
        return response;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request){
       try{
          authenticate(request.getEmail(), request.getPassword());
          final UserDetails userDetails = appUserDetailService.loadUserByUsername(request.getEmail());
           final String jwtToken = jwtUtil.generateToken(userDetails);
           ResponseCookie cookie = ResponseCookie.from("jwt", jwtToken)
                   .httpOnly(true)
                   .path("/")
                   .maxAge(Duration.ofDays(1))
                   .sameSite("Strict")
                   .build();
          return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString())
                  .body(new AuthResponse(request.getEmail(), jwtToken));
       }catch(BadCredentialsException ex){
          Map<String, Object> error = new HashMap<>();
          error.put("error",true);
          error.put("message","Email Or Password Is Incorrect");
           return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
       }catch(DisabledException ex){
           Map<String, Object> error = new HashMap<>();
           error.put("error",true);
           error.put("message", "Account Is Disabled");
           return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
       }catch(Exception ex){
           Map<String, Object> error = new HashMap<>();
           error.put("error",true);
           error.put("message", "Authentication Failed");
           return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
       }
    }

    private void authenticate(String email, String password){
       authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
    }

    @GetMapping("/profile")
     public ProfileResponse getProfile(@CurrentSecurityContext(expression = "authentication?.name") String email){
       return authService.getProfile(email);
    }

    @GetMapping("/is-authenticated")
    public ResponseEntity<Boolean> isAuthenticated(@CurrentSecurityContext(expression = "authentication?.name") String email){
       return ResponseEntity.ok(email != null);
    }

    @PostMapping("/send-reset-otp")
    public void sendResetOtp(@RequestParam String email){
       try{
         authService.sendResetOtp(email);
       }catch(Exception ex){
          throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
       }
    }

    @PostMapping("/reset-password")
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request){
        try{
            authService.resetPassword(request.getEmail(), request.getNewPassword());
        } catch (Exception ex){
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
        }
    }

    @PostMapping("/send-otp")
    public void sendVerifyOtp(@CurrentSecurityContext(expression = "authentication?.name") String email){
        try {
            authService.sendOtp(email);
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @PostMapping("/verify-otp")
    public void verifyEmail(@RequestBody Map<String, Object> request, @CurrentSecurityContext(expression = "authentication?.name") String email){
       if(request.get("otp").toString() == null){
          throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing Details");
       }
        try{
           authService.verifyOtp(email, request.get("otp").toString());
       } catch (Exception e){
           throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
       }
    }

    @PostMapping("/verify-reset-otp")
    public void verifyEmail(@RequestBody Map<String, Object> request){
        if(request.get("otp").toString() == null){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing Details");
        }
        try{
            authService.verifyResetOtp(request.get("email").toString(), request.get("otp").toString());
        } catch (Exception e){
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @GetMapping("/validate-user/{userId}")
    public ResponseEntity<Boolean> validateUser(@PathVariable String userId) {
        try {
            boolean isValid = authService.validateUser(userId);
            return ResponseEntity.ok(isValid); // returns true
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.ok(false); // returns false
        }
    }

    @GetMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response){
        ResponseCookie cookie = ResponseCookie.from("jwt","")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("Logged Out Successfully !");
    }

}
