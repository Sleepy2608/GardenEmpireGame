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
public class VisitorCard {
    private String id;
    private String name;
    private int prestigePoints; // Thường là 3 điểm
    private Map<Resource, Integer> requirements; // Yêu cầu số lượng cây bonus
    private String imagePath;

    public VisitorCard(String id, String name, int prestigePoints, Map<Resource, Integer> requirements) {
        this.id = id;
        this.name = name;
        this.prestigePoints = prestigePoints;
        this.requirements = requirements;
    }
}
