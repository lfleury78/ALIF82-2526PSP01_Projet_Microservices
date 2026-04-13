package fr.efrei.reviewservice.controller;

import fr.efrei.reviewservice.dto.ReviewCreateRequest;
import fr.efrei.reviewservice.dto.ReviewResponse;
import fr.efrei.reviewservice.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse create(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ReviewCreateRequest request) {
        UUID reviewerId = UUID.fromString(jwt.getSubject());
        return reviewService.createReview(reviewerId, request);
    }

    @GetMapping("/listing/{listingId}")
    public List<ReviewResponse> getByListing(@PathVariable UUID listingId) {
        return reviewService.getByListingId(listingId);
    }

    @GetMapping("/booking/{bookingId}/exists")
    public boolean existsByBooking(@PathVariable UUID bookingId) {
        return reviewService.existsByBookingId(bookingId);
    }
}
