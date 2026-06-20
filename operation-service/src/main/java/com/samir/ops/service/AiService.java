package com.samir.ops.service;

import com.samir.ops.dto.AiResponse;
import com.samir.ops.model.BudgetLine;
import com.samir.ops.repository.BudgetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;

@Service
@Slf4j
public class AiService {

    private final BudgetRepository budgetRepository;
    private final RestTemplate restTemplate;
    private final String geminiApiKey;

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=";

    public AiService(BudgetRepository budgetRepository,
                     @Value("${gemini.api.key:}") String geminiApiKey) {
        this.budgetRepository = budgetRepository;
        this.geminiApiKey = geminiApiKey;
        this.restTemplate = new RestTemplate();
    }

    public AiResponse getBudgetRecommendations(Long orgId) {
        List<BudgetLine> lines = budgetRepository.findBudgetLinesByOrganizationId(orgId);

        if (lines.isEmpty()) {
            return new AiResponse("No budget data available to analyze.", "FALLBACK");
        }

        // Call Gemini only if a real API key is configured
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            try {
                String prompt = buildPrompt(lines);
                String aiText = callGeminiApi(prompt);
                return new AiResponse(aiText, "GEMINI_AI");
            } catch (Exception e) {
                log.error("Gemini API call failed, falling back to rule-based analysis: {}", e.getMessage());
            }
        } else {
            log.warn("Gemini API key is not configured. Using rule-based fallback.");
        }

        return generateRuleBasedFallback(lines);
    }

    private String buildPrompt(List<BudgetLine> lines) {
        StringBuilder sb = new StringBuilder();
        sb.append("Act as a senior public finance auditor for a Moroccan educational academy (AREF). ");
        sb.append("Analyze these budget lines and provide 3 short, actionable recommendations (in French) ");
        sb.append("for the administrator. Focus on high commitment rates or overspending. Keep it under 150 words.\n\nData:\n");

        for (BudgetLine line : lines) {
            sb.append(String.format("- Code %s: Initial=%s, Committed=%s, Spent=%s\n",
                    line.getFullCode(), line.getInitialAmount(), line.getCommittedAmount(), line.getSpentAmount()));
        }
        return sb.toString();
    }

    private String callGeminiApi(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> parts = Map.of("parts", List.of(textPart));
        Map<String, Object> contents = Map.of("contents", List.of(parts));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(contents, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
                GEMINI_URL + geminiApiKey, entity, Map.class);

        try {
            List candidates = (List) response.getBody().get("candidates");
            Map candidate = (Map) candidates.get(0);
            Map content = (Map) candidate.get("content");
            List partsList = (List) content.get("parts");
            Map part = (Map) partsList.get(0);
            return (String) part.get("text");
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini response: " + e.getMessage());
        }
    }

    private AiResponse generateRuleBasedFallback(List<BudgetLine> lines) {
        StringBuilder recommendations = new StringBuilder();
        recommendations.append("### Analyse Algorithmique (Mode Hors-ligne)\n\n");

        boolean flagged = false;
        for (BudgetLine line : lines) {
            if (line.getInitialAmount().compareTo(BigDecimal.ZERO) > 0) {
                double rate = line.getCommittedAmount()
                        .multiply(BigDecimal.valueOf(100))
                        .divide(line.getInitialAmount(), 2, BigDecimal.ROUND_HALF_UP)
                        .doubleValue();

                if (rate >= 80.0) {
                    recommendations.append(String.format(
                            "- **Alerte %s**: Vous avez consommé **%.1f%%** de cette ligne. Pensez à bloquer les nouveaux engagements.\n",
                            line.getFullCode(), rate));
                    flagged = true;
                }
            }
        }

        if (!flagged) {
            recommendations.append("- **Situation Stable**: Toutes vos lignes budgétaires présentent un taux de consommation inférieur à 80%. Aucune action requise.");
        }

        return new AiResponse(recommendations.toString(), "ALGORITHMIC_FALLBACK");
    }
}