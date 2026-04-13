package fr.efrei.reviewservice.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ReviewCreateRequest(
        @NotNull UUID listingId,
        @NotNull UUID bookingId,
        @Min(1) @Max(5) int rating,
        @NotBlank String comment
) {
}
