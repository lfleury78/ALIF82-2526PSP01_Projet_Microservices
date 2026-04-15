package fr.efrei.messageservice.service;

import fr.efrei.messageservice.dto.*;
import fr.efrei.messageservice.entity.Conversation;
import fr.efrei.messageservice.entity.Message;
import fr.efrei.messageservice.repository.ConversationRepository;
import fr.efrei.messageservice.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MessageService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public ConversationResponse createOrGetConversation(UUID senderId, ConversationCreateRequest request) {
        if (senderId.equals(request.recipientId())) {
            throw new IllegalArgumentException("You cannot start a conversation with yourself");
        }

        return conversationRepository.findByListingIdAndParticipants(
                        request.listingId(), senderId, request.recipientId())
                .map(conv -> {
                    if (conv.getDeletedAtFor(senderId) != null) {
                        conv.setDeletedAtFor(senderId, null);
                        conversationRepository.save(conv);
                    }
                    return toConversationResponse(conv);
                })
                .orElseGet(() -> {
                    Conversation conversation = Conversation.builder()
                            .listingId(request.listingId())
                            .participantOneId(senderId)
                            .participantTwoId(request.recipientId())
                            .build();
                    return toConversationResponse(conversationRepository.save(conversation));
                });
    }

    public List<ConversationResponse> getConversations(UUID userId) {
        return conversationRepository.findByParticipant(userId).stream()
                .filter(conv -> conv.getDeletedAtFor(userId) == null)
                .map(this::toConversationResponse)
                .toList();
    }

    public List<MessageResponse> getMessages(UUID conversationId, UUID userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        if (!conversation.isParticipant(userId)) {
            throw new IllegalArgumentException("You are not a participant of this conversation");
        }

        LocalDateTime deletedAt = conversation.getDeletedAtFor(userId);

        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId).stream()
                .filter(msg -> deletedAt == null || msg.getCreatedAt().isAfter(deletedAt))
                .map(this::toMessageResponse)
                .toList();
    }

    @Transactional
    public MessageResponse sendMessage(UUID conversationId, UUID senderId, MessageCreateRequest request) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        if (!conversation.isParticipant(senderId)) {
            throw new IllegalArgumentException("You are not a participant of this conversation");
        }

        LocalDateTime now = LocalDateTime.now();

        Message message = Message.builder()
                .conversation(conversation)
                .senderId(senderId)
                .content(request.content())
                .createdAt(now)
                .build();

        Message saved = messageRepository.save(message);

        conversation.setLastMessageAt(now);
        conversationRepository.save(conversation);

        MessageResponse response = toMessageResponse(saved);
        notifyParticipants(conversation, response);
        return response;
    }

    @Transactional
    public void markAsRead(UUID conversationId, UUID userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        if (!conversation.isParticipant(userId)) {
            throw new IllegalArgumentException("You are not a participant of this conversation");
        }

        messageRepository.markAsRead(conversationId, userId);
    }

    public long getUnreadCount(UUID userId) {
        return messageRepository.countUnreadForUser(userId);
    }

    @Transactional
    public void deleteConversation(UUID conversationId, UUID userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        if (!conversation.isParticipant(userId)) {
            throw new IllegalArgumentException("You are not a participant of this conversation");
        }

        conversation.setDeletedAtFor(userId, LocalDateTime.now());
        conversationRepository.save(conversation);
    }

    private static final UUID SYSTEM_SENDER_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");

    @Transactional
    public void sendSystemMessage(SystemMessageRequest request) {
        Conversation conversation = conversationRepository.findByListingIdAndParticipants(
                        request.listingId(), request.participantOneId(), request.participantTwoId())
                .orElseGet(() -> {
                    Conversation newConv = Conversation.builder()
                            .listingId(request.listingId())
                            .participantOneId(request.participantOneId())
                            .participantTwoId(request.participantTwoId())
                            .build();
                    return conversationRepository.save(newConv);
                });

        LocalDateTime now = LocalDateTime.now();

        Message message = Message.builder()
                .conversation(conversation)
                .senderId(SYSTEM_SENDER_ID)
                .content(request.content())
                .createdAt(now)
                .build();

        Message saved = messageRepository.save(message);

        conversation.setLastMessageAt(now);
        conversation.setDeletedByOneAt(null);
        conversation.setDeletedByTwoAt(null);
        conversationRepository.save(conversation);

        notifyParticipants(conversation, toMessageResponse(saved));
    }

    private ConversationResponse toConversationResponse(Conversation conversation) {
        return new ConversationResponse(
                conversation.getId(),
                conversation.getListingId(),
                conversation.getParticipantOneId(),
                conversation.getParticipantTwoId(),
                conversation.getLastMessageAt(),
                conversation.getCreatedAt(),
                conversation.getUpdatedAt()
        );
    }

    private MessageResponse toMessageResponse(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getConversation().getId(),
                message.getSenderId(),
                message.getContent(),
                message.getReadAt(),
                message.getCreatedAt()
        );
    }

    private void notifyParticipants(Conversation conversation, MessageResponse message) {
        messagingTemplate.convertAndSend(
                "/topic/conversation." + conversation.getId(),
                message
        );
        messagingTemplate.convertAndSend(
                "/topic/unread." + conversation.getParticipantOneId(),
                "update"
        );
        messagingTemplate.convertAndSend(
                "/topic/unread." + conversation.getParticipantTwoId(),
                "update"
        );
    }
}
