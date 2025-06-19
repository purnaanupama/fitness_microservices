package com.fitness.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${spring.mail.properties.mail.smtp.from}")
    private String fromEmail;

    public void sendWelcomeEmail(String toEmail, String name){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Welcome to Power Nation fitness service !");
        message.setText("Hi "+name+",\n\nThank you for registering to our service\n\nRegards,\nPower Nation Team");
        mailSender.send(message);
    }

    public void sendResetOtpEmail(String toEmail, String otp){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Password Reset OTP");
        message.setText("Your OTP for resetting the account password is "+otp+".");
        mailSender.send(message);
    }

    public void sendOtpEmail(String toEmail, String otp){
         SimpleMailMessage message = new SimpleMailMessage();
         message.setFrom(fromEmail);
         message.setTo(toEmail);
         message.setSubject("Account Verification OTP");
         message.setText("Your OTP is "+otp+". Verify your account using this OTP.");
         mailSender.send(message);
    }
}
