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
public class Player {
    private String id;
    private String name;
    private boolean isHost;
    
    @Builder.Default
    private int prestigePoints = 0;
    
    @Builder.Default
    private Map<Resource, Integer> tokens = new EnumMap<>(Resource.class);
    
    @Builder.Default
    private Map<Resource, Integer> bonuses = new EnumMap<>(Resource.class);
    
    @Builder.Default
    private List<PlantCard> purchasedCards = new ArrayList<>();
    
    @Builder.Default
    private List<PlantCard> reservedCards = new ArrayList<>(); // Maximum 3
    
    @Builder.Default
    private List<VisitorCard> visitors = new ArrayList<>();

    public int getTotalTokensCount() {
        return tokens.values().stream().mapToInt(Integer::intValue).sum();
    }
}
