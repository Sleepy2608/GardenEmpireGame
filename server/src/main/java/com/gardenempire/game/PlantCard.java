package com.gardenempire.game;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlantCard {
    private String id;
    private int tier; // 1, 2, or 3
    private int prestigePoints;
    private Resource bonusResource; // Permanent discount resource
    private Map<Resource, Integer> cost;
    private String imagePath;
}
