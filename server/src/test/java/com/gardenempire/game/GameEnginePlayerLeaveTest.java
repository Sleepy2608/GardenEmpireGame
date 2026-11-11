package com.gardenempire.game;

import com.gardenempire.exception.GameException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("GameEngine — Kiểm thử tính năng xử lý người chơi rời ván (Player Leave System)")
class GameEnginePlayerLeaveTest {

    private GameEngine gameEngine;

    @BeforeEach
    void setUp() {
        gameEngine = new GameEngine();
        gameEngine.setRandom(new java.util.Random() {
            @Override
            public int nextInt(int bound) {
                return 0; // Luôn chọn người chơi đầu tiên p1
            }
        });
    }

    private List<Player> createPlayers(int count) {
        List<Player> list = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            list.add(Player.builder()
                    .id("p" + i)
                    .name("Player " + i)
                    .avatar("🌱")
                    .build());
        }
        return list;
    }

    @Test
    @DisplayName("Case 1: Người chơi rời ván khi KHÔNG phải lượt của họ")
    void testPlayerLeavesWhenNotTheirTurn() {
        Game game = gameEngine.createNewGame("game-1", createPlayers(3));
        assertEquals("p1", game.getState().getCurrentTurnPlayerId());

        // p2 rời ván
        gameEngine.handlePlayerLeave(game, "p2");

        Player p2 = gameEngine.getPlayer(game, "p2");
        assertTrue(p2.isHasLeft(), "p2 phải có cờ hasLeft = true");
        assertEquals("p1", game.getState().getCurrentTurnPlayerId(), "Lượt đi vẫn thuộc về p1");
        assertFalse(game.getState().isGameOver(), "Game chưa kết thúc vì vẫn còn 2 người active");

        // Kiểm tra log
        boolean hasLeaveLog = game.getState().getActionLogs().stream()
                .anyMatch(log -> "PLAYER_LEFT".equals(log.getActionType()) && "p2".equals(log.getPlayerId()));
        assertTrue(hasLeaveLog, "Phải ghi nhận ActionLog PLAYER_LEFT cho p2");
    }

    @Test
    @DisplayName("Case 2: Người chơi rời ván khi ĐANG TRONG LƯỢT ĐI -> Tự động chuyển lượt tiếp theo")
    void testPlayerLeavesDuringTheirTurn_AdvancesTurnAutomatically() {
        Game game = gameEngine.createNewGame("game-2", createPlayers(3));
        assertEquals("p1", game.getState().getCurrentTurnPlayerId());

        // p1 đang giữ lượt đi thì rời ván
        gameEngine.handlePlayerLeave(game, "p1");

        Player p1 = gameEngine.getPlayer(game, "p1");
        assertTrue(p1.isHasLeft(), "p1 phải có cờ hasLeft = true");
        assertEquals("p2", game.getState().getCurrentTurnPlayerId(), "Lượt đi phải tự động chuyển sang p2");
        assertFalse(game.getState().isGameOver(), "Game vẫn tiếp tục với 2 người chơi");
    }

    @Test
    @DisplayName("Case 3: Ván 2 người, 1 người rời ván -> Chiến thắng mặc định (Walkover Victory)")
    void testPlayerLeavesLeavingOnlyOnePlayer_TriggersWalkover() {
        Game game = gameEngine.createNewGame("game-3", createPlayers(2));
        assertEquals("p1", game.getState().getCurrentTurnPlayerId());

        // p2 rời ván
        gameEngine.handlePlayerLeave(game, "p2");

        assertTrue(game.getState().isGameOver(), "Trò chơi phải kết thúc ngay lập tức");
        assertNull(game.getState().getCurrentTurnPlayerId(), "Không còn ai giữ lượt đi");
        assertEquals("p1", game.getState().getWinnerPlayerId(), "p1 là người duy nhất ở lại và giành chiến thắng");

        boolean hasWinLog = game.getState().getActionLogs().stream()
                .anyMatch(log -> "GAME_OVER".equals(log.getActionType()) && "p1".equals(log.getPlayerId()));
        assertTrue(hasWinLog, "Phải ghi nhận log chiến thắng GAME_OVER cho p1");
    }

    @Test
    @DisplayName("Case 4: Người đã rời ván bị chặn toàn bộ hành động (takeTokens, buyCard...)")
    void testPlayerWhoLeftCannotTakeAction() {
        Game game = gameEngine.createNewGame("game-4", createPlayers(3));
        gameEngine.handlePlayerLeave(game, "p2");

        // Cho lượt sang p2 (bằng cách p1 kết thúc lượt) -> Nhưng hệ thống sẽ bỏ qua p2 sang p3
        gameEngine.takeTokens(game, "p1", Map.of(Resource.DIRT, 1, Resource.WATER, 1, Resource.SUNLIGHT, 1));
        assertEquals("p3", game.getState().getCurrentTurnPlayerId(), "Lượt chuyển từ p1 thẳng sang p3 vì p2 đã rời");

        // p2 cố gắng thực hiện hành động -> Phải ném GameException
        assertThrows(GameException.class, () -> {
            gameEngine.takeTokens(game, "p2", Map.of(Resource.DIRT, 1, Resource.WATER, 1, Resource.SUNLIGHT, 1));
        }, "Người đã rời không thể lấy token");
    }

    @Test
    @DisplayName("Case 5: Xoay vòng lượt chơi tự động bỏ qua (skip) người đã rời ván")
    void testTurnSkippingOverLeftPlayer() {
        Game game = gameEngine.createNewGame("game-5", createPlayers(4));
        assertEquals("p1", game.getState().getCurrentTurnPlayerId());

        // p2 rời ván
        gameEngine.handlePlayerLeave(game, "p2");

        // p1 đi xong -> sang p3 (bỏ qua p2)
        gameEngine.takeTokens(game, "p1", Map.of(Resource.DIRT, 1, Resource.WATER, 1, Resource.SUNLIGHT, 1));
        assertEquals("p3", game.getState().getCurrentTurnPlayerId());

        // p3 đi xong -> sang p4
        gameEngine.takeTokens(game, "p3", Map.of(Resource.DIRT, 1, Resource.WATER, 1, Resource.SUNLIGHT, 1));
        assertEquals("p4", game.getState().getCurrentTurnPlayerId());

        // p4 đi xong -> quay về p1 (bỏ qua p2)
        gameEngine.takeTokens(game, "p4", Map.of(Resource.DIRT, 1, Resource.WATER, 1, Resource.SUNLIGHT, 1));
        assertEquals("p1", game.getState().getCurrentTurnPlayerId());
    }
}

