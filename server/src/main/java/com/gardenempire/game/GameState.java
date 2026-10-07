package com.gardenempire.game;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameState {
    private String gameId;
    
    @Builder.Default
    private List<Player> players = new ArrayList<>();
    
    private String firstPlayerId;
    private String currentTurnPlayerId;
    private boolean isFinalRound;
    private boolean isGameOver;
    private String winnerPlayerId;
    
    @Builder.Default
    private Map<Resource, Integer> resourceBank = new EnumMap<>(Resource.class);
    
    @Builder.Default
    private List<PlantCard> visibleTier1Cards = new ArrayList<>();
    
    @Builder.Default
    private List<PlantCard> visibleTier2Cards = new ArrayList<>();
    
    @Builder.Default
    private List<PlantCard> visibleTier3Cards = new ArrayList<>();
    
    @Builder.Default
    private List<VisitorCard> visibleVisitors = new ArrayList<>();
    
    private int tier1DeckCount;
    private int tier2DeckCount;
    private int tier3DeckCount;
    private int visitorDeckCount;
}
