package com.fitness.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Data
@NoArgsConstructor
@Builder
public class ProfileResponse {
    private String userId;
    private String name;
    private String email;
    private Boolean isAccountVerified;
}
