package com.hessbnb.messagerie.repository;

import com.hessbnb.messagerie.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Integer> {

    @Query("SELECT m FROM Message m WHERE m.conversation.idConversation = :idConversation ORDER BY m.dateEnvoi ASC")
    List<Message> findByConversationId(@Param("idConversation") Integer idConversation);

    @Modifying
    @Query("""
            UPDATE Message m SET m.lu = true
            WHERE m.conversation.idConversation = :idConversation
            AND m.idExpediteur <> :idLecteur
            AND m.lu = false
            """)
    int markAsRead(@Param("idConversation") Integer idConversation, @Param("idLecteur") Integer idLecteur);
}
