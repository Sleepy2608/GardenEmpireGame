package com.gardenempire.game;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("GameEngine — Kiểm thử tính năng Giới Hạn Thời Gian Lượt Đi & Quản Lý AFK (Phase 16 - Giai đoạn 1)")
class GameEngineTurnTimerTest {

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
    @DisplayName("Case 1: Khởi tạo ván đấu với cấu hình thời lượng lượt (60s, 120s, 300s)")
    void testCreateNewGameWithCustomTurnDuration() {
        // Mặc định 60s
        Game gameDefault = gameEngine.createNewGame("game-default", createPlayers(2));
        assertEquals(60, gameDefault.getState().getTurnDurationSeconds());
        assertTrue(gameDefault.getState().getTurnStartTime() > 0);

        // 120s (2 Phút)
        Game game120 = gameEngine.createNewGame("game-120", createPlayers(2), 120);
        assertEquals(120, game120.getState().getTurnDurationSeconds());
        assertTrue(game120.getState().getTurnStartTime() > 0);

        // 300s (5 Phút)
        Game game300 = gameEngine.createNewGame("game-300", createPlayers(2), 300);
        assertEquals(300, game300.getState().getTurnDurationSeconds());
        assertTrue(game300.getState().getTurnStartTime() > 0);

        // Giá trị bất thường -> Fallback về 60s
        Game gameInvalid = gameEngine.createNewGame("game-invalid", createPlayers(2), 999);
        assertEquals(60, gameInvalid.getState().getTurnDurationSeconds());
    }

    @Test
    @DisplayName("Case 2: AFK lần 1 (Strike 1) — Tự động thu thập 1-3 token hợp lệ và chuyển lượt")
    void testAutoHarvestRandomTokensNormal() {
        Game game = gameEngine.createNewGame("game-1", createPlayers(3));
        assertEquals("p1", game.getState().getCurrentTurnPlayerId());

        Player p1 = gameEngine.getPlayer(game, "p1");
        assertEquals(0, p1.getTotalTokensCount());
        assertEquals(0, p1.getConsecutiveAfkCount());

        // Kích hoạt timeout lần 1 cho p1
        gameEngine.handleTurnTimeout(game, "p1");

        assertEquals(1, p1.getConsecutiveAfkCount(), "Strike 1: consecutiveAfkCount phải là 1");
        assertEquals(1, p1.getTotalAfkCount(), "totalAfkCount phải là 1");
        assertTrue(p1.getTotalTokensCount() > 0, "p1 phải nhận được token ngẫu nhiên");
        assertTrue(p1.getTotalTokensCount() <= 3, "Số token nhận được tối đa là 3");
        assertEquals(0, p1.getTokens().getOrDefault(Resource.WILD, 0), "Tuyệt đối KHÔNG cấp Phân bón vàng WILD khi AFK");

        // Lượt đi phải được chuyển sang p2
        assertEquals("p2", game.getState().getCurrentTurnPlayerId(), "Lượt đi phải được chuyển sang người tiếp theo");
        assertFalse(p1.isHasLeft(), "p1 chưa bị truất quyền");

        // Kiểm tra log ghi nhận
        boolean hasWarningLog = game.getState().getActionLogs().stream()
                .anyMatch(log -> "AFK_WARNING".equals(log.getActionType()) && "p1".equals(log.getPlayerId()));
        assertTrue(hasWarningLog, "Phải ghi nhận log cảnh báo AFK_WARNING cho p1");
    }

    @Test
    @DisplayName("Case 3: AFK khi người chơi đã có đủ 10 token — Không cấp thêm token, chuyển lượt an toàn")
    void testAutoHarvestRandomTokensWhenInventoryHas10Tokens() {
        Game game = gameEngine.createNewGame("game-1", createPlayers(2));
        Player p1 = gameEngine.getPlayer(game, "p1");

        // Gán sẵn 10 token cho p1
        p1.getTokens().put(Resource.DIRT, 5);
        p1.getTokens().put(Resource.WATER, 5);
        assertEquals(10, p1.getTotalTokensCount());

        // Hết giờ
        gameEngine.handleTurnTimeout(game, "p1");

        assertEquals(1, p1.getConsecutiveAfkCount());
        assertEquals(10, p1.getTotalTokensCount(), "Tổng token vẫn giữ nguyên là 10, không được vượt quá 10");
        assertEquals("p2", game.getState().getCurrentTurnPlayerId(), "Vẫn chuyển lượt bình thường sang p2");

        boolean hasSkipLog = game.getState().getActionLogs().stream()
                .anyMatch(log -> "AFK_AUTO_SKIP".equals(log.getActionType()) && "p1".equals(log.getPlayerId()));
        assertTrue(hasSkipLog, "Phải ghi nhận log AFK_AUTO_SKIP do đã đầy 10 token");
    }

    @Test
    @DisplayName("Case 4: AFK khi người chơi có 8 token — Chỉ nhận tối đa 2 token để không vượt quá trần 10")
    void testAutoHarvestRandomTokensWhenInventoryHas8Tokens() {
        Game game = gameEngine.createNewGame("game-1", createPlayers(2));
        Player p1 = gameEngine.getPlayer(game, "p1");

        // Gán 8 token cho p1
        p1.getTokens().put(Resource.SUNLIGHT, 8);
        assertEquals(8, p1.getTotalTokensCount());

        // Hết giờ
        gameEngine.handleTurnTimeout(game, "p1");

        assertTrue(p1.getTotalTokensCount() <= 10, "Tổng token sau khi AFK không được vượt quá 10");
        assertTrue(p1.getTotalTokensCount() >= 8, "Tổng token ít nhất là 8");
        assertEquals("p2", game.getState().getCurrentTurnPlayerId());
    }

    @Test
    @DisplayName("Case 5: Đi nước cờ hợp lệ sẽ reset consecutiveAfkCount về 0")
    void testValidActionResetsConsecutiveAfkCount() {
        Game game = gameEngine.createNewGame("game-1", createPlayers(2));
        Player p1 = gameEngine.getPlayer(game, "p1");

        // Cho p1 bị 1 gậy AFK
        p1.setConsecutiveAfkCount(1);
        assertEquals(1, p1.getConsecutiveAfkCount());

        // p1 thực hiện lấy 3 token hợp lệ
        gameEngine.takeTokens(game, "p1", Map.of(
                Resource.DIRT, 1,
                Resource.WATER, 1,
                Resource.SUNLIGHT, 1
        ));

        assertEquals(0, p1.getConsecutiveAfkCount(), "Hành động hợp lệ phải reset consecutiveAfkCount về 0");
    }

    @Test
    @DisplayName("Case 6: Bị 2 lần AFK liên tiếp (Strike 2) trong bàn 2 người -> Truất quyền & Xử thắng mặc định (Walkover)")
    void testTwoStrikesAfkTriggersPlayerLeaveAndWalkoverIn2PlayerGame() {
        Game game = gameEngine.createNewGame("game-1", createPlayers(2));
        assertEquals("p1", game.getState().getCurrentTurnPlayerId());

        Player p1 = gameEngine.getPlayer(game, "p1");
        Player p2 = gameEngine.getPlayer(game, "p2");

        // Lượt 1: p1 bị AFK lần 1
        gameEngine.handleTurnTimeout(game, "p1");
        assertEquals(1, p1.getConsecutiveAfkCount());
        assertEquals("p2", game.getState().getCurrentTurnPlayerId());

        // p2 đi nước cờ hợp lệ
        gameEngine.takeTokens(game, "p2", Map.of(Resource.DIRT, 1, Resource.WATER, 1, Resource.SUNLIGHT, 1));
        assertEquals("p1", game.getState().getCurrentTurnPlayerId());

        // Lượt 2: p1 tiếp tục AFK lần 2 liên tiếp (Strike 2)
        gameEngine.handleTurnTimeout(game, "p1");

        assertEquals(2, p1.getConsecutiveAfkCount());
        assertTrue(p1.isHasLeft(), "p1 phải bị đánh dấu hasLeft = true");

        // Vì chỉ còn 1 người duy nhất (p2) -> Chiến thắng mặc định
        assertTrue(game.getState().isGameOver(), "Ván đấu phải kết thúc");
        assertEquals("p2", game.getState().getWinnerPlayerId(), "p2 phải là Quán Quân chiến thắng mặc định");

        boolean hasKickLog = game.getState().getActionLogs().stream()
                .anyMatch(log -> "PLAYER_KICKED_AFK".equals(log.getActionType()) && "p1".equals(log.getPlayerId()));
        assertTrue(hasKickLog, "Phải ghi nhận ActionLog PLAYER_KICKED_AFK");
    }

    @Test
    @DisplayName("Case 7: Bị 2 lần AFK liên tiếp trong bàn 3 người -> Truất quyền và chuyển lượt cho người còn lại")
    void testTwoStrikesAfkIn3PlayerGameAdvancesTurn() {
        Game game = gameEngine.createNewGame("game-1", createPlayers(3));
        assertEquals("p1", game.getState().getCurrentTurnPlayerId());

        Player p1 = gameEngine.getPlayer(game, "p1");

        // Lượt 1: p1 AFK (Strike 1)
        gameEngine.handleTurnTimeout(game, "p1");
        assertEquals("p2", game.getState().getCurrentTurnPlayerId());

        // p2 đi
        gameEngine.takeTokens(game, "p2", Map.of(Resource.DIRT, 1, Resource.WATER, 1, Resource.SUNLIGHT, 1));
        assertEquals("p3", game.getState().getCurrentTurnPlayerId());

        // p3 đi
        gameEngine.takeTokens(game, "p3", Map.of(Resource.DIRT, 1, Resource.WATER, 1, Resource.SUNLIGHT, 1));
        assertEquals("p1", game.getState().getCurrentTurnPlayerId());

        // Lượt 2: p1 lại AFK lần 2 (Strike 2)
        gameEngine.handleTurnTimeout(game, "p1");

        assertTrue(p1.isHasLeft(), "p1 bị truất quyền");
        assertFalse(game.getState().isGameOver(), "Ván đấu chưa kết thúc vì vẫn còn p2 và p3");
        assertEquals("p2", game.getState().getCurrentTurnPlayerId(), "Lượt đi phải được chuyển cho p2");
    }

    @Test
    @DisplayName("Case 8: Timeout bị bỏ qua nếu không phải lượt của người chơi hoặc người chơi đã rời ván")
    void testTurnTimeoutIgnoredIfNotPlayersTurnOrAlreadyLeft() {
        Game game = gameEngine.createNewGame("game-1", createPlayers(2));
        assertEquals("p1", game.getState().getCurrentTurnPlayerId());

        Player p2 = gameEngine.getPlayer(game, "p2");

        // Gọi timeout cho p2 trong khi đang tới lượt p1
        gameEngine.handleTurnTimeout(game, "p2");
        assertEquals(0, p2.getConsecutiveAfkCount(), "Không được tăng AFK count của p2");
        assertEquals("p1", game.getState().getCurrentTurnPlayerId(), "Lượt đi vẫn là của p1");
    }
}
