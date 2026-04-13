package fr.efrei.messageservice.controller;

import fr.efrei.messageservice.dto.*;
import fr.efrei.messageservice.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping("/conversations")
    @ResponseStatus(HttpStatus.CREATED)
    public ConversationResponse createOrGetConversation(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ConversationCreateRequest request) {
        UUID senderId = UUID.fromString(jwt.getSubject());
        return messageService.createOrGetConversation(senderId, request);
    }

    @GetMapping("/conversations")
    public List<ConversationResponse> getConversations(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return messageService.getConversations(userId);
    }

    @GetMapping("/conversations/{conversationId}")
    public List<MessageResponse> getMessages(
            @PathVariable UUID conversationId,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return messageService.getMessages(conversationId, userId);
    }

    @PostMapping("/conversations/{conversationId}")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse sendMessage(
            @PathVariable UUID conversationId,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody MessageCreateRequest request) {
        UUID senderId = UUID.fromString(jwt.getSubject());
        return messageService.sendMessage(conversationId, senderId, request);
    }

    @PatchMapping("/conversations/{conversationId}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAsRead(
            @PathVariable UUID conversationId,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        messageService.markAsRead(conversationId, userId);
    }

    @GetMapping("/conversations/unread-count")
    public long getUnreadCount(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return messageService.getUnreadCount(userId);
    }

    @DeleteMapping("/conversations/{conversationId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteConversation(
            @PathVariable UUID conversationId,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        messageService.deleteConversation(conversationId, userId);
    }
}
