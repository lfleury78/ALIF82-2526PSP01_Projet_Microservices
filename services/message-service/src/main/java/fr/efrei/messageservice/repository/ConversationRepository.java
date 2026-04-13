package fr.efrei.messageservice.repository;

import fr.efrei.messageservice.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    @Query("""
            SELECT c FROM Conversation c
            WHERE c.listingId = :listingId
            AND ((c.participantOneId = :userOne AND c.participantTwoId = :userTwo)
              OR (c.participantOneId = :userTwo AND c.participantTwoId = :userOne))
            """)
    Optional<Conversation> findByListingIdAndParticipants(
            @Param("listingId") UUID listingId,
            @Param("userOne") UUID userOne,
            @Param("userTwo") UUID userTwo
    );

    @Query("""
            SELECT c FROM Conversation c
            WHERE c.participantOneId = :userId OR c.participantTwoId = :userId
            ORDER BY c.lastMessageAt DESC NULLS LAST
            """)
    List<Conversation> findByParticipant(@Param("userId") UUID userId);
}
