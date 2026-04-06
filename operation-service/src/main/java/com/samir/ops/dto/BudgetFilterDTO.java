package com.samir.ops.dto;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class BudgetFilterDTO {
    String type;
    String article;
    String paragraph;
    String line;
}
