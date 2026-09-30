package com.gardenempire.dto;

import lombok.Data;

@Data
public class JoinByCodeRequest {
    private String code;
    private String id;
    private String name;
    private String avatar;
}
