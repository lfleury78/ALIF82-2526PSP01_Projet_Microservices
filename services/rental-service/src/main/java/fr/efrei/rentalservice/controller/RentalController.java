package fr.efrei.rentalservice.controller;

import fr.efrei.rentalservice.dto.RentalResponse;
import fr.efrei.rentalservice.service.RentalService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rentals")
@RequiredArgsConstructor
public class RentalController {

    private final RentalService rentalService;

    @GetMapping("/{id}")
    public RentalResponse getById(@PathVariable UUID id) {
        return rentalService.getById(id);
    }

    @GetMapping("/booking/{bookingId}")
    public RentalResponse getByBookingId(@PathVariable UUID bookingId) {
        return rentalService.getByBookingId(bookingId);
    }

    @GetMapping("/my")
    public List<RentalResponse> getMyRentals(@AuthenticationPrincipal Jwt jwt) {
        UUID tenantId = UUID.fromString(jwt.getSubject());
        return rentalService.getByTenantId(tenantId);
    }

    @GetMapping("/owned")
    public List<RentalResponse> getOwnedRentals(@AuthenticationPrincipal Jwt jwt) {
        UUID ownerId = UUID.fromString(jwt.getSubject());
        return rentalService.getByOwnerId(ownerId);
    }

    @PatchMapping("/{id}/complete")
    public RentalResponse complete(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID ownerId = UUID.fromString(jwt.getSubject());
        return rentalService.complete(id, ownerId);
    }

    @PatchMapping("/{id}/terminate")
    public RentalResponse terminate(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return rentalService.terminate(id, userId);
    }
}
