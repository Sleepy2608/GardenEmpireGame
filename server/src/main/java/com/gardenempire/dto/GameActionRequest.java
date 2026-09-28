package com.gardenempire.dto;

import com.gardenempire.game.Resource;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class GameActionRequest {
    private String actionType; // TAKE_TOKENS, BUY_CARD, RESERVE_CARD
    private String playerId;
    
    // For TAKE_TOKENS
    private Map<Resource, Integer> selectedTokens;
    
    // For BUY_CARD / RESERVE_CARD
    private String cardId;
}
