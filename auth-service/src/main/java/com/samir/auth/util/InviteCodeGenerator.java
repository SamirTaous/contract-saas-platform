package com.samir.auth.util;

import java.security.SecureRandom;

public class InviteCodeGenerator {

    private static final String CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom random = new SecureRandom();

    public static String generate(String orgName) {
        StringBuilder code = new StringBuilder();

        // 1. Add Org Prefix (3 chars)
        String prefix = orgName.length() >= 3 ? orgName.substring(0, 3) : orgName;
        code.append(prefix.toUpperCase()).append("-");

        // 2. Add 6 random alphanumeric characters
        for (int i = 0; i < 6; i++) {
            code.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }

        // Output Form: SAM-H7K9L2
        return code.toString();
    }
}