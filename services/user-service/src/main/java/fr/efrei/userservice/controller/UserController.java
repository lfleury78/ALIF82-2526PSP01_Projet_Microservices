package fr.efrei.userservice.controller;

import fr.efrei.userservice.dto.UserCreateRequest;
import fr.efrei.userservice.dto.UserResponse;
import fr.efrei.userservice.dto.UserUpdateRequest;
import fr.efrei.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable UUID id) {
        return userService.getUserById(id);
    }

    @GetMapping("/me")
    public UserResponse getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        return userService.getUserByKeycloakId(jwt.getSubject());
    }

    @PostMapping("/me")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse registerCurrentUser(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UserCreateRequest request) {
        return userService.getOrCreateUser(jwt.getSubject(), request);
    }

    @PutMapping("/{id}")
    public UserResponse updateUser(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UserUpdateRequest request) {
        return userService.updateUser(id, jwt.getSubject(), request);
    }
}
