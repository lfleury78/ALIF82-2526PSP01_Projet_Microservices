package fr.efrei.messageservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record SystemMessageRequest(
        @NotNull UUID listingId,
        @NotNull UUID participantOneId,
        @NotNull UUID participantTwoId,
        @NotBlank @Size(max = 2000) String content
) {}
