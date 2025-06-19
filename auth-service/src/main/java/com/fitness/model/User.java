package com.fitness.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private String userId;
    @Column(unique = true, nullable = false)
    private String email;
    @Column(nullable = false)
    private String name;
    private String verifyOtp;
    private Boolean isAccountVerified;
    @Column(nullable = false)
    private String password;
    private Long verifyOtpExpiredAt;
    private String resetOtp;
    private Long resetOtpExpiredAt;
    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp createdAt;
    @UpdateTimestamp
    private Timestamp updatedAt;
}
