package com.samir.auth.exception;

public class UnauthorizedClientException extends RuntimeException {
    public UnauthorizedClientException(String username) {
        super("User "+ username +" is not allowed on this path");
    }
}
