package com.samir.auth.exception;

public class OrganizationNotEmptyException extends RuntimeException {
    public OrganizationNotEmptyException(String name) {
        super("Organization "+ name + " is not empty, delete users and try again.");
    }
}
