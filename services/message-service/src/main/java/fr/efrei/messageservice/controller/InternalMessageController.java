package fr.efrei.messageservice.controller;

import fr.efrei.messageservice.dto.SystemMessageRequest;
import fr.efrei.messageservice.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/messages/internal")
@RequiredArgsConstructor
public class InternalMessageController {

    private final MessageService messageService;

    @PostMapping("/system")
    @ResponseStatus(HttpStatus.CREATED)
    public void sendSystemMessage(@Valid @RequestBody SystemMessageRequest request) {
        messageService.sendSystemMessage(request);
    }
}
