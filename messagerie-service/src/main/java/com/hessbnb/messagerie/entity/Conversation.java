package com.hessbnb.messagerie.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "conversation")
@Getter
@Setter
@NoArgsConstructor
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_conversation")
    private Integer idConversation;

    @Column(name = "id_user_1", nullable = false)
    private Integer idUser1;

    @Column(name = "id_user_2", nullable = false)
    private Integer idUser2;

    @Column(name = "id_annonce")
    private Integer idAnnonce;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_dernier_msg", nullable = false)
    private LocalDateTime dateDernierMsg;

    @OneToMany(mappedBy = "conversation", fetch = FetchType.LAZY)
    private List<Message> messages = new ArrayList<>();

    @PrePersist
    private void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.dateCreation = now;
        this.dateDernierMsg = now;
    }
}
