package com.gardenempire.controller;

import com.gardenempire.dto.GameActionRequest;
import com.gardenempire.game.GameState;
import com.gardenempire.service.GameService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/game")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping("/{gameId}/state")
    public ResponseEntity<GameState> getGameState(@PathVariable String gameId) {
        return ResponseEntity.ok(gameService.getGameState(gameId));
    }

    @PostMapping("/{gameId}/action")
    public ResponseEntity<GameState> performAction(
            @PathVariable String gameId,
            @RequestBody GameActionRequest actionRequest) {
        return ResponseEntity.ok(gameService.processAction(gameId, actionRequest));
    }
}
