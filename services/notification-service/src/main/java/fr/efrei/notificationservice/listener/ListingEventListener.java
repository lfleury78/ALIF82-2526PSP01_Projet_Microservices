package fr.efrei.notificationservice.listener;

import fr.efrei.notificationservice.config.RabbitMQConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
public class ListingEventListener {

    private final RestClient messageClient;

    public ListingEventListener(@Value("${services.message-url}") String messageUrl) {
        this.messageClient = RestClient.builder().baseUrl(messageUrl).build();
    }

    @SuppressWarnings("unchecked")
    @RabbitListener(queues = RabbitMQConfig.LISTING_NOTIFICATION_QUEUE)
    public void handleListingDeleted(Map<String, Object> event) {
        try {
            String title = (String) event.get("title");
            UUID listingId = UUID.fromString((String) event.get("listingId"));
            UUID ownerId = UUID.fromString((String) event.get("ownerId"));
            List<String> tenantIds = (List<String>) event.get("affectedTenantIds");

            if (tenantIds == null || tenantIds.isEmpty()) {
                log.info("Listing deleted {} with no affected tenants", listingId);
                return;
            }

            String content = "⚠️ L'annonce \"" + title
                    + "\" a été retirée par le propriétaire. Votre réservation a été automatiquement annulée. "
                    + "Un remboursement sera traité dans les plus brefs délais. "
                    + "Nous nous excusons pour la gêne occasionnée.";

            for (String tenantIdStr : tenantIds) {
                UUID tenantId = UUID.fromString(tenantIdStr);
                sendSystemMessage(listingId, ownerId, tenantId, content);
            }

            log.info("Notifications sent for listing deleted: {} ({} tenants)", listingId, tenantIds.size());
        } catch (Exception e) {
            log.error("Failed to process listing.deleted event", e);
        }
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
            log.warn("Failed to send system message to tenant: {}", e.getMessage());
        }
    }
}
