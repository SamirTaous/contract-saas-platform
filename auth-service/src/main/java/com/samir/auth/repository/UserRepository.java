package com.samir.auth.repository;

import com.samir.auth.dto.UserResponse;
import com.samir.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository <User, Long> {
    boolean existsByEmail(String email);
    boolean existsUserByUsername(String username);

    User findUserByUsername(String username);

    Optional<User> findUserByUuid(UUID uuid);
}
