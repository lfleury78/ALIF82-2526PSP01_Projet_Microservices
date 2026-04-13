package fr.efrei.bookingservice.controller;

import fr.efrei.bookingservice.dto.BookingCreateRequest;
import fr.efrei.bookingservice.dto.BookingResponse;
import fr.efrei.bookingservice.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping("/{id}")
    public BookingResponse getById(@PathVariable UUID id) {
        return bookingService.getById(id);
    }

    @GetMapping("/my")
    public List<BookingResponse> getMyBookings(@AuthenticationPrincipal Jwt jwt) {
        UUID tenantId = UUID.fromString(jwt.getSubject());
        return bookingService.getByTenantId(tenantId);
    }

    @GetMapping("/received")
    public List<BookingResponse> getReceivedBookings(@AuthenticationPrincipal Jwt jwt) {
        UUID ownerId = UUID.fromString(jwt.getSubject());
        return bookingService.getByOwnerId(ownerId);
    }

    @GetMapping("/listing/{listingId}")
    public List<BookingResponse> getByListing(@PathVariable UUID listingId) {
        return bookingService.getByListingId(listingId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse create(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody BookingCreateRequest request) {
        UUID tenantId = UUID.fromString(jwt.getSubject());
        return bookingService.create(tenantId, request);
    }

    @PatchMapping("/{id}/confirm")
    public BookingResponse confirm(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID ownerId = UUID.fromString(jwt.getSubject());
        return bookingService.confirm(id, ownerId);
    }

    @PatchMapping("/listing/{listingId}/cancel-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelAllByListing(@PathVariable UUID listingId) {
        bookingService.cancelAllByListing(listingId);
    }

    @PatchMapping("/{id}/cancel")
    public BookingResponse cancel(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return bookingService.cancel(id, userId);
    }
}
