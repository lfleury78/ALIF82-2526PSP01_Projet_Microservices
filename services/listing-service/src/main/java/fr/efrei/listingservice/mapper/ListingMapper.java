package fr.efrei.listingservice.mapper;

import fr.efrei.listingservice.dto.ListingCreateRequest;
import fr.efrei.listingservice.dto.ListingResponse;
import fr.efrei.listingservice.entity.Listing;
import fr.efrei.listingservice.entity.ListingAmenity;
import fr.efrei.listingservice.entity.ListingImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Collections;
import java.util.List;

@Mapper(componentModel = "spring")
public interface ListingMapper {

    @Mapping(target = "propertyType", expression = "java(listing.getPropertyType().name())")
    @Mapping(target = "status", expression = "java(listing.getStatus().name())")
    @Mapping(target = "amenities", source = "amenities", qualifiedByName = "mapAmenities")
    @Mapping(target = "images", source = "images", qualifiedByName = "mapImages")
    ListingResponse toResponse(Listing listing);

    @Named("mapAmenities")
    default List<String> mapAmenities(List<ListingAmenity> amenities) {
        if (amenities == null) return Collections.emptyList();
        return amenities.stream().map(ListingAmenity::getAmenity).toList();
    }

    @Named("mapImages")
    default List<ListingResponse.ImageResponse> mapImages(List<ListingImage> images) {
        if (images == null) return Collections.emptyList();
        return images.stream()
                .map(img -> new ListingResponse.ImageResponse(
                        img.getId(), img.getImageUrl(), img.isPrimary(), img.getSortOrder()))
                .toList();
    }

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ownerId", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "amenities", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "propertyType", expression = "java(fr.efrei.listingservice.entity.PropertyType.valueOf(request.propertyType()))")
    Listing toEntity(ListingCreateRequest request);
}
