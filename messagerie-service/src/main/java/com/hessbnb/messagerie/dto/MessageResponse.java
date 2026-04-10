package com.hessbnb.messagerie.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MessageResponse {

    private Integer idMessage;
    private Integer idConversation;
    private Integer idExpediteur;
    private String contenu;
    private Boolean lu;
    private LocalDateTime dateEnvoi;
}
