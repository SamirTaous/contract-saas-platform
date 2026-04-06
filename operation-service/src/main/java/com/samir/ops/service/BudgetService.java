package com.samir.ops.service;

import com.samir.ops.model.BudgetLine;
import com.samir.ops.model.Type;
import com.samir.ops.repository.BudgetRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;

    @Transactional
    public void importBudgetExcel(MultipartFile file, Long organizationId) throws Exception {
        Workbook workbook = WorkbookFactory.create(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        List<BudgetLine> budgetLines = new ArrayList<>();


        for (int i = 3; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null || row.getCell(0) == null) continue;

            String typeStr = getCellValueAsString(row.getCell(0));
            String article = getCellValueAsString(row.getCell(2));
            String paragraph = getCellValueAsString(row.getCell(3));
            String line = getCellValueAsString(row.getCell(4));
            double amount = row.getCell(8).getNumericCellValue();

            BudgetLine budgetLine = new BudgetLine();
            budgetLine.setType(Type.valueOf(typeStr)); // MDD or INV
            budgetLine.setArticle(article);
            budgetLine.setParagraph(paragraph);
            budgetLine.setLine(line);
            budgetLine.setInitialAmount(BigDecimal.valueOf(amount));
            budgetLine.setOrganizationId(organizationId);

            budgetLines.add(budgetLine);
        }

        budgetRepository.saveAll(budgetLines);
        workbook.close();
    }

    // Helper to handle leading zeros (like "08")
    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        if (cell.getCellType() == CellType.NUMERIC) {
            // Converts "901.0" to "901"
            return String.valueOf((int) cell.getNumericCellValue());
        }
        return cell.getStringCellValue();
    }
}