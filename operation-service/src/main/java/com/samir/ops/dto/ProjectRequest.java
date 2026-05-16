package com.samir.ops.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class ProjectRequest {
    private String name;
    private UUID marketUuid;
}