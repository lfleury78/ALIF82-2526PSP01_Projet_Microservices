package fr.efrei.listingservice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ListingResponse(
        UUID id,
        UUID ownerId,
        String title,
        String description,
        String propertyType,
        String address,
        String city,
        String country,
        String zipCode,
        Double latitude,
        Double longitude,
        BigDecimal pricePerNight,
        Integer maxGuests,
        Integer bedrooms,
        Integer bathrooms,
        BigDecimal surfaceArea,
        String status,
        List<String> amenities,
        List<ImageResponse> images,
        LocalDateTime createdAt
) {
    public record ImageResponse(UUID id, String imageUrl, boolean primary, int sortOrder) {}
}
