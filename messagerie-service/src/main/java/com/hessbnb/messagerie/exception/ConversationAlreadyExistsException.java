package com.hessbnb.messagerie.exception;

public class ConversationAlreadyExistsException extends RuntimeException {

    public ConversationAlreadyExistsException(Integer idUser1, Integer idUser2, Integer idAnnonce) {
        super("Une conversation existe déjà entre les utilisateurs " + idUser1 + " et " + idUser2
                + (idAnnonce != null ? " pour l'annonce " + idAnnonce : ""));
    }
}
