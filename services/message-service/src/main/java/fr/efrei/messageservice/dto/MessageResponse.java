package fr.efrei.messageservice.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record MessageResponse(
        UUID id,
        UUID conversationId,
        UUID senderId,
        String content,
        LocalDateTime readAt,
        LocalDateTime createdAt
) {}
