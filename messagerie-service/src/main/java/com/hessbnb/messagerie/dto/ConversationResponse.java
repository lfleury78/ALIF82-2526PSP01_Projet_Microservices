package com.hessbnb.messagerie.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ConversationResponse {

    private Integer idConversation;
    private Integer idUser1;
    private Integer idUser2;
    private Integer idAnnonce;
    private LocalDateTime dateCreation;
    private LocalDateTime dateDernierMsg;
}
