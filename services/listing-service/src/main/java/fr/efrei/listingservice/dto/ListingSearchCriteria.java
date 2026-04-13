package fr.efrei.listingservice.dto;

import java.math.BigDecimal;

public record ListingSearchCriteria(
        String city,
        String propertyType,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        Integer maxGuests
) {}
