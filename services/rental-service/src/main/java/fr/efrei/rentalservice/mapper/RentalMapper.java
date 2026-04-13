package fr.efrei.rentalservice.mapper;

import fr.efrei.rentalservice.dto.RentalCreateRequest;
import fr.efrei.rentalservice.dto.RentalResponse;
import fr.efrei.rentalservice.entity.Rental;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RentalMapper {

    @Mapping(target = "status", expression = "java(rental.getStatus().name())")
    RentalResponse toResponse(Rental rental);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Rental toEntity(RentalCreateRequest request);
}
