package fr.efrei.notificationservice.listener;

import fr.efrei.notificationservice.config.RabbitMQConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
public class BookingEventListener {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private final RestClient messageClient;

    public BookingEventListener(@Value("${services.message-url}") String messageUrl) {
        this.messageClient = RestClient.builder().baseUrl(messageUrl).build();
    }

    @RabbitListener(queues = RabbitMQConfig.BOOKING_NOTIFICATION_QUEUE)
    public void handleBookingEvent(Map<String, Object> event) {
        String status = (String) event.get("status");
        if (status == null) return;

        try {
            switch (status) {
                case "PENDING" -> handleCreated(event);
                case "CONFIRMED" -> handleConfirmed(event);
                case "CANCELLED" -> handleCancelled(event);
            }
        } catch (Exception e) {
            log.error("Failed to process booking event (status={}): {}", status, e.getMessage());
        }
    }

    private void handleCreated(Map<String, Object> event) {
        UUID listingId = UUID.fromString((String) event.get("listingId"));
        UUID tenantId = UUID.fromString((String) event.get("tenantId"));
        UUID ownerId = UUID.fromString((String) event.get("ownerId"));
        LocalDate checkIn = LocalDate.parse((String) event.get("checkInDate"));
        LocalDate checkOut = LocalDate.parse((String) event.get("checkOutDate"));
        int guests = event.get("guestsCount") != null ? ((Number) event.get("guestsCount")).intValue() : 1;
        String totalPrice = event.get("totalPrice").toString();

        String content = "\uD83D\uDCCB Nouvelle demande de réservation du "
                + checkIn.format(DATE_FMT) + " au " + checkOut.format(DATE_FMT)
                + " (" + guests + " voyageur" + (guests > 1 ? "s" : "") + "). "
                + "Montant total : " + totalPrice + " €. "
                + "En attente de confirmation du propriétaire.";

        sendSystemMessage(listingId, tenantId, ownerId, content);
        log.info("Notification sent for booking created: {}", event.get("id"));
    }

    private void handleConfirmed(Map<String, Object> event) {
        UUID listingId = UUID.fromString((String) event.get("listingId"));
        UUID tenantId = UUID.fromString((String) event.get("tenantId"));
        UUID ownerId = UUID.fromString((String) event.get("ownerId"));
        LocalDate checkIn = LocalDate.parse((String) event.get("checkInDate"));
        LocalDate checkOut = LocalDate.parse((String) event.get("checkOutDate"));

        String content = "✅ Bonne nouvelle ! Votre réservation du "
                + checkIn.format(DATE_FMT) + " au " + checkOut.format(DATE_FMT)
                + " a été confirmée par le propriétaire. "
                + "Bon séjour !";

        sendSystemMessage(listingId, ownerId, tenantId, content);
        log.info("Notification sent for booking confirmed: {}", event.get("id"));
    }

    private void handleCancelled(Map<String, Object> event) {
        UUID listingId = UUID.fromString((String) event.get("listingId"));
        UUID tenantId = UUID.fromString((String) event.get("tenantId"));
        UUID ownerId = UUID.fromString((String) event.get("ownerId"));
        LocalDate checkIn = LocalDate.parse((String) event.get("checkInDate"));
        LocalDate checkOut = LocalDate.parse((String) event.get("checkOutDate"));

        boolean cancelledByOwner = "OWNER".equals(event.get("cancelledBy"));

        String content;
        if (cancelledByOwner) {
            content = "❌ Le propriétaire a annulé la réservation du "
                    + checkIn.format(DATE_FMT) + " au " + checkOut.format(DATE_FMT) + ". "
                    + "Un remboursement sera traité dans les plus brefs délais.";
        } else {
            content = "❌ Le locataire a annulé la réservation du "
                    + checkIn.format(DATE_FMT) + " au " + checkOut.format(DATE_FMT) + ".";
        }

        sendSystemMessage(listingId, ownerId, tenantId, content);
        log.info("Notification sent for booking cancelled: {}", event.get("id"));
    }

    private void sendSystemMessage(UUID listingId, UUID participantOneId, UUID participantTwoId, String content) {
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
            log.warn("Failed to send system message: {}", e.getMessage());
        }
    }
}
