package com.samir.ops.exception;

public class MarketNotFoundException extends RuntimeException {
    public MarketNotFoundException() {
        super("Selected Market was not found");
    }
}
