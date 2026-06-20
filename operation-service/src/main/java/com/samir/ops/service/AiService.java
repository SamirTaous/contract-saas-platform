package com.samir.ops.service;

import com.samir.ops.dto.AiResponse;
import com.samir.ops.dto.UserContext;
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
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=";

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

    public AiResponse getSingleBudgetRecommendations(UUID lineUuid, UserContext user) {
        // 1. Find the budget line
        BudgetLine line = budgetRepository.findBudgetLineByUuid(lineUuid)
                .orElseThrow(() -> new RuntimeException("Budget line not found"));

        // 2. Security Check: Multi-tenancy
        if (!line.getOrganizationId().equals(user.getOrgId())) {
            throw new RuntimeException("Unauthorized access to this budget line.");
        }

        // 3. Try Gemini AI
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            try {
                String prompt = buildSingleLinePrompt(line);
                String aiText = callGeminiApi(prompt);
                return new AiResponse(aiText, "GEMINI_AI_SINGLE");
            } catch (Exception e) {
                log.error("Single line AI analysis failed, falling back to algorithm: {}", e.getMessage());
            }
        } else {
            log.warn("Gemini API key not configured. Using rule-based fallback for single line.");
        }

        // 4. Fallback: Rule-based analysis for one line
        return generateSingleLineFallback(line);
    }
    private String buildSingleLinePrompt(BudgetLine line) {
        return String.format(
                "Act as a public finance auditor. Analyze this single budget line: Code %s. " +
                        "Initial Budget: %s DH, Committed (Engagé): %s DH, Spent (Payé): %s DH. " +
                        "Provide a brief 1-sentence diagnostic and 1 short recommendation in French. Keep it under 50 words.",
                line.getFullCode(), line.getInitialAmount(), line.getCommittedAmount(), line.getSpentAmount()
        );
    }

    private AiResponse generateSingleLineFallback(BudgetLine line) {
        BigDecimal initial = line.getInitialAmount();
        BigDecimal committed = line.getCommittedAmount();
        BigDecimal spent = line.getSpentAmount();

        // Safety check for empty lines
        if (initial.compareTo(BigDecimal.ZERO) == 0) {
            return new AiResponse("Ligne inactive. Aucun budget alloué pour cet exercice.", "ALGORITHMIC_FALLBACK");
        }

        // Calculate percentages
        double committedRate = committed.multiply(BigDecimal.valueOf(100))
                .divide(initial, 2, BigDecimal.ROUND_HALF_UP).doubleValue();
        double spentRate = spent.multiply(BigDecimal.valueOf(100))
                .divide(initial, 2, BigDecimal.ROUND_HALF_UP).doubleValue();

        String analysis;
        if (committedRate >= 90.0) {
            analysis = String.format("⚠️ **Alerte Saturation (%.1f%% Engagé)** : La ligne est presque saturée. Bloquez immédiatement les nouveaux marchés sur ce code.", committedRate);
        } else if (committedRate < 20.0) {
            analysis = String.format("📈 **Sous-consommation (%.1f%% Engagé)** : Le taux d'engagement est très bas. Accélérez le lancement des appels d'offres programmés.", committedRate);
        } else if (spentRate < (committedRate * 0.3)) {
            analysis = String.format("⏳ **Retard de Paiement (%.1f%% Consommé)** : L'argent est engagé mais les chantiers physique n'avancent pas. Relancez le service construction.", spentRate);
        } else {
            analysis = "**Situation Normale** : Le rythme d'engagement et de paiement sur cette ligne est conforme aux prévisions d'exécution.";
        }

        return new AiResponse(analysis, "ALGORITHMIC_FALLBACK_SINGLE");
    }
}