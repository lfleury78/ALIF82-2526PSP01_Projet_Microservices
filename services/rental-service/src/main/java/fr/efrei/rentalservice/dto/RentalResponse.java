package fr.efrei.rentalservice.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record RentalResponse(
        UUID id,
        UUID bookingId,
        UUID listingId,
        UUID tenantId,
        UUID ownerId,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal monthlyRent,
        BigDecimal totalAmount,
        String status,
        LocalDateTime createdAt
) {}
