package com.samir.ops.dto;

import com.samir.ops.model.Type;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class BudgetFilterDTO {
    Type type;
    String article;
    String paragraph;
    String line;
}
