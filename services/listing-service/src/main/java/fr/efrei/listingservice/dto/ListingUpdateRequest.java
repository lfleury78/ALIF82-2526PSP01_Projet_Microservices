package fr.efrei.listingservice.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;

import java.math.BigDecimal;
import java.util.List;

public record ListingUpdateRequest(
        String title,
        String description,
        String propertyType,
        String address,
        String city,
        String country,
        String zipCode,
        Double latitude,
        Double longitude,

        @DecimalMin("0.01")
        BigDecimal pricePerNight,

        @Min(1)
        Integer maxGuests,

        @Min(0)
        Integer bedrooms,

        @Min(0)
        Integer bathrooms,

        BigDecimal surfaceArea,

        List<String> amenities,

        List<ListingCreateRequest.ImageRequest> images
) {}
