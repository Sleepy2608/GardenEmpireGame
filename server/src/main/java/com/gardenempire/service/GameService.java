package com.gardenempire.service;

import com.gardenempire.dto.GameActionRequest;
import com.gardenempire.exception.GameException;
import com.gardenempire.game.Game;
import com.gardenempire.game.GameEngine;
import com.gardenempire.game.GameState;
import com.gardenempire.game.Player;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.*;

@Slf4j
@Service
public class GameService {
    private final GameEngine gameEngine;
    private final com.gardenempire.room.RoomManager roomManager;
    private Map<String, Game> activeGames = new ConcurrentHashMap<>();
    private Map<String, java.util.concurrent.locks.ReentrantLock> roomLocks = new ConcurrentHashMap<>();

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);
    private final Map<String, ScheduledFuture<?>> turnTimerTasks = new ConcurrentHashMap<>();

    public interface GameEventListener {
        void onGameStateUpdated(String gameId, GameState state);
        void onAfkWarning(String gameId, String playerId, int strike, int maxStrikes, String message);
        void onPlayerKickedAfk(String gameId, Player player, GameState state);
    }

    private GameEventListener eventListener;

    public void setEventListener(GameEventListener eventListener) {
        this.eventListener = eventListener;
    }

    @jakarta.annotation.PreDestroy
    public void cleanup() {
        scheduler.shutdownNow();
    }

    public GameService(GameEngine gameEngine, com.gardenempire.room.RoomManager roomManager) {
        this.gameEngine = gameEngine;
        this.roomManager = roomManager;
    }

    public String initGame(String roomId, List<Player> players) {
        return initGame(roomId, players, 60);
    }

    public String initGame(String roomId, List<Player> players, int turnDurationSeconds) {
        Game game = gameEngine.createNewGame(roomId, players, turnDurationSeconds);
        activeGames.put(roomId, game);
        startTurnTimer(roomId);
        return roomId;
    }

    public void startTurnTimer(String gameId) {
        cancelTurnTimer(gameId);
        Game game = activeGames.get(gameId);
        if (game == null || game.getState() == null || game.getState().isGameOver()) {
            return;
        }
        String currentTurnPlayerId = game.getState().getCurrentTurnPlayerId();
        if (currentTurnPlayerId == null) {
            return;
        }

        int duration = game.getState().getTurnDurationSeconds();
        if (duration <= 0) {
            duration = 60;
        }

        ScheduledFuture<?> task = scheduler.schedule(() -> {
            handleTurnTimeout(gameId, currentTurnPlayerId);
        }, duration, TimeUnit.SECONDS);

        turnTimerTasks.put(gameId, task);
    }

    public void cancelTurnTimer(String gameId) {
        ScheduledFuture<?> existingTask = turnTimerTasks.remove(gameId);
        if (existingTask != null && !existingTask.isDone()) {
            existingTask.cancel(false);
        }
    }

    public void handleTurnTimeout(String gameId, String expectedPlayerId) {
        java.util.concurrent.locks.ReentrantLock lock = roomLocks.computeIfAbsent(gameId, k -> new java.util.concurrent.locks.ReentrantLock(true));
        lock.lock();
        try {
            Game game = activeGames.get(gameId);
            if (game == null || game.getState() == null || game.getState().isGameOver()) {
                return;
            }

            if (!expectedPlayerId.equals(game.getState().getCurrentTurnPlayerId())) {
                return;
            }

            Player player;
            try {
                player = gameEngine.getPlayer(game, expectedPlayerId);
            } catch (Exception ignored) {
                return;
            }

            if (player.isHasLeft()) {
                return;
            }

            int previousConsecutiveAfk = player.getConsecutiveAfkCount();
            gameEngine.handleTurnTimeout(game, expectedPlayerId);
            GameState state = game.getState();

            if (state.isGameOver()) {
                cancelTurnTimer(gameId);
                var roomOpt = roomManager.getRoom(gameId);
                roomOpt.ifPresent(r -> r.setStatus(com.gardenempire.room.RoomStatus.FINISHED));
            } else {
                startTurnTimer(gameId);
            }

            if (eventListener != null) {
                eventListener.onGameStateUpdated(gameId, state);
                if (previousConsecutiveAfk == 0) {
                    String warnMsg = "⚠️ Bạn đã hết thời gian lượt đi! Hệ thống đã tự động thu thập tài nguyên và chuyển lượt. Nếu tiếp tục AFK ở lượt sau, bạn sẽ bị truất quyền thi đấu!";
                    eventListener.onAfkWarning(gameId, expectedPlayerId, 1, 2, warnMsg);
                } else {
                    eventListener.onPlayerKickedAfk(gameId, player, state);
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi xử lý timeout lượt cho gameId={}, playerId={}: ", gameId, expectedPlayerId, e);
        } finally {
            lock.unlock();
        }
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
                game = gameEngine.createNewGame(room.getId(), room.getPlayers(), room.getTurnDurationSeconds());
                activeGames.put(room.getId(), game);
                startTurnTimer(room.getId());
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

            if (playerId != null && !"GET_STATE".equals(actionType)) {
                var pOpt = game.getState().getPlayers().stream().filter(p -> p.getId().equals(playerId)).findFirst();
                if (pOpt.isPresent() && pOpt.get().isHasLeft()) {
                    throw new GameException("Bạn đã rời khỏi ván đấu.");
                }
            }

            boolean isTurnExempt = "GET_STATE".equals(actionType) || "SEND_CHAT".equals(actionType) || "CHAT".equals(actionType);
            if (!isTurnExempt) {
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
                case "SEND_CHAT", "CHAT" -> {
                    String chatMsg = action.getResolvedMessage();
                    gameEngine.sendChatMessage(game, playerId, chatMsg);
                }
                case "GET_STATE" -> {
                    // Return current state unchanged
                }
                default -> throw new GameException("Loại hành động không hợp lệ: " + actionType);
            }

            if (game.getState().isGameOver()) {
                cancelTurnTimer(gameId);
                roomOpt.ifPresent(r -> r.setStatus(com.gardenempire.room.RoomStatus.FINISHED));
            } else if (!isTurnExempt) {
                startTurnTimer(gameId);
            }

            return game.getState();
        } finally {
            lock.unlock();
        }
    }

    public void removeGame(String gameId) {
        cancelTurnTimer(gameId);
        activeGames.remove(gameId);
        roomLocks.remove(gameId);
    }

    public GameState handlePlayerLeave(String gameId, String playerId) {
        java.util.concurrent.locks.ReentrantLock lock = roomLocks.computeIfAbsent(gameId, k -> new java.util.concurrent.locks.ReentrantLock(true));
        lock.lock();
        try {
            Game game = activeGames.get(gameId);
            if (game == null) {
                return null;
            }
            gameEngine.handlePlayerLeave(game, playerId);
            if (game.getState().isGameOver()) {
                cancelTurnTimer(gameId);
                var roomOpt = roomManager.getRoom(gameId);
                roomOpt.ifPresent(r -> r.setStatus(com.gardenempire.room.RoomStatus.FINISHED));
            } else {
                startTurnTimer(gameId);
            }
            return game.getState();
        } finally {
            lock.unlock();
        }
    }

    public com.gardenempire.game.ChatMessage sendChatMessage(String gameId, String playerId, String message) {
        Game game = getGame(gameId, playerId);
        if (game == null) {
            throw new GameException("Không tìm thấy trận đấu với ID: " + gameId);
        }
        return gameEngine.sendChatMessage(game, playerId, message);
    }
}
