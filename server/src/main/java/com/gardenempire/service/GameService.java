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
        String actionType = action.getResolvedActionType();
        String playerId = action.getPlayerId();

        switch (actionType) {
            case "TAKE_RESOURCES", "TAKE_TOKENS" -> {
                com.gardenempire.game.Resource.class.getName(); // touch
                java.util.Map<com.gardenempire.game.Resource, Integer> tokens = action.getResolvedTokens();
                gameEngine.takeTokens(game, playerId, tokens);
            }
            case "BUY_PLANT", "BUY_CARD" -> {
                String cardId = action.getResolvedCardId();
                boolean fromReserved = action.isResolvedFromReserved();
                gameEngine.buyPlantCard(game, playerId, cardId, fromReserved);
            }
            case "RESERVE_PLANT", "RESERVE_CARD" -> {
                String cardId = action.getResolvedCardId();
                Integer tier = action.getResolvedFromDeckTier();
                gameEngine.reservePlantCard(game, playerId, cardId, tier);
            }
            case "RETURN_TOKENS" -> {
                java.util.Map<com.gardenempire.game.Resource, Integer> returnedTokens = action.getResolvedReturnedTokens();
                gameEngine.returnTokens(game, playerId, returnedTokens);
            }
            case "GET_STATE" -> {
                // Return current state unchanged
            }
            default -> throw new GameException("Loại hành động không hợp lệ: " + actionType);
        }

        return game.getState();
    }
}
