package com.gardenempire.game;

import com.gardenempire.exception.GameException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class GameEngineTest {

    private GameEngine gameEngine;
    private List<Player> players2;
    private List<Player> players3;
    private List<Player> players4;

    @BeforeEach
    void setUp() {
        gameEngine = new GameEngine();
        gameEngine.setRandom(new java.util.Random() {
            @Override
            public int nextInt(int bound) {
                return 0; // Luôn chọn người chơi đầu tiên p1 trong các unit test hiện có
            }
        });

        players2 = List.of(
                Player.builder().id("p1").name("Alice").build(),
                Player.builder().id("p2").name("Bob").build()
        );

        players3 = List.of(
                Player.builder().id("p1").name("Alice").build(),
                Player.builder().id("p2").name("Bob").build(),
                Player.builder().id("p3").name("Charlie").build()
        );

        players4 = List.of(
                Player.builder().id("p1").name("Alice").build(),
                Player.builder().id("p2").name("Bob").build(),
                Player.builder().id("p3").name("Charlie").build(),
                Player.builder().id("p4").name("David").build()
        );
    }

    // ==========================================
    // TEST 1: KHỞI TẠO GAME & THIẾT LẬP BANK
    // ==========================================
    @Test
    @DisplayName("Khởi tạo ván đấu 2 người: Bank 4 token mỗi loại + 5 Wild, 3 Khách, 4 thẻ mỗi Tier")
    void testGameInitialization_2Players() {
        Game game = gameEngine.createNewGame("game_2p", players2);
        GameState state = game.getState();

        assertNotNull(state);
        assertEquals("p1", state.getFirstPlayerId());
        assertEquals("p1", state.getCurrentTurnPlayerId());
        assertFalse(state.isGameOver());
        assertFalse(state.isFinalRound());

        // Kiểm tra Bank cho 2 người
        Map<Resource, Integer> bank = state.getResourceBank();
        assertEquals(4, bank.get(Resource.DIRT));
        assertEquals(4, bank.get(Resource.WATER));
        assertEquals(4, bank.get(Resource.SUNLIGHT));
        assertEquals(4, bank.get(Resource.SEED));
        assertEquals(4, bank.get(Resource.NUTRIENTS));
        assertEquals(5, bank.get(Resource.WILD));

        // Kiểm tra số lượng thẻ mở trên bàn
        assertEquals(4, state.getVisibleTier1Cards().size());
        assertEquals(4, state.getVisibleTier2Cards().size());
        assertEquals(4, state.getVisibleTier3Cards().size());
        assertEquals(3, state.getVisibleVisitors().size()); // 2 players + 1 = 3

        // Kiểm tra số lượng còn lại trong Deck (40-4=36, 30-4=26, 20-4=16)
        assertEquals(36, state.getTier1DeckCount());
        assertEquals(26, state.getTier2DeckCount());
        assertEquals(16, state.getTier3DeckCount());
    }

    @Test
    @DisplayName("Khởi tạo ván đấu 3 người và 4 người: Bank và Khách mở chính xác")
    void testGameInitialization_3And4Players() {
        Game game3 = gameEngine.createNewGame("game_3p", players3);
        assertEquals(5, game3.getState().getResourceBank().get(Resource.DIRT));
        assertEquals(4, game3.getState().getVisibleVisitors().size()); // 3 + 1 = 4

        Game game4 = gameEngine.createNewGame("game_4p", players4);
        assertEquals(7, game4.getState().getResourceBank().get(Resource.DIRT));
        assertEquals(5, game4.getState().getVisibleVisitors().size()); // 4 + 1 = 5
    }

    // ==========================================
    // TEST 2: LẤY TÀI NGUYÊN (TAKE TOKENS)
    // ==========================================
    @Test
    @DisplayName("Lấy 3 token khác loại thành công -> Bank giảm, Player tăng, chuyển lượt")
    void testTakeThreeDistinctTokens_Success() {
        Game game = gameEngine.createNewGame("game_1", players2);

        Map<Resource, Integer> request = Map.of(
                Resource.DIRT, 1,
                Resource.WATER, 1,
                Resource.SUNLIGHT, 1
        );

        gameEngine.takeTokens(game, "p1", request);

        Player p1 = gameEngine.getPlayer(game, "p1");
        assertEquals(1, p1.getTokens().get(Resource.DIRT));
        assertEquals(1, p1.getTokens().get(Resource.WATER));
        assertEquals(1, p1.getTokens().get(Resource.SUNLIGHT));
        assertEquals(3, p1.getTotalTokensCount());

        // Bank giảm
        assertEquals(3, game.getState().getResourceBank().get(Resource.DIRT));
        assertEquals(3, game.getState().getResourceBank().get(Resource.WATER));
        assertEquals(3, game.getState().getResourceBank().get(Resource.SUNLIGHT));

        // Lượt chuyển sang p2
        assertEquals("p2", game.getState().getCurrentTurnPlayerId());
    }

    @Test
    @DisplayName("Lấy 2 token cùng loại khi Bank >= 4 thành công")
    void testTakeTwoSameTokens_Success() {
        Game game = gameEngine.createNewGame("game_1", players2);

        Map<Resource, Integer> request = Map.of(Resource.DIRT, 2);
        gameEngine.takeTokens(game, "p1", request);

        Player p1 = gameEngine.getPlayer(game, "p1");
        assertEquals(2, p1.getTokens().get(Resource.DIRT));
        assertEquals(2, game.getState().getResourceBank().get(Resource.DIRT));
        assertEquals("p2", game.getState().getCurrentTurnPlayerId());
    }

    @Test
    @DisplayName("Lấy 2 token cùng loại khi Bank <= 3 bị từ chối")
    void testTakeTwoSameTokens_FailsWhenBankLessThan4() {
        Game game = gameEngine.createNewGame("game_1", players2);
        game.getState().getResourceBank().put(Resource.DIRT, 3); // Còn 3 token

        Map<Resource, Integer> request = Map.of(Resource.DIRT, 2);
        assertThrows(GameException.class, () -> gameEngine.takeTokens(game, "p1", request));
    }

    @Test
    @DisplayName("Nghiêm cấm lấy trực tiếp token WILD từ Bank")
    void testTakeTokens_CannotTakeWildDirectly() {
        Game game = gameEngine.createNewGame("game_1", players2);
        Map<Resource, Integer> request = Map.of(Resource.WILD, 1, Resource.DIRT, 1, Resource.WATER, 1);
        assertThrows(GameException.class, () -> gameEngine.takeTokens(game, "p1", request));
    }

    @Test
    @DisplayName("Hành động khi chưa đến lượt bị từ chối")
    void testAction_NotCurrentPlayerTurn_ThrowsException() {
        Game game = gameEngine.createNewGame("game_1", players2);
        Map<Resource, Integer> request = Map.of(Resource.DIRT, 1, Resource.WATER, 1, Resource.SEED, 1);
        assertThrows(GameException.class, () -> gameEngine.takeTokens(game, "p2", request));
    }

    // ==========================================
    // TEST 3: TRỒNG CÂY (BUY PLANT CARD)
    // ==========================================
    @Test
    @DisplayName("Trồng cây bằng đúng số token -> Trừ token, trả Bank, cộng điểm và bonus, refill thẻ mới")
    void testBuyPlantCard_WithExactTokens() {
        Game game = gameEngine.createNewGame("game_1", players2);
        Player p1 = gameEngine.getPlayer(game, "p1");

        // Chọn thẻ đầu tiên của Tier 1
        PlantCard card = game.getState().getVisibleTier1Cards().get(0);
        String cardId = card.getId();

        // Cung cấp đầy đủ token cho player
        card.getCost().forEach((res, amount) -> p1.getTokens().put(res, amount));

        int oldDeckCount = game.getState().getTier1DeckCount();

        gameEngine.buyPlantCard(game, "p1", cardId, false);

        // Player sở hữu thẻ
        assertEquals(1, p1.getPurchasedCards().size());
        assertEquals(card.getPrestigePoints(), p1.getPrestigePoints());
        assertEquals(1, p1.getBonuses().getOrDefault(card.getBonusResource(), 0));

        // Thẻ trên bàn được refill từ deck (vẫn đủ 4 thẻ)
        assertEquals(4, game.getState().getVisibleTier1Cards().size());
        assertEquals(oldDeckCount - 1, game.getState().getTier1DeckCount());

        // Lượt chuyển sang p2
        assertEquals("p2", game.getState().getCurrentTurnPlayerId());
    }

    @Test
    @DisplayName("Trồng cây áp dụng Bonus giảm giá vĩnh viễn")
    void testBuyPlantCard_WithBonusDiscount() {
        Game game = gameEngine.createNewGame("game_1", players2);
        Player p1 = gameEngine.getPlayer(game, "p1");

        // Tạo thẻ giả lập chi phí 2 WATER
        PlantCard testCard = new PlantCard("custom_1", "Test Plant", 1, Map.of(Resource.WATER, 2), 1, Resource.DIRT);
        game.getState().getVisibleTier1Cards().set(0, testCard);

        // Player có 1 Bonus WATER và chỉ có 1 token WATER
        p1.getBonuses().put(Resource.WATER, 1);
        p1.getTokens().put(Resource.WATER, 1);

        // Mua thành công nhờ 1 token + 1 bonus = 2 WATER
        gameEngine.buyPlantCard(game, "p1", "custom_1", false);

        assertEquals(1, p1.getPurchasedCards().size());
        assertEquals(0, p1.getTokens().get(Resource.WATER)); // Đã trừ 1 token
        assertEquals(1, p1.getPrestigePoints());
    }

    @Test
    @DisplayName("Trồng cây bằng việc bù Phân bón vàng (WILD)")
    void testBuyPlantCard_UsingWildToken() {
        Game game = gameEngine.createNewGame("game_1", players2);
        Player p1 = gameEngine.getPlayer(game, "p1");

        // Thẻ cần 2 NUTRIENTS
        PlantCard testCard = new PlantCard("custom_2", "Nutrient Tree", 1, Map.of(Resource.NUTRIENTS, 2), 0, Resource.WATER);
        game.getState().getVisibleTier1Cards().set(0, testCard);

        // Player chỉ có 1 NUTRIENTS nhưng có 1 WILD
        p1.getTokens().put(Resource.NUTRIENTS, 1);
        p1.getTokens().put(Resource.WILD, 1);

        gameEngine.buyPlantCard(game, "p1", "custom_2", false);

        assertEquals(1, p1.getPurchasedCards().size());
        assertEquals(0, p1.getTokens().get(Resource.NUTRIENTS));
        assertEquals(0, p1.getTokens().get(Resource.WILD)); // Đã tiêu tốn 1 WILD
    }

    @Test
    @DisplayName("Trồng cây thất bại khi thiếu tài nguyên -> Thẻ bài không bị mất")
    void testBuyPlantCard_InsufficientTokens_ThrowsException() {
        Game game = gameEngine.createNewGame("game_1", players2);
        PlantCard card = game.getState().getVisibleTier1Cards().get(0);

        // Player không có token nào
        assertThrows(GameException.class, () -> gameEngine.buyPlantCard(game, "p1", card.getId(), false));
        assertEquals(4, game.getState().getVisibleTier1Cards().size());
    }

    // ==========================================
    // TEST 4: GIỮ CÂY (RESERVE PLANT CARD)
    // ==========================================
    @Test
    @DisplayName("Giữ thẻ từ bàn cờ -> Nhận 1 Phân bón vàng (WILD), bàn cờ được refill")
    void testReservePlantCard_FromBoard_ReceivesWildToken() {
        Game game = gameEngine.createNewGame("game_1", players2);
        Player p1 = gameEngine.getPlayer(game, "p1");
        PlantCard card = game.getState().getVisibleTier1Cards().get(0);
        String cardId = card.getId();

        gameEngine.reservePlantCard(game, "p1", cardId, null);

        assertEquals(1, p1.getReservedCards().size());
        assertEquals(cardId, p1.getReservedCards().get(0).getId());
        assertEquals(1, p1.getTokens().get(Resource.WILD)); // Nhận 1 WILD
        assertEquals(4, game.getState().getResourceBank().get(Resource.WILD)); // Bank còn 4

        // Bàn cờ được refill đủ 4 thẻ
        assertEquals(4, game.getState().getVisibleTier1Cards().size());
        assertEquals("p2", game.getState().getCurrentTurnPlayerId());
    }

    @Test
    @DisplayName("Giữ tối đa 3 thẻ, lần giữ thứ 4 sẽ bị từ chối")
    void testReservePlantCard_MaxThreeCards() {
        Game game = gameEngine.createNewGame("game_1", players2);
        Player p1 = gameEngine.getPlayer(game, "p1");

        // Giữ 3 thẻ liên tiếp
        p1.getReservedCards().add(new PlantCard("r1", "R1", 1, Map.of(), 0, Resource.DIRT));
        p1.getReservedCards().add(new PlantCard("r2", "R2", 1, Map.of(), 0, Resource.DIRT));
        p1.getReservedCards().add(new PlantCard("r3", "R3", 1, Map.of(), 0, Resource.DIRT));

        PlantCard card = game.getState().getVisibleTier1Cards().get(0);
        assertThrows(GameException.class, () -> gameEngine.reservePlantCard(game, "p1", card.getId(), null));
    }

    @Test
    @DisplayName("Mua thẻ đã giữ trên tay thành công")
    void testBuyReservedPlantCard_Success() {
        Game game = gameEngine.createNewGame("game_1", players2);
        Player p1 = gameEngine.getPlayer(game, "p1");

        PlantCard reservedCard = new PlantCard("res_1", "Secret Tree", 2, Map.of(Resource.DIRT, 2), 2, Resource.SEED);
        p1.getReservedCards().add(reservedCard);
        p1.getTokens().put(Resource.DIRT, 2);

        gameEngine.buyPlantCard(game, "p1", "res_1", true);

        assertEquals(0, p1.getReservedCards().size());
        assertEquals(1, p1.getPurchasedCards().size());
        assertEquals(2, p1.getPrestigePoints());
    }

    // ==========================================
    // TEST 5: EXTRA ACTION 2 — RƯỚC KHÁCH THĂM VƯỜN (VISITORS)
    // ==========================================
    @Test
    @DisplayName("Tự động rước Khách Thăm Vườn khi tích lũy đủ Bonus cây ở cuối lượt")
    void testAutoClaimVisitor_WhenRequirementsMet() {
        Game game = gameEngine.createNewGame("game_1", players2);
        Player p1 = gameEngine.getPlayer(game, "p1");

        // Lấy Visitor đầu tiên trên bàn
        VisitorCard visitor = game.getState().getVisibleVisitors().get(0);

        // Cung cấp đủ bonus cây cho player thỏa mãn yêu cầu của visitor
        visitor.getRequirements().forEach((res, amount) -> p1.getBonuses().put(res, amount));

        // Player thực hiện một action bất kỳ (lấy token) để kết thúc lượt
        gameEngine.takeTokens(game, "p1", Map.of(Resource.DIRT, 1, Resource.WATER, 1, Resource.SEED, 1));

        // Player tự động được rước Visitor và cộng 3 điểm
        assertEquals(1, p1.getVisitors().size());
        assertEquals(visitor.getId(), p1.getVisitors().get(0).getId());
        assertEquals(3, p1.getPrestigePoints());
        assertEquals(2, game.getState().getVisibleVisitors().size()); // Khách trên bàn giảm còn 2
    }

    // ==========================================
    // TEST 6: VÒNG CHUNG KẾT & XÁC ĐỊNH NGƯỜI CHIẾN THẮNG
    // ==========================================
    @Test
    @DisplayName("Đạt 15 điểm kích hoạt Final Round, hoàn tất vòng chơi và xác định người thắng")
    void testFinalRoundAndWinnerDetermination() {
        Game game = gameEngine.createNewGame("game_1", players2);
        Player p1 = gameEngine.getPlayer(game, "p1");
        Player p2 = gameEngine.getPlayer(game, "p2");

        // P1 đạt 14 điểm và mua 1 cây 2 điểm -> 16 điểm
        p1.setPrestigePoints(14);
        PlantCard card1 = new PlantCard("win_card", "Grand Tree", 3, Map.of(Resource.DIRT, 1), 2, Resource.DIRT);
        game.getState().getVisibleTier3Cards().set(0, card1);
        p1.getTokens().put(Resource.DIRT, 1);

        // P1 thực hiện mua cây
        gameEngine.buyPlantCard(game, "p1", "win_card", false);

        assertEquals(16, p1.getPrestigePoints());
        assertTrue(game.getState().isFinalRound(), "Phải kích hoạt Final Round");
        assertFalse(game.getState().isGameOver(), "Chưa kết thúc vì P2 chưa chơi lượt cuối");
        assertEquals("p2", game.getState().getCurrentTurnPlayerId());

        // P2 chơi lượt cuối (lấy token)
        gameEngine.takeTokens(game, "p2", Map.of(Resource.WATER, 1, Resource.SUNLIGHT, 1, Resource.SEED, 1));

        // Ván đấu kết thúc và P1 thắng
        assertTrue(game.getState().isGameOver());
        assertNull(game.getState().getCurrentTurnPlayerId());
        assertEquals("p1", game.getState().getWinnerPlayerId());
    }

    @Test
    @DisplayName("Hòa điểm -> Người sở hữu ít thẻ cây trồng hơn sẽ thắng")
    void testWinnerTiebreaker_FewestCards() {
        Game game = gameEngine.createNewGame("game_1", players2);
        Player p1 = gameEngine.getPlayer(game, "p1");
        Player p2 = gameEngine.getPlayer(game, "p2");

        // P1 có 15 điểm với 5 thẻ cây
        p1.setPrestigePoints(15);
        for (int i = 0; i < 5; i++) {
            p1.getPurchasedCards().add(new PlantCard("p1_" + i, "Plant", 1, Map.of(), 3, Resource.DIRT));
        }

        // P2 có 15 điểm với 4 thẻ cây
        p2.setPrestigePoints(15);
        for (int i = 0; i < 4; i++) {
            p2.getPurchasedCards().add(new PlantCard("p2_" + i, "Plant", 1, Map.of(), 3, Resource.DIRT));
        }

        game.getState().setFinalRound(true);
        game.getState().setCurrentTurnPlayerId("p2"); // P2 đang đến lượt cuối

        // P2 chơi lượt cuối
        gameEngine.takeTokens(game, "p2", Map.of(Resource.DIRT, 1, Resource.WATER, 1, Resource.SEED, 1));

        assertTrue(game.getState().isGameOver());
        assertEquals("p2", game.getState().getWinnerPlayerId(), "P2 ít thẻ hơn nên thắng tiebreaker");
    }

    // ==========================================
    // TEST 7: EXTRA ACTION 1 — TRẢ LẠI TOKEN DƯ (KHI VÀ CHỈ KHI > 10 TOKEN)
    // ==========================================
    @Test
    @DisplayName("Lấy token khiến tổng số > 10 -> Giữ nguyên lượt, chỉ chuyển lượt sau khi trả đủ token")
    void testTakeTokens_Exceeds10Tokens_RequiresReturnTokens() {
        Game game = gameEngine.createNewGame("game_1", players2);
        Player p1 = gameEngine.getPlayer(game, "p1");

        // P1 đang có sẵn 8 token
        p1.getTokens().put(Resource.DIRT, 4);
        p1.getTokens().put(Resource.WATER, 4);

        // P1 lấy thêm 3 token (SEED, SUNLIGHT, NUTRIENTS) -> Tổng 11 token (> 10)
        gameEngine.takeTokens(game, "p1", Map.of(Resource.SEED, 1, Resource.SUNLIGHT, 1, Resource.NUTRIENTS, 1));

        assertEquals(11, p1.getTotalTokensCount());
        // Lượt CHƯA chuyển sang p2 vì p1 đang bị dư token
        assertEquals("p1", game.getState().getCurrentTurnPlayerId());

        // P1 thực hiện EXTRA ACTION 1: Trả lại 1 token DIRT
        gameEngine.returnTokens(game, "p1", Map.of(Resource.DIRT, 1));

        // Tổng token còn 10 -> Lượt chơi chính thức hoàn tất và chuyển sang p2
        assertEquals(10, p1.getTotalTokensCount());
        assertEquals("p2", game.getState().getCurrentTurnPlayerId());
    }

    @Test
    @DisplayName("Trả lại token khi tổng số <= 10 bị từ chối vì không thỏa điều kiện")
    void testReturnTokens_FailsWhenNotExceeding10() {
        Game game = gameEngine.createNewGame("game_1", players2);
        Player p1 = gameEngine.getPlayer(game, "p1");

        p1.getTokens().put(Resource.DIRT, 3); // Chỉ có 3 token (<= 10)
        assertThrows(GameException.class, () -> gameEngine.returnTokens(game, "p1", Map.of(Resource.DIRT, 1)));
    }

    // ==========================================
    // TEST 8: HỆ THỐNG GHI NHẬT KÝ VÁN ĐẤU (GAME ACTION LOGS)
    // ==========================================
    @Test
    @DisplayName("Kiểm tra toàn bộ luồng ghi log tự động cho các hành động trong trận đấu")
    void testGameActionLogs_FullWorkflow() {
        Game game = gameEngine.createNewGame("game_log_test", players2);
        GameState state = game.getState();

        // 1. Log bắt đầu ván đấu
        assertFalse(state.getActionLogs().isEmpty());
        GameLogEntry startLog = state.getActionLogs().get(0);
        assertEquals("GAME_START", startLog.getActionType());
        assertTrue(startLog.getMessage().contains("Ván đấu bắt đầu"));

        // 2. Log lấy tài nguyên 3 loại khác nhau
        gameEngine.takeTokens(game, "p1", Map.of(Resource.DIRT, 1, Resource.WATER, 1, Resource.SUNLIGHT, 1));
        GameLogEntry takeLog = state.getActionLogs().get(state.getActionLogs().size() - 1);
        assertEquals("TAKE_TOKENS_DISTINCT", takeLog.getActionType());
        assertEquals("p1", takeLog.getPlayerId());
        assertTrue(takeLog.getMessage().contains("Alice đã lấy"));

        // 3. Log lấy tài nguyên 2 loại cùng loại (p2)
        gameEngine.takeTokens(game, "p2", Map.of(Resource.SEED, 2));
        GameLogEntry doubleLog = state.getActionLogs().get(state.getActionLogs().size() - 1);
        assertEquals("TAKE_TOKENS_DOUBLE", doubleLog.getActionType());
        assertEquals("p2", doubleLog.getPlayerId());
        assertTrue(doubleLog.getMessage().contains("Bob đã lấy 2"));

        // 4. Log giữ thẻ bài và nhận xu Wild (p1)
        PlantCard cardToReserve = state.getVisibleTier1Cards().get(0);
        String cardName = cardToReserve.getName();
        gameEngine.reservePlantCard(game, "p1", cardToReserve.getId(), null);
        GameLogEntry reserveLog = state.getActionLogs().get(state.getActionLogs().size() - 1);
        assertEquals("RESERVE_CARD_BOARD", reserveLog.getActionType());
        assertTrue(reserveLog.getMessage().contains(cardName));
        assertTrue(reserveLog.getMessage().contains("+1 🌾 Phân Bón"));

        // 5. Log mua thẻ bài đã giữ sẵn trên tay (p1)
        Player p1 = gameEngine.getPlayer(game, "p1");
        // Giả lập p2 thực hiện action để đến lượt p1
        gameEngine.takeTokens(game, "p2", Map.of(Resource.WATER, 1, Resource.SUNLIGHT, 1, Resource.NUTRIENTS, 1));
        
        // Cho p1 đủ tiền mua thẻ vừa giữ
        cardToReserve.getCost().forEach((res, amt) -> p1.getTokens().put(res, amt));
        gameEngine.buyPlantCard(game, "p1", cardToReserve.getId(), true);
        GameLogEntry buyLog = state.getActionLogs().get(state.getActionLogs().size() - 1);
        assertEquals("BUY_CARD_RESERVED", buyLog.getActionType());
        assertTrue(buyLog.getMessage().contains("đã trồng thẻ giữ sẵn"));
        assertTrue(buyLog.getMessage().contains(cardName));
    }
}
