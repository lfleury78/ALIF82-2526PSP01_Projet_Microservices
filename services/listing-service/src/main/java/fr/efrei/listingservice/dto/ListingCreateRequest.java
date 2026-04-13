package fr.efrei.listingservice.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public record ListingCreateRequest(
        @NotBlank
        String title,

        String description,

        @NotBlank
        String propertyType,

        @NotBlank
        String address,

        @NotBlank
        String city,

        @NotBlank
        String country,

        String zipCode,

        Double latitude,
        Double longitude,

        @NotNull @DecimalMin("0.01")
        BigDecimal pricePerNight,

        @Min(1)
        Integer maxGuests,

        @Min(0)
        Integer bedrooms,

        @Min(0)
        Integer bathrooms,

        BigDecimal surfaceArea,

        List<String> amenities,

        List<ImageRequest> images
) {
    public record ImageRequest(
            @NotBlank String imageUrl,
            boolean primary,
            int sortOrder
    ) {}
}
