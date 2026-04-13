package fr.efrei.rentalservice.repository;

import fr.efrei.rentalservice.entity.Rental;
import fr.efrei.rentalservice.entity.RentalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RentalRepository extends JpaRepository<Rental, UUID> {

    Optional<Rental> findByBookingId(UUID bookingId);

    List<Rental> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);

    List<Rental> findByOwnerIdOrderByCreatedAtDesc(UUID ownerId);

    List<Rental> findByListingId(UUID listingId);

    List<Rental> findByStatus(RentalStatus status);

    boolean existsByBookingId(UUID bookingId);
}
