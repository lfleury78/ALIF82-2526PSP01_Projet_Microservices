package com.hessbnb.messagerie.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MessageDTO {

    @NotNull(message = "L'identifiant de l'expéditeur est obligatoire")
    private Integer idExpediteur;

    @NotBlank(message = "Le contenu du message ne peut pas être vide")
    @Size(max = 5000, message = "Le contenu du message ne peut pas dépasser 5000 caractères")
    private String contenu;
}
