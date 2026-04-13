package fr.efrei.rentalservice.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record RentalCreateRequest(
        @NotNull UUID bookingId,
        @NotNull UUID listingId,
        @NotNull UUID tenantId,
        @NotNull UUID ownerId,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        BigDecimal monthlyRent,
        @NotNull BigDecimal totalAmount
) {}
