package com.samir.ops.service;

import com.samir.ops.dto.BudgetFilterDTO;
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

        // This Map acts as a local "Cache" for the current import session
        // Key = fullCode (e.g., MDD.901.21.32), Value = BudgetLine object
        Map<String, BudgetLine> processedLines = new HashMap<>();

        // Assuming headers are on row 1 & 2, data starts on row 3 (Index 2)
        for (int i = 2; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            // 1. Get and Validate Type (Column A)
            String typeStr = getCellValueAsString(row.getCell(0)).trim();
            if (typeStr.isEmpty() || typeStr.contains("-") || typeStr.equalsIgnoreCase("WSAZ")) {
                continue;
            }

            try {
                // 2. Extract Identifier Components
                String article = getCellValueAsString(row.getCell(2));
                String paragraph = getCellValueAsString(row.getCell(3));
                String lineNo = getCellValueAsString(row.getCell(4));

                // Construct the unique key
                String fullCode = String.join(".", typeStr.toUpperCase(), article, paragraph, lineNo);

                // 3. Extract Amount (Column I - Index 8)
                BigDecimal amountValue = BigDecimal.ZERO;
                Cell amountCell = row.getCell(8);
                if (amountCell != null && amountCell.getCellType() == CellType.NUMERIC) {
                    amountValue = BigDecimal.valueOf(amountCell.getNumericCellValue());
                }

                BudgetLine budgetLine;

                // 4. UPSERT LOGIC
                // Check if we already handled this code in the current loop
                if (processedLines.containsKey(fullCode)) {
                    budgetLine = processedLines.get(fullCode);
                    budgetLine.setInitialAmount(amountValue); // Overwrite with newest amount
                    log.info("Handled duplicate row in Excel for code: {}", fullCode);
                }
                else {
                    // Check if the line exists in the Database from a previous import
                    Optional<BudgetLine> dbLine = budgetRepository.findByFullCodeAndOrganizationId(fullCode, organizationId);

                    if (dbLine.isPresent()) {
                        budgetLine = dbLine.get();
                        budgetLine.setInitialAmount(amountValue);
                        log.info("Updating existing database record: {}", fullCode);
                    } else {
                        // Brand new line
                        budgetLine = new BudgetLine();
                        budgetLine.setType(Type.valueOf(typeStr.toUpperCase()));
                        budgetLine.setArticle(article);
                        budgetLine.setParagraph(paragraph);
                        budgetLine.setLine(lineNo);
                        budgetLine.setInitialAmount(amountValue);
                        budgetLine.setOrganizationId(organizationId);
                        log.info("Creating new budget line: {}", fullCode);
                    }
                }

                // 5. Update the map
                processedLines.put(fullCode, budgetLine);

            } catch (IllegalArgumentException e) {
                log.warn("Invalid Budget Type on row {}: {}", i + 1, typeStr);
            } catch (Exception e) {
                log.error("Failed to parse row {}: {}", i + 1, e.getMessage());
            }
        }

        // 6. Save all unique results to the database
        if (!processedLines.isEmpty()) {
            budgetRepository.saveAll(processedLines.values());
            log.info("Import complete. Processed {} unique budget lines.", processedLines.size());
        }

        workbook.close();
    }

    public List<BudgetLine> getAllBudgets(){
        return budgetRepository.findAll();
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