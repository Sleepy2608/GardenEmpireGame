package com.gardenempire.service;

import com.gardenempire.game.Game;
import com.gardenempire.game.GameState;
import com.gardenempire.game.Player;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@DisplayName("GameService — Kiểm thử bộ lập lịch thời gian lượt đi & sự kiện AFK Timeout (Phase 16 - Giai đoạn 2)")
class GameServiceTurnTimerTest {

    @Autowired
    private GameService gameService;

    private static final String TEST_GAME_ID = "game-timer-test-suite";

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

    @BeforeEach
    void setUp() {
        gameService.removeGame(TEST_GAME_ID);
    }

    @AfterEach
    void tearDown() {
        gameService.removeGame(TEST_GAME_ID);
    }

    @Test
    @DisplayName("Khởi tạo trận đấu lưu đúng turnDurationSeconds (120s) và kích hoạt Turn Timer")
    void testInitGameWithCustomTurnDuration() {
        gameService.initGame(TEST_GAME_ID, createPlayers(2), 120);

        Game game = gameService.getGame(TEST_GAME_ID);
        assertNotNull(game);
        assertEquals(120, game.getState().getTurnDurationSeconds());
        assertTrue(game.getState().getTurnStartTime() > 0);
        assertNotNull(game.getState().getCurrentTurnPlayerId());
    }

    @Test
    @DisplayName("Hết giờ lần 1 kích hoạt sự kiện onAfkWarning và cập nhật GameState")
    void testHandleTurnTimeoutStrike1TriggersWarning() {
        gameService.initGame(TEST_GAME_ID, createPlayers(2), 60);
        Game game = gameService.getGame(TEST_GAME_ID);
        String currentTurn = game.getState().getCurrentTurnPlayerId();

        AtomicBoolean warningFired = new AtomicBoolean(false);
        AtomicInteger reportedStrike = new AtomicInteger(0);

        gameService.setEventListener(new GameService.GameEventListener() {
            @Override
            public void onGameStateUpdated(String gameId, GameState state) {
                // GameState updated
            }

            @Override
            public void onAfkWarning(String gameId, String playerId, int strike, int maxStrikes, String message) {
                if (playerId.equals(currentTurn)) {
                    warningFired.set(true);
                    reportedStrike.set(strike);
                }
            }

            @Override
            public void onPlayerKickedAfk(String gameId, Player player, GameState state) {
                // Not in strike 1
            }
        });

        // Kích hoạt timeout cho người đang tới lượt
        gameService.handleTurnTimeout(TEST_GAME_ID, currentTurn);

        assertTrue(warningFired.get(), "Phải kích hoạt onAfkWarning cho người chơi AFK");
        assertEquals(1, reportedStrike.get(), "Phải báo cáo Strike 1");
    }

    @Test
    @DisplayName("Hết giờ lần 2 liên tiếp kích hoạt sự kiện onPlayerKickedAfk và truất quyền")
    void testHandleTurnTimeoutStrike2TriggersKick() {
        gameService.initGame(TEST_GAME_ID, createPlayers(2), 60);
        Game game = gameService.getGame(TEST_GAME_ID);
        String p1 = game.getState().getCurrentTurnPlayerId();

        AtomicBoolean kickFired = new AtomicBoolean(false);

        gameService.setEventListener(new GameService.GameEventListener() {
            @Override
            public void onGameStateUpdated(String gameId, GameState state) {}

            @Override
            public void onAfkWarning(String gameId, String playerId, int strike, int maxStrikes, String message) {}

            @Override
            public void onPlayerKickedAfk(String gameId, Player player, GameState state) {
                if (player != null && player.getId().equals(p1)) {
                    kickFired.set(true);
                }
            }
        });

        // Timeout lần 1: consecutiveAfkCount = 1
        gameService.handleTurnTimeout(TEST_GAME_ID, p1);

        // Chuyển lượt trở lại cho p1 và ép tiếp tục timeout
        game.getState().setCurrentTurnPlayerId(p1);

        // Timeout lần 2: consecutiveAfkCount = 2 -> Truất quyền
        gameService.handleTurnTimeout(TEST_GAME_ID, p1);

        assertTrue(kickFired.get(), "Phải kích hoạt onPlayerKickedAfk khi bị 2 gậy AFK liên tiếp");
        assertTrue(game.getState().isGameOver(), "Bàn 2 người có 1 người bị kick -> Game kết thúc (Walkover)");
    }
}
