package fr.efrei.listingservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "listings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "property_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private PropertyType propertyType;

    @Column(nullable = false, length = 500)
    private String address;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 100)
    private String country;

    @Column(name = "zip_code", length = 20)
    private String zipCode;

    private Double latitude;

    private Double longitude;

    @Column(name = "price_per_night", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerNight;

    @Column(name = "max_guests", nullable = false)
    @Builder.Default
    private Integer maxGuests = 1;

    @Column(nullable = false)
    @Builder.Default
    private Integer bedrooms = 1;

    @Column(nullable = false)
    @Builder.Default
    private Integer bathrooms = 1;

    @Column(name = "surface_area", precision = 8, scale = 2)
    private BigDecimal surfaceArea;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ListingStatus status = ListingStatus.ACTIVE;

    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ListingAmenity> amenities = new ArrayList<>();

    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    @Builder.Default
    private List<ListingImage> images = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public void addAmenity(String amenity) {
        ListingAmenity a = new ListingAmenity();
        a.setListing(this);
        a.setAmenity(amenity);
        amenities.add(a);
    }

    public void addImage(String imageUrl, boolean isPrimary, int sortOrder) {
        ListingImage img = new ListingImage();
        img.setListing(this);
        img.setImageUrl(imageUrl);
        img.setPrimary(isPrimary);
        img.setSortOrder(sortOrder);
        images.add(img);
    }
}
