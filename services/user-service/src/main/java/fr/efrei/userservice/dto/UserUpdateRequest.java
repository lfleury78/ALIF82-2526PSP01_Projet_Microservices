package fr.efrei.userservice.dto;

import jakarta.validation.constraints.Size;

public record UserUpdateRequest(
        @Size(max = 100)
        String firstName,

        @Size(max = 100)
        String lastName,

        @Size(max = 20)
        String phone,

        @Size(max = 500)
        String avatarUrl
) {}
