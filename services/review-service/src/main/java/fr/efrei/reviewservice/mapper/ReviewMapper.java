package fr.efrei.reviewservice.mapper;

import fr.efrei.reviewservice.dto.ReviewCreateRequest;
import fr.efrei.reviewservice.dto.ReviewResponse;
import fr.efrei.reviewservice.entity.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewResponse toResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getListingId(),
                review.getBookingId(),
                review.getReviewerId(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }

    public Review toEntity(ReviewCreateRequest request) {
        return Review.builder()
                .listingId(request.listingId())
                .bookingId(request.bookingId())
                .rating(request.rating())
                .comment(request.comment())
                .build();
    }
}
