package com.hessbnb.messagerie.exception;

public class ConversationNotFoundException extends RuntimeException {

    public ConversationNotFoundException(Integer idConversation) {
        super("Conversation introuvable avec l'identifiant : " + idConversation);
    }
}
