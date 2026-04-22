package com.samir.ops.exception;

public class UnauthorizedAccessException extends RuntimeException {
    public UnauthorizedAccessException() {
        super("Unauthorized: This budget line belongs to another organization.");
    }
}
