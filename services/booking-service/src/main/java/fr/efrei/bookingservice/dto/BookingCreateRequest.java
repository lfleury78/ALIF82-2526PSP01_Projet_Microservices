package fr.efrei.bookingservice.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record BookingCreateRequest(
        @NotNull
        UUID listingId,

        @NotNull
        UUID ownerId,

        @NotNull @FutureOrPresent
        LocalDate checkInDate,

        @NotNull @FutureOrPresent
        LocalDate checkOutDate,

        @Min(1)
        Integer guestsCount,

        @NotNull
        BigDecimal totalPrice,

        String message
) {}
