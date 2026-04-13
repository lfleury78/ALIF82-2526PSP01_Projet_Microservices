package fr.efrei.listingservice.exception;

import java.util.UUID;

public class ListingNotFoundException extends RuntimeException {
    public ListingNotFoundException(UUID id) {
        super("Listing not found with id: " + id);
    }
}
