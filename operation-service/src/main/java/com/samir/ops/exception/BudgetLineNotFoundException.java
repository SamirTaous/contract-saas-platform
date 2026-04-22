package com.samir.ops.exception;

public class BudgetLineNotFoundException extends RuntimeException {
    public BudgetLineNotFoundException() {
        super("Selected Budget Line not found");
    }
}
