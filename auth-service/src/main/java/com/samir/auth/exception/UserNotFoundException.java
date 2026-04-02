package com.samir.auth.exception;

import java.util.UUID;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(UUID uuid) {
        super("User with uuid " + uuid + " was not found");
    }
}
