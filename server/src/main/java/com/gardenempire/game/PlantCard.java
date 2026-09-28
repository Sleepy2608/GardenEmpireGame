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
    private String name;
    private int tier; // 1, 2, 3
    private Map<Resource, Integer> cost;
    private int prestigePoints;
    private Resource bonusResource; // 1 trong 5 tài nguyên cơ bản (EARTH, WATER, SUNLIGHT, SEED, NUTRIENTS)
    private String imagePath;

    public PlantCard(String id, String name, int tier, Map<Resource, Integer> cost, int prestigePoints, Resource bonusResource) {
        this.id = id;
        this.name = name;
        this.tier = tier;
        this.cost = cost;
        this.prestigePoints = prestigePoints;
        this.bonusResource = bonusResource;
    }
}
