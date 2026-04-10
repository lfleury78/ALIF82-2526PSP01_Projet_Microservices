package com.hessbnb.messagerie.repository;

import com.hessbnb.messagerie.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Integer> {

    @Query("SELECT c FROM Conversation c WHERE c.idUser1 = :idUser OR c.idUser2 = :idUser ORDER BY c.dateDernierMsg DESC")
    List<Conversation> findAllByUserId(@Param("idUser") Integer idUser);

    @Query("""
            SELECT c FROM Conversation c
            WHERE (
                (c.idUser1 = :idUser1 AND c.idUser2 = :idUser2)
                OR (c.idUser1 = :idUser2 AND c.idUser2 = :idUser1)
            )
            AND (
                (:idAnnonce IS NULL AND c.idAnnonce IS NULL)
                OR c.idAnnonce = :idAnnonce
            )
            """)
    Optional<Conversation> findExistingConversation(
            @Param("idUser1") Integer idUser1,
            @Param("idUser2") Integer idUser2,
            @Param("idAnnonce") Integer idAnnonce
    );
}
