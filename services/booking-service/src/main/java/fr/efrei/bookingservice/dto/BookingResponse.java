package fr.efrei.bookingservice.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record BookingResponse(
        UUID id,
        UUID listingId,
        UUID tenantId,
        UUID ownerId,
        LocalDate checkInDate,
        LocalDate checkOutDate,
        Integer guestsCount,
        BigDecimal totalPrice,
        String status,
        String message,
        LocalDateTime createdAt
) {}
