package com.gardenempire.dto;

import lombok.Data;

@Data
public class KickRequest {
    private String hostId;
    private String targetPlayerId;
}
