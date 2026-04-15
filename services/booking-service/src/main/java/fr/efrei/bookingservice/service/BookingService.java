package fr.efrei.bookingservice.service;

import fr.efrei.bookingservice.dto.BookingCreateRequest;
import fr.efrei.bookingservice.dto.BookingResponse;
import fr.efrei.bookingservice.entity.Booking;
import fr.efrei.bookingservice.entity.BookingStatus;
import fr.efrei.bookingservice.exception.BookingNotFoundException;
import fr.efrei.bookingservice.mapper.BookingMapper;
import fr.efrei.bookingservice.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import fr.efrei.bookingservice.config.RabbitMQConfig;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;
    private final RabbitTemplate rabbitTemplate;

    public BookingResponse getById(UUID id) {
        return bookingRepository.findById(id)
                .map(bookingMapper::toResponse)
                .orElseThrow(() -> new BookingNotFoundException(id));
    }

    public List<BookingResponse> getByTenantId(UUID tenantId) {
        return bookingRepository.findByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    public List<BookingResponse> getByOwnerId(UUID ownerId) {
        return bookingRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId).stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    public List<BookingResponse> getByListingId(UUID listingId) {
        return bookingRepository.findByListingId(listingId).stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    @Transactional
    public BookingResponse create(UUID tenantId, BookingCreateRequest request) {
        if (request.checkOutDate().isBefore(request.checkInDate()) ||
                request.checkOutDate().isEqual(request.checkInDate())) {
            throw new IllegalArgumentException("Check-out date must be after check-in date");
        }

        if (tenantId.equals(request.ownerId())) {
            throw new IllegalArgumentException("You cannot book your own listing");
        }

        if (bookingRepository.existsOverlapping(request.listingId(), request.checkInDate(), request.checkOutDate())) {
            throw new IllegalStateException("This listing is already booked for the selected dates");
        }

        Booking booking = bookingMapper.toEntity(request);
        booking.setTenantId(tenantId);
        Booking saved = bookingRepository.save(booking);

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.BOOKING_CREATED_KEY,
                bookingMapper.toResponse(saved)
        );

        return bookingMapper.toResponse(saved);
    }

    @Transactional
    public BookingResponse confirm(UUID id, UUID ownerId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException(id));

        if (!booking.getOwnerId().equals(ownerId)) {
            throw new IllegalArgumentException("Only the listing owner can confirm bookings");
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only pending bookings can be confirmed");
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        Booking saved = bookingRepository.save(booking);

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.BOOKING_CONFIRMED_KEY,
                bookingMapper.toResponse(saved)
        );

        return bookingMapper.toResponse(saved);
    }

    @Transactional
    public void cancelAllByListing(UUID listingId) {
        List<Booking> active = bookingRepository.findByListingIdAndStatusIn(
                listingId, List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED));
        for (Booking booking : active) {
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
        }
    }

    @Transactional
    public BookingResponse cancel(UUID id, UUID userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException(id));

        if (!booking.getTenantId().equals(userId) && !booking.getOwnerId().equals(userId)) {
            throw new IllegalArgumentException("Only the tenant or owner can cancel a booking");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.COMPLETED) {
            throw new IllegalStateException("This booking cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);

        boolean cancelledByOwner = booking.getOwnerId().equals(userId);
        Map<String, Object> event = new HashMap<>(toEventMap(bookingMapper.toResponse(saved)));
        event.put("cancelledBy", cancelledByOwner ? "OWNER" : "TENANT");

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.BOOKING_CANCELLED_KEY,
                event
        );

        return bookingMapper.toResponse(saved);
    }

    private Map<String, Object> toEventMap(BookingResponse response) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", response.id().toString());
        map.put("listingId", response.listingId().toString());
        map.put("tenantId", response.tenantId().toString());
        map.put("ownerId", response.ownerId().toString());
        map.put("checkInDate", response.checkInDate().toString());
        map.put("checkOutDate", response.checkOutDate().toString());
        map.put("guestsCount", response.guestsCount());
        map.put("totalPrice", response.totalPrice().toString());
        map.put("status", response.status());
        return map;
    }
}
