package fr.efrei.listingservice.repository;

import fr.efrei.listingservice.entity.Listing;
import fr.efrei.listingservice.entity.ListingStatus;
import fr.efrei.listingservice.entity.PropertyType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface ListingRepository extends JpaRepository<Listing, UUID> {

    List<Listing> findByOwnerId(UUID ownerId);

    List<Listing> findByOwnerIdAndStatusNot(UUID ownerId, ListingStatus status);

    List<Listing> findByStatus(ListingStatus status);

    @Query("""
            SELECT l FROM Listing l
            WHERE l.status = 'ACTIVE'
            AND (CAST(:city AS string) IS NULL OR LOWER(l.city) = LOWER(CAST(:city AS string)))
            AND (:propertyType IS NULL OR l.propertyType = :propertyType)
            AND (CAST(:minPrice AS big_decimal) IS NULL OR l.pricePerNight >= :minPrice)
            AND (CAST(:maxPrice AS big_decimal) IS NULL OR l.pricePerNight <= :maxPrice)
            AND (CAST(:maxGuests AS integer) IS NULL OR l.maxGuests <= :maxGuests)
            ORDER BY l.createdAt DESC
            """)
    List<Listing> search(
            @Param("city") String city,
            @Param("propertyType") PropertyType propertyType,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("maxGuests") Integer maxGuests
    );
}
