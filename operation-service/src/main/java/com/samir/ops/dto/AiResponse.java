package com.samir.ops.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AiResponse {
    private String text;
    private String engine; // GEMINI_AI or ALGORITHMIC_FALLBACK
}