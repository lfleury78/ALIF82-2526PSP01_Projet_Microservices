package com.hessbnb.messagerie.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateConversationRequest {

    @NotNull(message = "L'identifiant du premier utilisateur est obligatoire")
    private Integer idUser1;

    @NotNull(message = "L'identifiant du second utilisateur est obligatoire")
    private Integer idUser2;

    private Integer idAnnonce;
}
