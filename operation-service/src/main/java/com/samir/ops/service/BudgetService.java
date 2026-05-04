package com.samir.ops.service;

import com.samir.ops.dto.BudgetFilterDTO;
import com.samir.ops.dto.UserContext;
import com.samir.ops.exception.UnauthorizedAccessException;
import com.samir.ops.model.BudgetLine;
import com.samir.ops.model.Type;
import com.samir.ops.repository.BudgetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.catalina.User;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.Year;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetService {

    private final BudgetRepository budgetRepository;

    /**
     * Imports budget lines from an Excel file.
     * Implements Upsert (Update or Insert) and accumulation logic.
     */
    @Transactional
    public void importBudgetExcel(MultipartFile file, Long organizationId, int year, boolean isRAM) throws Exception {
        Workbook workbook = WorkbookFactory.create(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        // Track lines processed in this specific file to handle internal duplicates
        Map<String, BudgetLine> processedLines = new HashMap<>();

        // Start from row 3 (Index 2)
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

                BigDecimal amountValue = extractNumericValue(row.getCell(7), i);
                String rowLabel = getCellValueAsString(row.getCell(8));

                BudgetLine budgetLine;

                // 1. Memory Check (Batch duplicates)
                if (processedLines.containsKey(fullCode)) {
                    budgetLine = processedLines.get(fullCode);

                    if (isRAM) {
                        budgetLine.setCommittedAmount(budgetLine.getCommittedAmount().add(amountValue));
                    } else {
                        budgetLine.setInitialAmount(budgetLine.getInitialAmount().add(amountValue));
                    }

                    if (!rowLabel.isEmpty()) budgetLine.setLabel(budgetLine.getLabel() + " | " + rowLabel);
                }
                else {
                    // 2. Database Check (Using java.time.Year)
                    Optional<BudgetLine> dbLine = budgetRepository.findByFullCodeAndOrganizationIdAndFiscalYear(fullCode, organizationId, year);

                    if (dbLine.isPresent()) {
                        budgetLine = dbLine.get();
                        if (isRAM) {
                            // RAM Logic: ADD to the existing locked money
                            budgetLine.setCommittedAmount(budgetLine.getCommittedAmount().add(amountValue));
                        } else {
                            // Initial Budget Logic: SET the total money
                            budgetLine.setInitialAmount(amountValue);
                        }
                        budgetLine.setLabel(rowLabel);
                        log.info("Updating existing record for year {}: {}", year, fullCode);
                    } else {
                        // 3. Create brand new line for this Year
                        budgetLine = new BudgetLine();
                        budgetLine.setType(Type.valueOf(typeStr.toUpperCase()));
                        budgetLine.setArticle(article);
                        budgetLine.setParagraph(paragraph);
                        budgetLine.setLine(lineNo);
                        budgetLine.setOrganizationId(organizationId);
                        budgetLine.setFiscalYear(year); // <--- Using java.time.Year
                        budgetLine.setLabel(rowLabel);

                        if (isRAM) {
                            budgetLine.setInitialAmount(BigDecimal.ZERO);
                            budgetLine.setCommittedAmount(amountValue);
                        } else {
                            budgetLine.setInitialAmount(amountValue);
                            budgetLine.setCommittedAmount(BigDecimal.ZERO);
                        }
                        log.info("Creating new line for year {}: {}", year, fullCode);
                    }
                }
                processedLines.put(fullCode, budgetLine);

            } catch (Exception e) {
                log.error("Error parsing row {}: {}", i + 1, e.getMessage());
            }
        }

        if (!processedLines.isEmpty()) {
            budgetRepository.saveAll(processedLines.values());
        }
        workbook.close();
    }

    /**
     * Logic for fetching budgets based on user role.
     */
    public List<BudgetLine> getAllBudgets(UserContext user) {
        if ("SUPER_ADMIN".equals(user.getRole())) {
            return budgetRepository.findAll();
        }
        return budgetRepository.findBudgetLinesByOrganizationId(user.getOrgId());
    }

    /**
     * Filters the budget using hierarchical priority.
     */
    public List<BudgetLine> filterBudget(BudgetFilterDTO filter, UserContext user) {
        // Hierarchy: Line > Paragraph > Article > Type
        if (filter.getLine() != null && filter.getParagraph() != null && filter.getArticle() != null) {
            return budgetRepository.findByArticleAndParagraphAndLineAndOrganizationId(
                    filter.getArticle(), filter.getParagraph(), filter.getLine(), user.getOrgId());
        }

        if (filter.getParagraph() != null && filter.getArticle() != null) {
            return budgetRepository.findByArticleAndParagraphAndOrganizationId(
                    filter.getArticle(), filter.getParagraph(), user.getOrgId());
        }

        if (filter.getArticle() != null) {
            return budgetRepository.findByArticleAndOrganizationId(filter.getArticle(), user.getOrgId());
        }

        if (filter.getType() != null) {
            return budgetRepository.findByTypeAndOrganizationId(filter.getType(), user.getOrgId());
        }

        throw new RuntimeException("Please fill at least one of the codes (Article, Paragraph, Line, or Type)");
    }

    public BudgetLine getBudgetLineByUuid(UUID uuid, UserContext user) {
        BudgetLine budget = budgetRepository.findBudgetLineByUuid(uuid)
                .orElseThrow(() -> new RuntimeException("This Budget Line  doesn't exist for your org."));
        if(budget.getOrganizationId() != user.getOrgId())
            throw new UnauthorizedAccessException();
        return budget;
    }

    public BudgetLine getBudgetLineByCode(String fullCode, UserContext user) {
        return budgetRepository.findByFullCodeAndOrganizationId(fullCode, user.getOrgId())
                .orElseThrow(() -> new RuntimeException("Budget Line " + fullCode + " doesn't exist for your org."));
    }

    public List<BudgetLine> getBudgetLineByArticle(String article, UserContext user) {
        return budgetRepository.findByArticleAndOrganizationId(article, user.getOrgId());
    }

    /**
     * Robust helper to get numbers from Excel cells.
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
            log.warn("Row {}: Could not extract number. Defaulting to 0.", rowIdx + 1);
        }
        return BigDecimal.ZERO;
    }

    /**
     * Helper to read cells as String regardless of Excel format.
     */
    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue().trim();
            case NUMERIC:
                double val = cell.getNumericCellValue();
                if (val == (long) val) return String.format("%d", (long) val);
                return String.valueOf(val);
            case FORMULA:
                try { return cell.getStringCellValue(); }
                catch (Exception e) { return String.valueOf(cell.getNumericCellValue()); }
            default: return "";
        }
    }


}