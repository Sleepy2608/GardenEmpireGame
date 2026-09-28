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
    private int prestigePoints; // Usually 3 points
    private Map<Resource, Integer> requirements; // Required plant bonuses
    private String imagePath;
}
