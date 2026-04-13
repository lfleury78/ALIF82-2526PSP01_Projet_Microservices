package fr.efrei.userservice.service;

import fr.efrei.userservice.dto.UserCreateRequest;
import fr.efrei.userservice.dto.UserResponse;
import fr.efrei.userservice.dto.UserUpdateRequest;
import fr.efrei.userservice.entity.User;
import fr.efrei.userservice.exception.UserNotFoundException;
import fr.efrei.userservice.mapper.UserMapper;
import fr.efrei.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .toList();
    }

    public UserResponse getUserById(UUID id) {
        return userRepository.findById(id)
                .or(() -> userRepository.findByKeycloakId(id.toString()))
                .map(userMapper::toResponse)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    public UserResponse getUserByKeycloakId(String keycloakId) {
        return userRepository.findByKeycloakId(keycloakId)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new UserNotFoundException(keycloakId));
    }

    @Transactional
    public UserResponse createUser(String keycloakId, UserCreateRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already exists: " + request.email());
        }
        if (userRepository.existsByKeycloakId(keycloakId)) {
            throw new IllegalArgumentException("User already registered with this account");
        }

        User user = userMapper.toEntity(request);
        user.setKeycloakId(keycloakId);
        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateUser(UUID id, String keycloakId, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        if (!user.getKeycloakId().equals(keycloakId)) {
            throw new IllegalArgumentException("You can only update your own profile");
        }

        userMapper.updateEntity(request, user);
        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse getOrCreateUser(String keycloakId, UserCreateRequest request) {
        return userRepository.findByKeycloakId(keycloakId)
                .map(userMapper::toResponse)
                .orElseGet(() -> createUser(keycloakId, request));
    }
}
