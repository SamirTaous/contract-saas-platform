package com.samir.ops.service;

import com.samir.ops.dto.BudgetFilterDTO;
import com.samir.ops.dto.UserContext;
import com.samir.ops.model.BudgetLine;
import com.samir.ops.model.Type;
import com.samir.ops.repository.BudgetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetService {

    private final BudgetRepository budgetRepository;

    /**
     * Imports budget lines from an Excel file.
     * Uses a Map to prevent duplicate key errors if the same code appears multiple times in the file.
     */
    @Transactional
    public void importBudgetExcel(MultipartFile file, Long organizationId) throws Exception {
        Workbook workbook = WorkbookFactory.create(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        Map<String, BudgetLine> processedLines = new HashMap<>();

        for (int i = 2; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            String typeStr = getCellValueAsString(row.getCell(0)).trim();
            if (typeStr.isEmpty() || typeStr.contains("-") || typeStr.equalsIgnoreCase("WSAZ")) continue;

            try {
                String article = getCellValueAsString(row.getCell(2));
                String paragraph = getCellValueAsString(row.getCell(3));
                String lineNo = getCellValueAsString(row.getCell(4));
                String fullCode = String.join(".", typeStr.toUpperCase(), article, paragraph, lineNo);

                // Read amount and label
                BigDecimal amountValue = extractNumericValue(row.getCell(7), i);
                String rowLabel = getCellValueAsString(row.getCell(8));

                BudgetLine budgetLine;

                // UPSERT & ACCUMULATION LOGIC
                if (processedLines.containsKey(fullCode)) {
                    budgetLine = processedLines.get(fullCode);
                    // ADD the amount instead of overwriting, in case budget is split across rows
                    budgetLine.setInitialAmount(budgetLine.getInitialAmount().add(amountValue));
                    // Append label if it's new information
                    if (!rowLabel.isEmpty()) budgetLine.setLabel(budgetLine.getLabel() + " | " + rowLabel);
                    log.info("Accumulated amount for duplicate code in Excel: {}", fullCode);
                }
                else {
                    Optional<BudgetLine> dbLine = budgetRepository.findByFullCodeAndOrganizationId(fullCode, organizationId);

                    if (dbLine.isPresent()) {
                        budgetLine = dbLine.get();
                        budgetLine.setInitialAmount(amountValue);
                        budgetLine.setLabel(rowLabel);
                        log.info("Updating existing DB record: {}", fullCode);
                    } else {
                        budgetLine = new BudgetLine();
                        budgetLine.setType(Type.valueOf(typeStr.toUpperCase()));
                        budgetLine.setArticle(article);
                        budgetLine.setParagraph(paragraph);
                        budgetLine.setLine(lineNo);
                        budgetLine.setInitialAmount(amountValue);
                        budgetLine.setLabel(rowLabel);
                        budgetLine.setOrganizationId(organizationId);
                        log.info("Creating new line: {}", fullCode);
                    }
                }
                processedLines.put(fullCode, budgetLine);

            } catch (Exception e) {
                log.error("Error parsing row {}: {}", i + 1, e.getMessage());
            }
        }

        if (!processedLines.isEmpty()) {
            budgetRepository.saveAll(processedLines.values());
            log.info("Import complete. Processed {} unique lines.", processedLines.size());
        }
        workbook.close();
    }

    /**
     * Robust helper to get numbers even if the cell is formatted as String or has noise
     */
    private BigDecimal extractNumericValue(Cell cell, int rowIdx) {
        if (cell == null) return BigDecimal.ZERO;

        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return BigDecimal.valueOf(cell.getNumericCellValue());
            } else if (cell.getCellType() == CellType.STRING) {
                String val = cell.getStringCellValue().replaceAll("[^0-9.,]", "").replace(",", ".");
                return (val.isEmpty() || val.equals(".")) ? BigDecimal.ZERO : new BigDecimal(val);
            } else if (cell.getCellType() == CellType.FORMULA) {
                return BigDecimal.valueOf(cell.getNumericCellValue());
            }
        } catch (Exception e) {
            log.warn("Row {}: Could not extract number from cell. Value ignored.", rowIdx + 1);
        }
        return BigDecimal.ZERO;
    }

    public List<BudgetLine> getAllBudgets(UserContext user){
        if(user.getRole()=="SUPER_ADMIN") return budgetRepository.findAll();
        return budgetRepository.findBudgetLinesByOrganizationId(user.getOrgId());
    }

    public BudgetLine getBudgetLineByCode(String fullCode, Long org){
        return budgetRepository.findByFullCodeAndOrganizationId(fullCode, org)
                .orElseThrow(
                        () -> new RuntimeException("Budget Line doesn't exist.")
                );
    }

    public List<BudgetLine> getBudgetLineByArticle(String article, Long org){
        return budgetRepository.findByArticleAndOrganizationId(article, 1L);
    }

    public List<BudgetLine> filterBudget(BudgetFilterDTO filter, Long orgId) {

        // 1. Case A: Article + Paragraph + Line (The exact 'envelope')
        if (filter.getArticle() != null && filter.getParagraph() != null && filter.getLine() != null) {
            return budgetRepository.findByArticleAndParagraphAndLineAndOrganizationId(
                    filter.getArticle(), filter.getParagraph(), filter.getLine(), orgId);
        }

        // 2. Case B: Article + Paragraph
        if (filter.getArticle() != null && filter.getParagraph() != null) {
            return budgetRepository.findByArticleAndParagraphAndOrganizationId(
                    filter.getArticle(), filter.getParagraph(), orgId);
        }

        // 3. Case C: Article only
        if (filter.getArticle() != null) {
            return budgetRepository.findByArticleAndOrganizationId(filter.getArticle(), orgId);
        }

        // 4. Case D: Type only (MDD or INV)
        // Since filter.getType() is already an Enum, just pass it!
        if (filter.getType() != null) {
            return budgetRepository.findByTypeAndOrganizationId(filter.getType(), orgId);
        }

        // 5. Case E: Error
        throw new RuntimeException("Please fill at least one of the codes (Article, Paragraph, Line, or Type)");
    }

    /**
     * Helper to read cells safely and preserve leading zeros/formatting.
     */
    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                double val = cell.getNumericCellValue();
                // If the number is whole (e.g. 901.0), return as "901"
                if (val == (long) val) {
                    return String.format("%d", (long) val);
                } else {
                    return String.valueOf(val);
                }
            case FORMULA:
                try {
                    return cell.getStringCellValue();
                } catch (Exception e) {
                    return String.valueOf(cell.getNumericCellValue());
                }
            default:
                return "";
        }
    }
}