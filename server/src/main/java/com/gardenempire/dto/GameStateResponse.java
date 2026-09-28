package com.gardenempire.dto;

import com.gardenempire.game.GameState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameStateResponse {
    private String type; // e.g. "GAME_STATE_UPDATE"
    private GameState payload;
}
