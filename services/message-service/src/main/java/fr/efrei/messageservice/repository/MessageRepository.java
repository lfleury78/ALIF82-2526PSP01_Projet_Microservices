package fr.efrei.messageservice.repository;

import fr.efrei.messageservice.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    List<Message> findByConversationIdOrderByCreatedAtAsc(UUID conversationId);

    @Modifying
    @Query("""
            UPDATE Message m SET m.readAt = CURRENT_TIMESTAMP
            WHERE m.conversation.id = :conversationId
            AND m.senderId <> :userId
            AND m.readAt IS NULL
            """)
    int markAsRead(@Param("conversationId") UUID conversationId, @Param("userId") UUID userId);

    @Query("""
            SELECT COUNT(m) FROM Message m
            WHERE m.senderId <> :userId
            AND m.readAt IS NULL
            AND m.conversation.id IN (
                SELECT c.id FROM Conversation c
                WHERE (c.participantOneId = :userId AND c.deletedByOneAt IS NULL)
                   OR (c.participantTwoId = :userId AND c.deletedByTwoAt IS NULL)
            )
            AND (
                (m.conversation.participantOneId = :userId AND (m.conversation.deletedByOneAt IS NULL OR m.createdAt > m.conversation.deletedByOneAt))
                OR
                (m.conversation.participantTwoId = :userId AND (m.conversation.deletedByTwoAt IS NULL OR m.createdAt > m.conversation.deletedByTwoAt))
            )
            """)
    long countUnreadForUser(@Param("userId") UUID userId);
}
