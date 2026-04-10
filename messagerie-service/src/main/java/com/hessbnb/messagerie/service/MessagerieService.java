package com.hessbnb.messagerie.service;

import com.hessbnb.messagerie.dto.ConversationResponse;
import com.hessbnb.messagerie.dto.CreateConversationRequest;
import com.hessbnb.messagerie.dto.MessageDTO;
import com.hessbnb.messagerie.dto.MessageResponse;
import com.hessbnb.messagerie.entity.Conversation;
import com.hessbnb.messagerie.entity.Message;
import com.hessbnb.messagerie.exception.ConversationAlreadyExistsException;
import com.hessbnb.messagerie.exception.ConversationNotFoundException;
import com.hessbnb.messagerie.repository.ConversationRepository;
import com.hessbnb.messagerie.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessagerieService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    @Transactional
    public MessageResponse sendMessage(Integer idConversation, MessageDTO dto) {
        Conversation conversation = conversationRepository.findById(idConversation)
                .orElseThrow(() -> new ConversationNotFoundException(idConversation));

        if (!isParticipant(conversation, dto.getIdExpediteur())) {
            throw new IllegalArgumentException(
                    "L'utilisateur " + dto.getIdExpediteur() + " ne participe pas à cette conversation"
            );
        }

        Message message = new Message();
        message.setConversation(conversation);
        message.setIdExpediteur(dto.getIdExpediteur());
        message.setContenu(dto.getContenu());

        Message saved = messageRepository.save(message);

        conversation.setDateDernierMsg(LocalDateTime.now());
        conversationRepository.save(conversation);

        return toMessageResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> getConversationsByUser(Integer idUser) {
        return conversationRepository.findAllByUserId(idUser)
                .stream()
                .map(this::toConversationResponse)
                .toList();
    }

    @Transactional
    public List<MessageResponse> getMessagesAndMarkAsRead(Integer idConversation, Integer idLecteur) {
        if (!conversationRepository.existsById(idConversation)) {
            throw new ConversationNotFoundException(idConversation);
        }

        messageRepository.markAsRead(idConversation, idLecteur);

        return messageRepository.findByConversationId(idConversation)
                .stream()
                .map(this::toMessageResponse)
                .toList();
    }

    @Transactional
    public ConversationResponse createConversation(CreateConversationRequest request) {
        if (request.getIdUser1().equals(request.getIdUser2())) {
            throw new IllegalArgumentException("Les deux participants doivent être des utilisateurs différents");
        }

        conversationRepository.findExistingConversation(
                request.getIdUser1(), request.getIdUser2(), request.getIdAnnonce()
        ).ifPresent(existing -> {
            throw new ConversationAlreadyExistsException(
                    request.getIdUser1(), request.getIdUser2(), request.getIdAnnonce()
            );
        });

        Conversation conversation = new Conversation();
        conversation.setIdUser1(request.getIdUser1());
        conversation.setIdUser2(request.getIdUser2());
        conversation.setIdAnnonce(request.getIdAnnonce());

        Conversation saved = conversationRepository.save(conversation);
        return toConversationResponse(saved);
    }

    private boolean isParticipant(Conversation conversation, Integer idUser) {
        return conversation.getIdUser1().equals(idUser) || conversation.getIdUser2().equals(idUser);
    }

    private MessageResponse toMessageResponse(Message message) {
        return MessageResponse.builder()
                .idMessage(message.getIdMessage())
                .idConversation(message.getConversation().getIdConversation())
                .idExpediteur(message.getIdExpediteur())
                .contenu(message.getContenu())
                .lu(message.getLu())
                .dateEnvoi(message.getDateEnvoi())
                .build();
    }

    private ConversationResponse toConversationResponse(Conversation conversation) {
        return ConversationResponse.builder()
                .idConversation(conversation.getIdConversation())
                .idUser1(conversation.getIdUser1())
                .idUser2(conversation.getIdUser2())
                .idAnnonce(conversation.getIdAnnonce())
                .dateCreation(conversation.getDateCreation())
                .dateDernierMsg(conversation.getDateDernierMsg())
                .build();
    }
}
