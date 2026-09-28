package com.gardenempire.service;

import com.gardenempire.dto.GameActionRequest;
import com.gardenempire.exception.GameException;
import com.gardenempire.game.Game;
import com.gardenempire.game.GameEngine;
import com.gardenempire.game.GameState;
import com.gardenempire.game.Player;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class GameService {
    private final GameEngine gameEngine;
    private final Map<String, Game> activeGames = new ConcurrentHashMap<>();

    public String initGame(String roomId, List<Player> players) {
        Game game = gameEngine.createNewGame(roomId, players);
        activeGames.put(roomId, game);
        return roomId;
    }

    public Game getGame(String gameId) {
        Game game = activeGames.get(gameId);
        if (game == null) {
            throw new GameException("Không tìm thấy trận đấu với ID: " + gameId);
        }
        return game;
    }

    public GameState getGameState(String gameId) {
        return getGame(gameId).getState();
    }

    public GameState processAction(String gameId, GameActionRequest action) {
        Game game = getGame(gameId);
        // Process turn actions: TAKE_TOKENS, BUY_CARD, RESERVE_CARD
        return game.getState();
    }
}
