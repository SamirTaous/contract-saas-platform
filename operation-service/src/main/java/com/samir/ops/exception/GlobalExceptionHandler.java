package com.samir.ops.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice // Tells Spring: "Listen to all controllers"
public class GlobalExceptionHandler {

    // Specific handler for unauthorized access

    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<String> handleUnauthorizedAccess(UnauthorizedAccessException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
    }

    // Specific handler for budget lines

    @ExceptionHandler(BudgetLineNotFoundException.class)
    public ResponseEntity<String> handleBudgetLineNotFound(BudgetLineNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    // Specific handler for markets

    @ExceptionHandler(MarketNotFoundException.class)
    public ResponseEntity<String> handleMarketNotFound(MarketNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
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