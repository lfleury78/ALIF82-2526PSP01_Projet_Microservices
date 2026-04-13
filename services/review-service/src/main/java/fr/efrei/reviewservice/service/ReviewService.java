package fr.efrei.reviewservice.service;

import fr.efrei.reviewservice.dto.ReviewCreateRequest;
import fr.efrei.reviewservice.dto.ReviewResponse;
import fr.efrei.reviewservice.entity.Review;
import fr.efrei.reviewservice.mapper.ReviewMapper;
import fr.efrei.reviewservice.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;

    @Transactional
    public ReviewResponse createReview(UUID reviewerId, ReviewCreateRequest request) {
        if (reviewRepository.existsByBookingId(request.bookingId())) {
            throw new IllegalStateException("A review already exists for this booking");
        }

        Review review = reviewMapper.toEntity(request);
        review.setReviewerId(reviewerId);
        Review saved = reviewRepository.save(review);
        return reviewMapper.toResponse(saved);
    }

    public List<ReviewResponse> getByListingId(UUID listingId) {
        return reviewRepository.findByListingIdOrderByCreatedAtDesc(listingId).stream()
                .map(reviewMapper::toResponse)
                .toList();
    }

    public boolean existsByBookingId(UUID bookingId) {
        return reviewRepository.existsByBookingId(bookingId);
    }
}
