package com.fitness.service;

import com.fitness.dto.ProfileRequest;
import com.fitness.dto.ProfileResponse;
import com.fitness.dto.RegisterRequest;
import com.fitness.dto.UserResponse;
import com.fitness.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.fitness.repository.UserRepository;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public ProfileResponse createProfile(ProfileRequest request){
        User newProfile = convertToUserEntity(request);
        boolean existingEmail = repository.existsByEmail(request.getEmail());
        if(!existingEmail){
            newProfile = repository.save(newProfile);
            return convertToProfileResponse(newProfile);
        }
        throw new ResponseStatusException(HttpStatus.CONFLICT,"Email Already Exist");
    }

    private ProfileResponse convertToProfileResponse(User newProfile) {
        return ProfileResponse.builder()
                .name(newProfile.getName())
                .email(newProfile.getEmail())
                .userId(newProfile.getUserId())
                .isAccountVerified(newProfile.getIsAccountVerified())
                .build();
    }

    private User convertToUserEntity(ProfileRequest request) {
       return User.builder()
                .email(request.getEmail())
                .userId(UUID.randomUUID().toString())
                .name(request.getName())
                .password(passwordEncoder.encode(request.getPassword()))
                .isAccountVerified(false)
                .resetOtpExpiredAt(0L)
                .verifyOtp(null)
                .verifyOtpExpiredAt(0L)
                .resetOtp(null)
                .build();
    }

    public ProfileResponse getProfile(String email){
        User existingUser = repository.findByEmail(email)
                .orElseThrow(()-> new UsernameNotFoundException("User Not Found"));
        return convertToProfileResponse(existingUser);
    }

    public void sendResetOtp(String email){
        User existingUser = repository.findByEmail(email)
                .orElseThrow(()->new UsernameNotFoundException("User Not Found: "+email));
        //Generate 6 digit OTP
        String otp = String.valueOf(ThreadLocalRandom.current().nextInt(100000,1000000));
        //Calculate expiry time
        long expiryTime = System.currentTimeMillis() + (15 * 60 * 1000);
        //Update the profile/user
        existingUser.setResetOtp(otp);
        existingUser.setResetOtpExpiredAt(expiryTime);

        repository.save(existingUser);
        try{
           emailService.sendResetOtpEmail(existingUser.getEmail(), otp);
        } catch(Exception ex){
            throw new RuntimeException("Unable To Send Email");
        }
    }

    public void resetPassword(String email, String newPassword){
        User existingUser = repository.findByEmail(email)
                .orElseThrow(()->new UsernameNotFoundException("User Not Found: "+email));
        existingUser.setPassword(passwordEncoder.encode(newPassword));
        existingUser.setResetOtp(null);
        existingUser.setResetOtpExpiredAt(0L);

        repository.save(existingUser);
    }

    public void sendOtp(String email){
        User existingUser = repository.findByEmail(email)
                .orElseThrow(()->new UsernameNotFoundException("User Not Found: " + email));
        if(existingUser.getIsAccountVerified() != null && existingUser.getIsAccountVerified()){
            return;
        }
        //Generate 6 digit OTP
        String otp = String.valueOf(ThreadLocalRandom.current().nextInt(100000,1000000));
        //Calculate expiry time
        long expiryTime = System.currentTimeMillis() + (24 * 60 * 60 * 1000);

        existingUser.setVerifyOtp(otp);
        existingUser.setResetOtpExpiredAt(expiryTime);

        //Save to database
        repository.save(existingUser);

        try{
            emailService.sendOtpEmail(existingUser.getEmail(), otp);
        } catch (Exception ex){
            throw new RuntimeException("Unable To Send Email");
        }
    }

    public void verifyOtp(String email, String otp){
       User existingUser =  repository.findByEmail(email)
                .orElseThrow(()->new UsernameNotFoundException("User Not Found: "+email));
       if(existingUser.getVerifyOtp() == null || !existingUser.getVerifyOtp().equals(otp)){
           throw new RuntimeException("Invalid OTP");
       }
       if(existingUser.getVerifyOtpExpiredAt() < System.currentTimeMillis()){
           throw new RuntimeException("OTP Expired");
       }
       existingUser.setIsAccountVerified(true);
       existingUser.setVerifyOtp(null);
       existingUser.setVerifyOtpExpiredAt(0L);

       repository.save(existingUser);
    }

    public void verifyResetOtp(String email, String otp) {
        User existingUser =  repository.findByEmail(email)
                .orElseThrow(()->new UsernameNotFoundException("User Not Found: "+email));
        if(existingUser.getResetOtp() == null || !existingUser.getResetOtp().equals(otp)){
            throw new RuntimeException("Invalid OTP");
        }
        if(existingUser.getResetOtpExpiredAt() < System.currentTimeMillis()){
            throw new RuntimeException("Reset OTP Expired");
        }
        existingUser.setResetOtp(null);
        existingUser.setResetOtpExpiredAt(0L);

        repository.save(existingUser);
    }

    public boolean validateUser(String userId) {
        if (repository.findByUserId(userId).isPresent()) {
            return true;
        }
        throw new UsernameNotFoundException("User Not Found");
    }



}
