package com.hessbnb.messagerie.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "message")
@Getter
@Setter
@NoArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_message")
    private Integer idMessage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_conversation", nullable = false)
    private Conversation conversation;

    @Column(name = "id_expediteur", nullable = false)
    private Integer idExpediteur;

    @Column(name = "contenu", nullable = false, columnDefinition = "TEXT")
    private String contenu;

    @Column(name = "lu", nullable = false)
    private Boolean lu = false;

    @Column(name = "date_envoi", nullable = false, updatable = false)
    private LocalDateTime dateEnvoi;

    @PrePersist
    private void prePersist() {
        this.dateEnvoi = LocalDateTime.now();
        if (this.lu == null) {
            this.lu = false;
        }
    }
}
