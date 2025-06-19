package com.fitness.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequest {
    @NotBlank(message = "New Password Is Required")
    private String newPassword;
    @NotBlank(message = "Email Is Required")
    private String email;
}
