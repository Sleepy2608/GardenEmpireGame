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
    private final com.gardenempire.room.RoomManager roomManager;
    private final Map<String, Game> activeGames = new ConcurrentHashMap<>();
    private final Map<String, java.util.concurrent.locks.ReentrantLock> roomLocks = new ConcurrentHashMap<>();

    public String initGame(String roomId, List<Player> players) {
        Game game = gameEngine.createNewGame(roomId, players);
        activeGames.put(roomId, game);
        return roomId;
    }

    public Game getGame(String gameId) {
        return getGame(gameId, null);
    }

    public Game getGame(String gameId, String playerId) {
        Game game = activeGames.get(gameId);
        if (game == null) {
            var roomOpt = roomManager.getRoom(gameId);
            if (roomOpt.isPresent()) {
                var room = roomOpt.get();
                if (room.getStatus() == com.gardenempire.room.RoomStatus.WAITING) {
                    boolean isGuest = playerId != null && !playerId.equals(room.getHostId());
                    if (isGuest) {
                        throw new GameException("Trận đấu chưa bắt đầu. Vui lòng đợi chủ phòng bắt đầu.");
                    }
                    return null;
                }
                game = gameEngine.createNewGame(room.getId(), room.getPlayers());
                activeGames.put(room.getId(), game);
                return game;
            }
            throw new GameException("Không tìm thấy trận đấu với ID: " + gameId);
        }
        return game;
    }

    public GameState getGameState(String gameId) {
        return getGameState(gameId, null);
    }

    public GameState getGameState(String gameId, String playerId) {
        Game game = getGame(gameId, playerId);
        return game != null ? game.getState() : null;
    }

    public GameState processAction(String gameId, GameActionRequest action) {
        java.util.concurrent.locks.ReentrantLock lock = roomLocks.computeIfAbsent(gameId, k -> new java.util.concurrent.locks.ReentrantLock(true));
        lock.lock();
        try {
            String actionType = action.getResolvedActionType();
            String playerId = action.getPlayerId();

            var roomOpt = roomManager.getRoom(gameId);
            if (roomOpt.isPresent() && roomOpt.get().getStatus() == com.gardenempire.room.RoomStatus.WAITING) {
                var room = roomOpt.get();
                boolean isHost = playerId != null && playerId.equals(room.getHostId());
                if ("GET_STATE".equals(actionType)) {
                    return null;
                }
                if (!isHost) {
                    throw new GameException("Trận đấu chưa bắt đầu. Vui lòng đợi chủ phòng bắt đầu.");
                }
                throw new GameException("Trận đấu chưa bắt đầu. Vui lòng bấm 'Bắt Đầu Trò Chơi' khi đã sẵn sàng.");
            }

            Game game = getGame(gameId, playerId);
            if (game == null) {
                return null;
            }

            if (!"GET_STATE".equals(actionType)) {
                if (game.getState().isGameOver()) {
                    throw new GameException("Trận đấu đã kết thúc, không thể thực hiện thêm hành động.");
                }
                if (playerId != null && !playerId.equals(game.getState().getCurrentTurnPlayerId())) {
                    throw new GameException("Chưa đến lượt của bạn.");
                }
            }

            switch (actionType) {
                case "TAKE_RESOURCES", "TAKE_TOKENS" -> {
                    com.gardenempire.game.Resource.class.getName();
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

            if (game.getState().isGameOver()) {
                roomOpt.ifPresent(r -> r.setStatus(com.gardenempire.room.RoomStatus.FINISHED));
            }

            return game.getState();
        } finally {
            lock.unlock();
        }
    }

    public void removeGame(String gameId) {
        activeGames.remove(gameId);
        roomLocks.remove(gameId);
    }
}
