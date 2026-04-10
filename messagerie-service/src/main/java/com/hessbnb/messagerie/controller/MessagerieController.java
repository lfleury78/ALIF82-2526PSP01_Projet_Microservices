package com.hessbnb.messagerie.controller;

import com.hessbnb.messagerie.dto.ConversationResponse;
import com.hessbnb.messagerie.dto.CreateConversationRequest;
import com.hessbnb.messagerie.dto.MessageDTO;
import com.hessbnb.messagerie.dto.MessageResponse;
import com.hessbnb.messagerie.service.MessagerieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MessagerieController {

    private final MessagerieService messagerieService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * WebSocket endpoint — STOMP destination: /app/conversation/{id}
     * Saves the message, updates the conversation timestamp,
     * then broadcasts the saved message to /topic/conversation/{id}.
     */
    @MessageMapping("/conversation/{id}")
    public void handleWebSocketMessage(
            @DestinationVariable Integer id,
            @Payload @Valid MessageDTO dto
    ) {
        MessageResponse saved = messagerieService.sendMessage(id, dto);
        messagingTemplate.convertAndSend("/topic/conversation/" + id, saved);
    }

    /**
     * GET /api/conversations/{idUser}
     * Returns all conversations where the user is either participant.
     */
    @GetMapping("/api/conversations/{idUser}")
    public ResponseEntity<List<ConversationResponse>> getConversationsByUser(
            @PathVariable Integer idUser
    ) {
        List<ConversationResponse> conversations = messagerieService.getConversationsByUser(idUser);
        return ResponseEntity.ok(conversations);
    }

    /**
     * GET /api/conversations/{idConversation}/messages?idLecteur={id}
     * Returns all messages in the conversation and marks unread messages as read
     * (only those sent by someone other than idLecteur).
     */
    @GetMapping("/api/conversations/{idConversation}/messages")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @PathVariable Integer idConversation,
            @RequestParam Integer idLecteur
    ) {
        List<MessageResponse> messages = messagerieService.getMessagesAndMarkAsRead(idConversation, idLecteur);
        return ResponseEntity.ok(messages);
    }

    /**
     * POST /api/conversations
     * Creates a new conversation. Returns 409 if a conversation already exists
     * between the same pair of users for the same annonce.
     */
    @PostMapping("/api/conversations")
    public ResponseEntity<ConversationResponse> createConversation(
            @Valid @RequestBody CreateConversationRequest request
    ) {
        ConversationResponse created = messagerieService.createConversation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
