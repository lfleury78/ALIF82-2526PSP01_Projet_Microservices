package fr.efrei.messageservice.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ConversationCreateRequest(
        @NotNull
        UUID listingId,

        @NotNull
        UUID recipientId
) {}
