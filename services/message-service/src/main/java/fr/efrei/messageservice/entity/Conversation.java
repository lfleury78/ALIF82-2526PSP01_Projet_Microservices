package fr.efrei.messageservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "conversations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "listing_id", nullable = false)
    private UUID listingId;

    @Column(name = "participant_one_id", nullable = false)
    private UUID participantOneId;

    @Column(name = "participant_two_id", nullable = false)
    private UUID participantTwoId;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @Column(name = "deleted_by_one_at")
    private LocalDateTime deletedByOneAt;

    @Column(name = "deleted_by_two_at")
    private LocalDateTime deletedByTwoAt;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Message> messages = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public boolean isParticipant(UUID userId) {
        return participantOneId.equals(userId) || participantTwoId.equals(userId);
    }

    public boolean isParticipantOne(UUID userId) {
        return participantOneId.equals(userId);
    }

    public LocalDateTime getDeletedAtFor(UUID userId) {
        return isParticipantOne(userId) ? deletedByOneAt : deletedByTwoAt;
    }

    public void setDeletedAtFor(UUID userId, LocalDateTime dateTime) {
        if (isParticipantOne(userId)) {
            this.deletedByOneAt = dateTime;
        } else {
            this.deletedByTwoAt = dateTime;
        }
    }
}
