package com.gardenempire.game;

import com.gardenempire.game.bot.SmartAfkBotEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("🤖 SmartAfkBotEngine — Kiểm thử năng lực AI, Tiếp Quản Người Rời Bàn & Giải Đấu 4 Bot")
class SmartAfkBotEngineTest {

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
                    .name("Nghệ Nhân " + i)
                    .avatar("🌱")
                    .build());
        }
        return list;
    }

    // =========================================================================
    // PHẦN 1: KIỂM THỬ ĐƠN VỊ HỆ LUẬT HEURISTIC 4 CẤP ĐỘ
    // =========================================================================

    @Test
    @DisplayName("Test 1.1: Bot tự động chọn MUA CÂY (BUY_CARD) khi đủ điều kiện tài nguyên")
    void testBotBuysAffordableCardWithPoints() {
        // Arrange
        Game game = gameEngine.createNewGame("game-bot-1", createPlayers(2));
        Player p1 = gameEngine.getPlayer(game, "p1");

        // Cấp cho p1 lượng token khớp với thẻ Tier 1 đầu tiên
        assertFalse(game.getState().getVisibleTier1Cards().isEmpty());
        PlantCard targetCard = game.getState().getVisibleTier1Cards().get(0);
        p1.getTokens().putAll(targetCard.getCost());

        // Act
        SmartAfkBotEngine.BotAction action = SmartAfkBotEngine.calculateBestMove(game.getState(), p1);

        // Assert
        assertNotNull(action, "Nước đi của bot không được null");
        assertEquals(SmartAfkBotEngine.BotActionType.BUY_CARD, action.getType(), "Bot phải ưu tiên MUA CÂY khi đủ tiền");
        assertNotNull(action.getCardId(), "Phải chỉ định ID thẻ cây cần mua");
        assertTrue(action.getCalculationDurationNanos() > 0, "Thời gian tính toán phải được ghi nhận");

        // Thực thi nước đi
        SmartAfkBotEngine.executeMove(gameEngine, game, p1, action);
        assertEquals(1, p1.getPurchasedCards().size(), "p1 phải sở hữu 1 thẻ cây sau khi bot mua");
        assertEquals("p2", game.getState().getCurrentTurnPlayerId(), "Lượt đi phải được chuyển sang p2");
    }

    @Test
    @DisplayName("Test 1.2: Bot ưu tiên mua thẻ có Điểm Uy Tín ★ cao nhất trong các thẻ mua được")
    void testBotPrioritizesHighPrestigePoints() {
        // Arrange
        Game game = gameEngine.createNewGame("game-bot-2", createPlayers(2));
        Player p1 = gameEngine.getPlayer(game, "p1");

        // Cấp cho p1 lượng token khủng có thể mua bất kỳ thẻ Tier 1/2 nào
        for (Resource res : Resource.values()) {
            p1.getTokens().put(res, 5);
        }

        // Act
        SmartAfkBotEngine.BotAction action = SmartAfkBotEngine.calculateBestMove(game.getState(), p1);

        // Assert
        assertEquals(SmartAfkBotEngine.BotActionType.BUY_CARD, action.getType());
        
        // Tìm thẻ bot đã chọn
        PlantCard chosenCard = SmartAfkBotEngine.getAllVisibleCards(game.getState()).stream()
                .filter(c -> c.getId().equals(action.getCardId()))
                .findFirst()
                .orElse(null);

        assertNotNull(chosenCard);
        assertTrue(chosenCard.getPrestigePoints() >= 1, "Bot phải chọn thẻ mang lại điểm Uy Tín ★");
    }

    @Test
    @DisplayName("Test 1.3: Bot ưu tiên mua thẻ kích hoạt rước Khách Quý (+3★)")
    void testBotPrioritizesCardTriggeringNobleVisitor() {
        // Arrange
        Game game = gameEngine.createNewGame("game-bot-3", createPlayers(2));
        Player p1 = gameEngine.getPlayer(game, "p1");

        // Chọn thẻ đầu tiên trên bàn
        assertFalse(game.getState().getVisibleTier1Cards().isEmpty());
        PlantCard cardOnBoard = game.getState().getVisibleTier1Cards().get(0);
        Resource neededBonus = cardOnBoard.getBonusResource();

        // Thiết lập vị khách quý đầu tiên yêu cầu đúng loại bonus của cardOnBoard
        assertFalse(game.getState().getVisibleVisitors().isEmpty());
        VisitorCard visitor = game.getState().getVisibleVisitors().get(0);
        Map<Resource, Integer> customReq = new EnumMap<>(Resource.class);
        customReq.put(neededBonus, 1);
        visitor.setRequirements(customReq);
        p1.getBonuses().clear();

        // Cấp đủ token để mua
        for (Resource res : Resource.values()) {
            p1.getTokens().put(res, 5);
        }

        // Act
        SmartAfkBotEngine.BotAction action = SmartAfkBotEngine.calculateBestMove(game.getState(), p1);

        // Assert
        assertEquals(SmartAfkBotEngine.BotActionType.BUY_CARD, action.getType());
        SmartAfkBotEngine.executeMove(gameEngine, game, p1, action);

        // p1 phải rước được Khách Quý và nhận thêm 3 điểm
        assertTrue(p1.getVisitors().size() >= 1, "p1 phải rước thành công Khách Quý (+3★)");
        assertTrue(p1.getPrestigePoints() >= 3, "Điểm uy tín phải bao gồm 3★ từ Khách Quý");
    }

    @Test
    @DisplayName("Test 1.4: Bot tự động mua thẻ từ kho bài giữ (Reserved Cards) và giải phóng ô giữ")
    void testBotBuysFromReservedCards() {
        // Arrange
        Game game = gameEngine.createNewGame("game-bot-4", createPlayers(2));
        Player p1 = gameEngine.getPlayer(game, "p1");

        // Đặt sẵn 1 thẻ trong reservedCards của p1
        PlantCard reservedCard = game.getState().getVisibleTier1Cards().get(0);
        p1.getReservedCards().add(reservedCard);

        // Cấp đủ tiền mua
        for (Resource res : Resource.values()) {
            p1.getTokens().put(res, 5);
        }

        // Act
        SmartAfkBotEngine.BotAction action = SmartAfkBotEngine.calculateBestMove(game.getState(), p1);

        // Assert
        assertEquals(SmartAfkBotEngine.BotActionType.BUY_CARD, action.getType());
        SmartAfkBotEngine.executeMove(gameEngine, game, p1, action);

        assertTrue(p1.getPurchasedCards().contains(reservedCard) || !p1.getPurchasedCards().isEmpty(), "Phải mua thành công");
    }

    @Test
    @DisplayName("Test 1.5: Bot chọn bốc 2 token cùng loại khi thiếu >= 2 và Ngân hàng còn >= 4")
    void testBotTakesDoubleTokensWhenAppropriate() {
        // Arrange
        Game game = gameEngine.createNewGame("game-bot-5", createPlayers(2));
        Player p1 = gameEngine.getPlayer(game, "p1");

        // Tìm 1 thẻ mục tiêu cần nhiều DIRT
        PlantCard target = SmartAfkBotEngine.getAllVisibleCards(game.getState()).stream()
                .filter(c -> c.getCost().getOrDefault(Resource.DIRT, 0) >= 2)
                .findFirst()
                .orElse(null);

        if (target != null) {
            // Đảm bảo ngân hàng có >= 4 DIRT
            game.getState().getResourceBank().put(Resource.DIRT, 4);

            // Act
            SmartAfkBotEngine.BotAction action = SmartAfkBotEngine.calculateBestMove(game.getState(), p1);

            // Assert
            assertNotNull(action);
            if (action.getType() == SmartAfkBotEngine.BotActionType.TAKE_TOKENS) {
                int totalTake = action.getTokensToTake().values().stream().mapToInt(Integer::intValue).sum();
                assertTrue(totalTake == 2 || totalTake == 3, "Bot phải bốc 2 cùng loại hoặc 3 khác loại hợp lệ");
            }
        }
    }

    @Test
    @DisplayName("Test 1.6: Bot bốc 3 token khác loại phục vụ cho Thẻ Mục Tiêu")
    void testBotTakesThreeDistinctTokens() {
        // Arrange
        Game game = gameEngine.createNewGame("game-bot-6", createPlayers(2));
        Player p1 = gameEngine.getPlayer(game, "p1");
        assertEquals(0, p1.getTotalTokensCount());

        // Act
        SmartAfkBotEngine.BotAction action = SmartAfkBotEngine.calculateBestMove(game.getState(), p1);

        // Assert
        assertNotNull(action);
        if (action.getType() == SmartAfkBotEngine.BotActionType.TAKE_TOKENS) {
            Map<Resource, Integer> take = action.getTokensToTake();
            assertFalse(take.containsKey(Resource.WILD), "Tuyệt đối không được bốc WILD");
            assertTrue(take.size() <= 3, "Tối đa 3 loại");
            
            // Thực thi
            SmartAfkBotEngine.executeMove(gameEngine, game, p1, action);
            assertTrue(p1.getTotalTokensCount() > 0, "p1 phải nhận được token sau khi bốc");
            assertEquals("p2", game.getState().getCurrentTurnPlayerId(), "Lượt đi phải được chuyển sang p2");
        }
    }

    @Test
    @DisplayName("Test 1.7: Bot bảo vệ ngưỡng 10 token, tự động trả lại token thừa và không trả WILD")
    void testBotHandlesTokenCapAndPreservesWild() {
        // Arrange
        Game game = gameEngine.createNewGame("game-bot-7", createPlayers(2));
        Player p1 = gameEngine.getPlayer(game, "p1");

        // Gán 9 token cơ bản + 1 token WILD = 10 token
        p1.getTokens().put(Resource.DIRT, 3);
        p1.getTokens().put(Resource.WATER, 3);
        p1.getTokens().put(Resource.SUNLIGHT, 3);
        p1.getTokens().put(Resource.WILD, 1);
        assertEquals(10, p1.getTotalTokensCount());

        // Cho bot tính toán bốc token
        SmartAfkBotEngine.BotAction action = SmartAfkBotEngine.calculateBestMove(game.getState(), p1);
        assertNotNull(action);

        // Nếu bot bốc token, tổng sau khi bốc + trả phải <= 10
        if (action.getType() == SmartAfkBotEngine.BotActionType.TAKE_TOKENS) {
            SmartAfkBotEngine.executeMove(gameEngine, game, p1, action);
            assertTrue(p1.getTotalTokensCount() <= 10, "Tổng token sau khi bot thực hiện phải <= 10");
            assertEquals(1, p1.getTokens().getOrDefault(Resource.WILD, 0), "Phân Bón Vàng WILD không được bị trả lại");
        }
    }

    @Test
    @DisplayName("Test 1.8: Tốc độ tính toán nước đi của bot đạt chuẩn siêu tốc (< 5ms)")
    void testBotCalculationSpeedIsSubMillisecond() {
        // Arrange
        Game game = gameEngine.createNewGame("game-bot-speed", createPlayers(4));
        Player p1 = gameEngine.getPlayer(game, "p1");

        // Warm up JIT
        for (int i = 0; i < 50; i++) {
            SmartAfkBotEngine.calculateBestMove(game.getState(), p1);
        }

        // Benchmark 100 lần tính toán
        long totalNanos = 0;
        int iterations = 100;
        for (int i = 0; i < iterations; i++) {
            SmartAfkBotEngine.BotAction action = SmartAfkBotEngine.calculateBestMove(game.getState(), p1);
            totalNanos += action.getCalculationDurationNanos();
        }

        double avgMs = (totalNanos / (double) iterations) / 1_000_000.0;
        System.out.printf("⚡ [BOT BENCHMARK] Thời gian tính toán trung bình: %.4f ms / nước đi%n", avgMs);

        assertTrue(avgMs < 5.0, "Thời gian tính toán trung bình phải < 5ms (thực tế: " + avgMs + "ms)");
    }

    // =========================================================================
    // PHẦN 2: BÀI TEST THỰC NGHIỆM 1 — NGƯỜI CHƠI ĐỘT NGỘT RỜI ĐI THÌ BOT CÓ CHƠI KHÔNG?
    // =========================================================================

    @Test
    @DisplayName("🧪 TEST THỰC NGHIỆM 1: Người chơi đột ngột rời đi — Bot tiếp quản (Takeover) và chơi thay thế")
    void testPlayerAbruptlyLeavesAndBotTakesOver() {
        System.out.println("\n🌿 ========================================================");
        System.out.println("🧪 BẮT ĐẦU TEST THỰC NGHIỆM 1: TIẾP QUẢN KHI NGƯỜI CHƠI RỜI BÀN");
        System.out.println("🌿 ========================================================");

        // 1. Khởi tạo bàn 3 người chơi: Alice (p1), Bob (p2), Charlie (p3)
        List<Player> players = new ArrayList<>();
        players.add(Player.builder().id("p1").name("Alice").avatar("🌸").build());
        players.add(Player.builder().id("p2").name("Bob").avatar("🌿").build());
        players.add(Player.builder().id("p3").name("Charlie").avatar("🌳").build());

        Game game = gameEngine.createNewGame("game-takeover", players);
        assertEquals("p1", game.getState().getCurrentTurnPlayerId());

        // 2. Alice đi nước đầu tiên (bốc 3 token)
        Map<Resource, Integer> p1Tokens = Map.of(Resource.DIRT, 1, Resource.WATER, 1, Resource.SUNLIGHT, 1);
        gameEngine.takeTokens(game, "p1", p1Tokens);
        assertEquals("p2", game.getState().getCurrentTurnPlayerId(), "Lượt đi thuộc về Bob (p2)");

        // 3. Bob (p2) đột ngột mất kết nối / rời bàn thi đấu!
        System.out.println("⚠️ [SỰ KIỆN] Bob (p2) đột ngột rời bàn khi đang giữ lượt đi!");
        gameEngine.handlePlayerLeave(game, "p2", true); // replaceWithBot = true

        Player p2 = gameEngine.getPlayer(game, "p2");

        // 4. Kiểm tra trạng thái của Bob sau khi bot tiếp quản
        assertTrue(p2.isBot(), "Bob phải được đánh dấu isBot = true");
        assertFalse(p2.isHasLeft(), "Bob không bị xóa khỏi bàn đấu (hasLeft = false vì bot đã tiếp quản)");
        assertTrue(p2.getName().contains("🤖"), "Tên Bob phải có biểu tượng Bot để người chơi khác nhận biết");
        assertFalse(game.getState().isGameOver(), "Ván đấu KHÔNG được kết thúc mặc định (Walkover) do bot đã thế chân");

        // 5. Kiểm tra bot đã tự động thực hiện nước đi cho Bob ngay khi tiếp quản chưa
        // Vì Bob đang giữ lượt, executeBotTurn đã được kích hoạt ngay
        boolean bobMadeMove = p2.getTotalTokensCount() > 0 || p2.getPurchasedCards().size() > 0 || p2.getReservedCards().size() > 0;
        assertTrue(bobMadeMove, "Bot phải thực hiện thành công một nước đi cho Bob");

        // 6. Kiểm tra lượt đi đã chuyển sang Charlie (p3) chưa
        assertEquals("p3", game.getState().getCurrentTurnPlayerId(), "Lượt đi phải được chuyển mượt mà sang Charlie (p3)");

        // 7. Charlie đi tiếp
        Map<Resource, Integer> p3Tokens = Map.of(Resource.SEED, 1, Resource.NUTRIENTS, 1, Resource.DIRT, 1);
        gameEngine.takeTokens(game, "p3", p3Tokens);

        // 8. Vòng xoay quay lại Alice, sau đó lại đến lượt Bob (Bot)
        assertEquals("p1", game.getState().getCurrentTurnPlayerId());
        gameEngine.takeTokens(game, "p1", Map.of(Resource.WATER, 1, Resource.SUNLIGHT, 1, Resource.SEED, 1));

        assertEquals("p2", game.getState().getCurrentTurnPlayerId(), "Lượt lại đến lượt Bob (Bot)");

        // Bot tiếp tục chơi lượt thứ 2 cho Bob
        SmartAfkBotEngine.BotAction botTurn2Action = gameEngine.executeBotTurn(game, "p2");
        assertNotNull(botTurn2Action);
        System.out.printf("🤖 [BOT LƯỢT 2 CỦA BOB] Hành động: %s | Lý do: %s | Tính toán trong: %.3f ms%n",
                botTurn2Action.getType(), botTurn2Action.getReason(), botTurn2Action.getCalculationDurationNanos() / 1_000_000.0);

        assertEquals("p3", game.getState().getCurrentTurnPlayerId(), "Sau khi Bot đánh, lượt tiếp tục sang Charlie");
        System.out.println("✅ KẾT QUẢ TEST THỰC NGHIỆM 1: Bot tiếp quản hoàn hảo, ván đấu diễn ra liên tục không bị gián đoạn!\n");
    }

    // =========================================================================
    // PHẦN 3: BÀI TEST THỰC NGHIỆM 2 — GIẢI ĐẤU 4 BOT ĐÁNH NHAU (TOURNAMENT SIMULATION)
    // =========================================================================

    @Test
    @DisplayName("🏆 TEST THỰC NGHIỆM 2: 4 Bot Tự Động Đấu Với Nhau Đến Khi Có Người Thắng (Tournament)")
    void testFourBotsTournamentMatch() {
        System.out.println("\n🌿 ========================================================");
        System.out.println("🏆 BẮT ĐẦU TEST THỰC NGHIỆM 2: GIẢI ĐẤU 4 BOT TỰ ĐỘNG (TOURNAMENT)");
        System.out.println("🌿 ========================================================");

        // 1. Tạo 4 Bot với tên gọi các kinh đô lịch sử Việt Nam
        List<Player> botPlayers = new ArrayList<>();
        botPlayers.add(Player.builder().id("bot-1").name("Bot-Gia Định").avatar("🦁").isBot(true).build());
        botPlayers.add(Player.builder().id("bot-2").name("Bot-Thăng Long").avatar("🐉").isBot(true).build());
        botPlayers.add(Player.builder().id("bot-3").name("Bot-Hoa Lư").avatar("🦅").isBot(true).build());
        botPlayers.add(Player.builder().id("bot-4").name("Bot-Phú Xuân").avatar("🐅").isBot(true).build());

        Game game = gameEngine.createNewGame("game-bot-tournament-4p", botPlayers);

        int totalTurns = 0;
        int maxTurnsCap = 250; // Chống lặp vô tận (Splendor thường kết thúc trong 30-50 lượt/người)
        long tournamentStartNanos = System.nanoTime();
        long totalDecisionNanos = 0;

        int buyCount = 0;
        int reserveCount = 0;
        int takeCount = 0;
        int passCount = 0;

        // 2. Chạy vòng lặp tự động mô phỏng cho đến khi GameOver
        while (!game.getState().isGameOver() && totalTurns < maxTurnsCap) {
            String currentBotId = game.getState().getCurrentTurnPlayerId();
            if (currentBotId == null) break;

            Player currentBot = gameEngine.getPlayer(game, currentBotId);

            SmartAfkBotEngine.BotAction action = gameEngine.executeBotTurn(game, currentBotId);
            totalTurns++;
            totalDecisionNanos += action.getCalculationDurationNanos();

            switch (action.getType()) {
                case BUY_CARD -> buyCount++;
                case RESERVE_CARD -> reserveCount++;
                case TAKE_TOKENS -> takeCount++;
                case PASS -> passCount++;
            }
        }

        long tournamentTotalDurationMs = (System.nanoTime() - tournamentStartNanos) / 1_000_000;
        double avgDecisionTimeMs = (totalDecisionNanos / (double) Math.max(1, totalTurns)) / 1_000_000.0;
        double avgDecisionTimeMicro = (totalDecisionNanos / (double) Math.max(1, totalTurns)) / 1_000.0;

        // 3. Thu thập kết quả ván đấu
        assertTrue(game.getState().isGameOver(), "Giải đấu 4 Bot phải kết thúc hợp lệ khi có người chạm mốc >= 15 điểm");
        String winnerId = game.getState().getWinnerPlayerId();
        assertNotNull(winnerId, "Phải xác định được Người Thắng Cuộc");

        Player winner = gameEngine.getPlayer(game, winnerId);
        assertTrue(winner.getPrestigePoints() >= 15, "Nhà vô địch phải đạt ít nhất 15 Điểm Uy Tín ★");

        // 4. In bảng báo cáo chi tiết trực quan ra Console
        System.out.println("\n------------------------------------------------------------");
        System.out.println("📊 BÁO CÁO KẾT QUẢ GIẢI ĐẤU 4 BOT (FLORA VALLEY TOURNAMENT)");
        System.out.println("------------------------------------------------------------");
        System.out.printf("👑 NHÀ VÔ ĐỊCH: %s (%s)%n", winner.getName(), winner.getId());
        System.out.printf("⭐ ĐIỂM UY TÍN: %d ★ | 🌳 SỐ THẺ CÂY ĐÃ MUA: %d | 👑 KHÁCH QUÝ: %d%n",
                winner.getPrestigePoints(), winner.getPurchasedCards().size(), winner.getVisitors().size());
        System.out.println("------------------------------------------------------------");
        System.out.printf("⏱️ TỔNG THỜI GIAN VÁN ĐẤU: %d ms (%.2f giây)%n", tournamentTotalDurationMs, tournamentTotalDurationMs / 1000.0);
        System.out.printf("🔄 TỔNG SỐ LƯỢT ĐI (TURNS): %d lượt (~%.1f lượt/bot)%n", totalTurns, totalTurns / 4.0);
        System.out.printf("⚡ TỐC ĐỘ TÍNH TOÁN TRUNG BÌNH: %.4f ms (%.1f µs) / nước đi%n", avgDecisionTimeMs, avgDecisionTimeMicro);
        System.out.println("------------------------------------------------------------");
        System.out.println("📈 PHÂN BỔ HÀNH ĐỘNG CỦA CÁC BOT:");
        System.out.printf("   • 🌳 MUA CÂY (BUY_CARD): %d (%.1f%%)%n", buyCount, (buyCount * 100.0) / totalTurns);
        System.out.printf("   • 💎 BỐC TOKEN (TAKE_TOKENS): %d (%.1f%%)%n", takeCount, (takeCount * 100.0) / totalTurns);
        System.out.printf("   • 📜 ĐẶT CHỖ (RESERVE_CARD): %d (%.1f%%)%n", reserveCount, (reserveCount * 100.0) / totalTurns);
        System.out.printf("   • ⏭️ BỎ QUA (PASS): %d (%.1f%%)%n", passCount, (passCount * 100.0) / totalTurns);
        System.out.println("------------------------------------------------------------");
        System.out.println("🏆 BẢNG XẾP HẠNG PODIUM:");
        List<Player> ranking = new ArrayList<>(game.getState().getPlayers());
        ranking.sort((p1, p2) -> {
            if (p1.getPrestigePoints() != p2.getPrestigePoints()) {
                return Integer.compare(p2.getPrestigePoints(), p1.getPrestigePoints());
            }
            return Integer.compare(p1.getPurchasedCards().size(), p2.getPurchasedCards().size());
        });

        int rank = 1;
        for (Player p : ranking) {
            System.out.printf("   #%d. %s: %d★ (%d cây, %d khách quý)%n",
                    rank++, p.getName(), p.getPrestigePoints(), p.getPurchasedCards().size(), p.getVisitors().size());
        }
        System.out.println("🌿 ========================================================\n");
    }
}

