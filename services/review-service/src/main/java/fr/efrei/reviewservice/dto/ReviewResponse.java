package fr.efrei.reviewservice.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ReviewResponse(
        UUID id,
        UUID listingId,
        UUID bookingId,
        UUID reviewerId,
        int rating,
        String comment,
        LocalDateTime createdAt
) {
}
