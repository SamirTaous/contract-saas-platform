package com.samir.auth.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice // Tells Spring: "Listen to all controllers"
public class GlobalExceptionHandler {

    // Specific handler for Organization
    @ExceptionHandler(OrganizationNotFoundException.class)
    public ResponseEntity<String> handleOrganizationNotFound(OrganizationNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    // Specific handler for User
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<String> handleUserNotFound(UserNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    // Specific handler for Login errors
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<String> handleInvalidCredentials(InvalidCredentialsException ex) {
        // Usually 401 Unauthorized is better for login failures
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
    }

    // Specific handler for Unauthorized connections
    @ExceptionHandler(UnauthorizedClientException.class)
    public ResponseEntity<String> handleUnauthorizedClient(UnauthorizedClientException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
    }

    // Specific handler for Not Empty Organization
    @ExceptionHandler(OrganizationNotEmptyException.class)
    public ResponseEntity<String> handleNotEmptyException(OrganizationNotEmptyException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }

    // "Safety Net" for any other unexpected error
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleAll(Exception ex) {
        // Log the real error for you (the dev) in the console
        ex.printStackTrace();
        // Return a generic 500 error to the user
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected server error occurred.");
    }
}