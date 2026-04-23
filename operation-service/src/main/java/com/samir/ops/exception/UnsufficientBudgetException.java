package com.samir.ops.exception;

import java.math.BigDecimal;

public class UnsufficientBudgetException extends RuntimeException {
    public UnsufficientBudgetException(BigDecimal amount) {
        super("Insufficient Budget! Available: "+ amount);
    }
}
