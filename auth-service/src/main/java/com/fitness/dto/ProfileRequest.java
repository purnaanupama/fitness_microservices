package com.fitness.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProfileRequest {
    @NotBlank(message = "Name Should Not Be Empty")
    private String name;
    @Email(message = "Enter Valid Email")
    @NotNull(message = "Email Is A Required Field")
    private String email;
    @Size(min = 6, message = "Password Must Be Minimum 6 Characters")
    private String password;
}
