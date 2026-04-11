package com.samir.auth.exception;

public class OrganizationNotFoundException extends RuntimeException {
    public OrganizationNotFoundException() {
        super("Organization doesn't exist, contact admin");
    }
}
