package fr.efrei.bookingservice.service;

import fr.efrei.bookingservice.dto.BookingCreateRequest;
import fr.efrei.bookingservice.dto.BookingResponse;
import fr.efrei.bookingservice.entity.Booking;
import fr.efrei.bookingservice.entity.BookingStatus;
import fr.efrei.bookingservice.exception.BookingNotFoundException;
import fr.efrei.bookingservice.mapper.BookingMapper;
import fr.efrei.bookingservice.repository.BookingRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import fr.efrei.bookingservice.config.RabbitMQConfig;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@Transactional(readOnly = true)
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;
    private final RabbitTemplate rabbitTemplate;
    private final RestClient messageClient;

    public BookingService(BookingRepository bookingRepository,
                          BookingMapper bookingMapper,
                          RabbitTemplate rabbitTemplate,
                          @Value("${services.message-url}") String messageUrl) {
        this.bookingRepository = bookingRepository;
        this.bookingMapper = bookingMapper;
        this.rabbitTemplate = rabbitTemplate;
        this.messageClient = RestClient.builder().baseUrl(messageUrl).build();
    }

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

        sendSystemNotification(saved.getListingId(), saved.getTenantId(), saved.getOwnerId(),
                "📋 Nouvelle demande de réservation du "
                        + saved.getCheckInDate().format(DATE_FMT) + " au "
                        + saved.getCheckOutDate().format(DATE_FMT)
                        + " (" + saved.getGuestsCount() + " voyageur"
                        + (saved.getGuestsCount() > 1 ? "s" : "") + "). "
                        + "Montant total : " + saved.getTotalPrice() + " €. "
                        + "En attente de confirmation du propriétaire.");

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

        sendSystemNotification(saved.getListingId(), saved.getOwnerId(), saved.getTenantId(),
                "✅ Bonne nouvelle ! Votre réservation du "
                        + saved.getCheckInDate().format(DATE_FMT) + " au "
                        + saved.getCheckOutDate().format(DATE_FMT)
                        + " a été confirmée par le propriétaire. "
                        + "Bon séjour !");

        return bookingMapper.toResponse(saved);
    }

    @Transactional
    public void cancelAllByListing(UUID listingId) {
        List<Booking> active = bookingRepository.findByListingIdAndStatusIn(
                listingId, List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED));
        for (Booking booking : active) {
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE,
                    RabbitMQConfig.BOOKING_CANCELLED_KEY,
                    bookingMapper.toResponse(booking)
            );
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

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.BOOKING_CANCELLED_KEY,
                bookingMapper.toResponse(saved)
        );

        boolean cancelledByOwner = booking.getOwnerId().equals(userId);
        String cancelMsg = cancelledByOwner
                ? "❌ Le propriétaire a annulé la réservation du "
                        + saved.getCheckInDate().format(DATE_FMT) + " au "
                        + saved.getCheckOutDate().format(DATE_FMT) + ". "
                        + "Un remboursement sera traité dans les plus brefs délais."
                : "❌ Le locataire a annulé la réservation du "
                        + saved.getCheckInDate().format(DATE_FMT) + " au "
                        + saved.getCheckOutDate().format(DATE_FMT) + ".";
        sendSystemNotification(saved.getListingId(), saved.getOwnerId(), saved.getTenantId(), cancelMsg);

        return bookingMapper.toResponse(saved);
    }

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private void sendSystemNotification(UUID listingId, UUID participantOneId, UUID participantTwoId, String content) {
        try {
            messageClient.post()
                    .uri("/api/messages/internal/system")
                    .header("Content-Type", "application/json")
                    .body(Map.of(
                            "listingId", listingId,
                            "participantOneId", participantOneId,
                            "participantTwoId", participantTwoId,
                            "content", content
                    ))
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.warn("Impossible d'envoyer le message système: {}", e.getMessage());
        }
    }
}
