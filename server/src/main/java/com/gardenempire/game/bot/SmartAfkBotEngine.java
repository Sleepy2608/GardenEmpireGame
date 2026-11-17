package com.gardenempire.game.bot;

import com.gardenempire.exception.GameException;
import com.gardenempire.game.Game;
import com.gardenempire.game.GameEngine;
import com.gardenempire.game.GameState;
import com.gardenempire.game.PlantCard;
import com.gardenempire.game.Player;
import com.gardenempire.game.Resource;
import com.gardenempire.game.VisitorCard;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * 🤖 SMART AFK BOT ENGINE (v1.0.0)
 * 
 * Thuật toán AI thế chân cho người chơi AFK / Disconnect trong Garden Empire (lấy cảm hứng từ Splendor).
 * Áp dụng hệ luật Heuristic 4 cấp độ kết hợp lý thuyết "Turn Economy" (Kinh tế số lượt đi):
 * 1. Mua Cây (Buy Card): Ưu tiên Điểm Uy Tín ★, rước Khách Quý (+3★), và giải phóng bài giữ.
 * 2. Đặt Chỗ (Reserve Card): Khóa thẻ mục tiêu Tier 2/3 giá trị cao và nhận 1 Phân Bón Vàng WILD ⭐.
 * 3. Bốc Token Thông Minh (Smart Take Tokens): Bốc 2 cùng loại (nếu Bank >= 4) hoặc 3 khác loại theo nhu cầu thẻ mục tiêu.
 * 4. Bảo Vệ Ngưỡng 10 Token (Cap Guard): Tự động trả lại token thừa, bảo vệ tối đa token WILD.
 */
@Slf4j
public class SmartAfkBotEngine {

    public enum BotActionType {
        BUY_CARD,
        RESERVE_CARD,
        TAKE_TOKENS,
        RETURN_TOKENS,
        PASS
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BotAction {
        private BotActionType type;
        private String cardId;
        private boolean fromReserved;
        private Integer deckTier;
        @Builder.Default
        private Map<Resource, Integer> tokensToTake = new EnumMap<>(Resource.class);
        @Builder.Default
        private Map<Resource, Integer> tokensToReturn = new EnumMap<>(Resource.class);
        private String reason;
        private long calculationDurationNanos;
    }

    /**
     * Tính toán nước đi tối ưu nhất cho người chơi dựa trên trạng thái bàn cờ hiện tại.
     */
    public static BotAction calculateBestMove(GameState state, Player player) {
        long startTime = System.nanoTime();

        if (state == null || player == null || state.isGameOver()) {
            return BotAction.builder()
                    .type(BotActionType.PASS)
                    .reason("Trò chơi đã kết thúc hoặc tham số không hợp lệ.")
                    .calculationDurationNanos(System.nanoTime() - startTime)
                    .build();
        }

        // =====================================================================
        // CẤP ĐỘ 1: KIỂM TRA MUA CÂY (BUY CARD) TỪ BÀN HOẶC BÀI GIỮ
        // =====================================================================
        List<CandidateCard> affordableCards = new ArrayList<>();

        // 1.1. Quét kho bài giữ (Reserved Cards)
        for (PlantCard card : player.getReservedCards()) {
            if (canAffordCard(player, card)) {
                double utility = evaluateCardValue(state, player, card, true);
                affordableCards.add(new CandidateCard(card, true, utility, 0));
            }
        }

        // 1.2. Quét 12 thẻ trên bàn cờ
        for (PlantCard card : getAllVisibleCards(state)) {
            if (canAffordCard(player, card)) {
                double utility = evaluateCardValue(state, player, card, false);
                affordableCards.add(new CandidateCard(card, false, utility, 0));
            }
        }

        if (!affordableCards.isEmpty()) {
            // Sắp xếp ưu tiên utility cao nhất
            affordableCards.sort(Comparator.comparingDouble(CandidateCard::utility).reversed());
            CandidateCard bestToBuy = affordableCards.get(0);

            String originDesc = bestToBuy.isReserved() ? "kho bài giữ" : "bàn cờ";
            String reason = String.format("Mua thẻ \"%s\" (%d★, Tier %d, bonus %s) từ %s (Utility: %.1f)",
                    bestToBuy.card().getName(), bestToBuy.card().getPrestigePoints(),
                    bestToBuy.card().getTier(), bestToBuy.card().getBonusResource(), originDesc, bestToBuy.utility());

            return BotAction.builder()
                    .type(BotActionType.BUY_CARD)
                    .cardId(bestToBuy.card().getId())
                    .fromReserved(bestToBuy.isReserved())
                    .reason(reason)
                    .calculationDurationNanos(System.nanoTime() - startTime)
                    .build();
        }

        // =====================================================================
        // CẤP ĐỘ 2: TÌM THẺ MỤC TIÊU VÀ XEM XÉT ĐẶT CHỖ (RESERVE CARD)
        // =====================================================================
        List<CandidateCard> allCandidates = new ArrayList<>();
        for (PlantCard card : getAllVisibleCards(state)) {
            int missing = calculateMissingTokens(player, card);
            double utility = evaluateCardValue(state, player, card, false);
            double score = utility / (missing + 0.6);
            allCandidates.add(new CandidateCard(card, false, utility, missing, score));
        }

        allCandidates.sort(Comparator.comparingDouble(CandidateCard::score).reversed());
        CandidateCard targetCard = allCandidates.isEmpty() ? null : allCandidates.get(0);

        // Xem xét Đặt Chỗ (Reserve):
        // Điều kiện: Chưa đầy 3 thẻ giữ, Ngân hàng còn WILD, và thẻ mục tiêu rất giá trị (Tier 2/3, >= 2★)
        Map<Resource, Integer> bank = state.getResourceBank();
        int wildInBank = bank.getOrDefault(Resource.WILD, 0);
        int currentHandTokens = player.getTotalTokensCount();

        if (targetCard != null && player.getReservedCards().size() < 3 && wildInBank > 0) {
            boolean isHighValueTarget = targetCard.card().getTier() >= 2 && targetCard.card().getPrestigePoints() >= 2;
            boolean isCloseToBuy = targetCard.missingTokens() <= 2;

            if (isHighValueTarget && (isCloseToBuy || targetCard.card().getPrestigePoints() >= 3)) {
                // Nếu nhận thêm 1 WILD mà vượt trần 10 token -> Tính token cần trả
                Map<Resource, Integer> tokensToReturn = new EnumMap<>(Resource.class);
                if (currentHandTokens + 1 > 10) {
                    Resource discardRes = selectTokenToDiscard(player, targetCard.card(), Collections.emptyMap());
                    if (discardRes != null) {
                        tokensToReturn.put(discardRes, 1);
                    }
                }

                String reason = String.format("Đặt chỗ thẻ \"%s\" (%d★, Tier %d) và nhận 1 Phân Bón Vàng WILD ⭐",
                        targetCard.card().getName(), targetCard.card().getPrestigePoints(), targetCard.card().getTier());

                return BotAction.builder()
                        .type(BotActionType.RESERVE_CARD)
                        .cardId(targetCard.card().getId())
                        .tokensToReturn(tokensToReturn)
                        .reason(reason)
                        .calculationDurationNanos(System.nanoTime() - startTime)
                        .build();
            }
        }

        // =====================================================================
        // CẤP ĐỘ 3: BỐC TOKEN THÔNG MINH (TAKE TOKENS)
        // =====================================================================
        PlantCard goalCard = targetCard != null ? targetCard.card() : null;
        Map<Resource, Integer> missing = goalCard != null ? getMissingResources(player, goalCard) : Collections.emptyMap();

        // 3.1. Thử bốc 2 token cùng loại (Double pick)
        // Điều kiện: Thiếu >= 2 của một màu, Bank có >= 4, và tay hiện tại <= 8 để không bị lãng phí
        Resource doublePickResource = null;
        for (Map.Entry<Resource, Integer> entry : missing.entrySet()) {
            Resource res = entry.getKey();
            int needed = entry.getValue();
            if (needed >= 2 && bank.getOrDefault(res, 0) >= 4 && currentHandTokens <= 8) {
                doublePickResource = res;
                break;
            }
        }

        if (doublePickResource != null) {
            Map<Resource, Integer> tokensToTake = new EnumMap<>(Resource.class);
            tokensToTake.put(doublePickResource, 2);

            String reason = String.format("Bốc 2 token %s (Bank còn %d) để chuẩn bị trồng cây \"%s\"",
                    doublePickResource, bank.get(doublePickResource), goalCard.getName());

            return BotAction.builder()
                    .type(BotActionType.TAKE_TOKENS)
                    .tokensToTake(tokensToTake)
                    .reason(reason)
                    .calculationDurationNanos(System.nanoTime() - startTime)
                    .build();
        }

        // 3.2. Bốc 3 token khác loại (Triple distinct pick)
        Map<Resource, Integer> tokensToTake = new EnumMap<>(Resource.class);

        // Ưu tiên 1: Các màu mà Thẻ Mục Tiêu đang thiếu và Bank có >= 1
        for (Resource res : Resource.values()) {
            if (res == Resource.WILD) continue;
            if (missing.getOrDefault(res, 0) > 0 && bank.getOrDefault(res, 0) > 0) {
                tokensToTake.put(res, 1);
                if (tokensToTake.size() == 3) break;
            }
        }

        // Ưu tiên 2: Nếu chưa đủ 3 màu, tìm thêm các màu mà các thẻ ứng viên tiếp theo cần
        if (tokensToTake.size() < 3 && allCandidates.size() > 1) {
            for (int i = 1; i < Math.min(4, allCandidates.size()) && tokensToTake.size() < 3; i++) {
                Map<Resource, Integer> altMissing = getMissingResources(player, allCandidates.get(i).card());
                for (Resource res : Resource.values()) {
                    if (res == Resource.WILD || tokensToTake.containsKey(res)) continue;
                    if (altMissing.getOrDefault(res, 0) > 0 && bank.getOrDefault(res, 0) > 0) {
                        tokensToTake.put(res, 1);
                        if (tokensToTake.size() == 3) break;
                    }
                }
            }
        }

        // Ưu tiên 3: Nếu vẫn chưa đủ 3 màu, bốc bất kỳ màu cơ bản nào còn trong Bank
        if (tokensToTake.size() < 3) {
            for (Resource res : Resource.values()) {
                if (res == Resource.WILD || tokensToTake.containsKey(res)) continue;
                if (bank.getOrDefault(res, 0) > 0) {
                    tokensToTake.put(res, 1);
                    if (tokensToTake.size() == 3) break;
                }
            }
        }

        // Kiểm tra xem Bank có ít hơn 3 loại token khả dụng không (luật cho phép bốc số lượng = số loại còn lại)
        long distinctAvailable = bank.entrySet().stream()
                .filter(e -> e.getKey() != Resource.WILD && e.getValue() > 0)
                .count();

        boolean isValidTake = (tokensToTake.size() == 3) || (distinctAvailable < 3 && tokensToTake.size() == distinctAvailable && distinctAvailable > 0);

        if (isValidTake) {
            // =================================================================
            // CẤP ĐỘ 4: BẢO VỆ NGƯỠNG 10 TOKEN (CAP GUARD & DISCARD SELECTION)
            // =================================================================
            int totalAfterTake = currentHandTokens + tokensToTake.size();
            Map<Resource, Integer> tokensToReturn = new EnumMap<>(Resource.class);

            if (totalAfterTake > 10) {
                int excess = totalAfterTake - 10;
                // Tạo bản sao token giả định trên tay
                Map<Resource, Integer> simulatedHand = new EnumMap<>(player.getTokens());
                for (Resource res : tokensToTake.keySet()) {
                    simulatedHand.put(res, simulatedHand.getOrDefault(res, 0) + 1);
                }

                for (int i = 0; i < excess; i++) {
                    Resource discardRes = selectTokenToDiscardSimulated(simulatedHand, goalCard);
                    if (discardRes != null) {
                        tokensToReturn.put(discardRes, tokensToReturn.getOrDefault(discardRes, 0) + 1);
                        simulatedHand.put(discardRes, simulatedHand.get(discardRes) - 1);
                    }
                }
            }

            String reason = String.format("Bốc %d token khác loại (%s) phục vụ chiến thuật",
                    tokensToTake.size(), formatResourceList(tokensToTake.keySet()));

            return BotAction.builder()
                    .type(BotActionType.TAKE_TOKENS)
                    .tokensToTake(tokensToTake)
                    .tokensToReturn(tokensToReturn)
                    .reason(reason)
                    .calculationDurationNanos(System.nanoTime() - startTime)
                    .build();
        }

        // =====================================================================
        // FALLBACK CUỐI CÙNG: NẾU KHÔNG THỂ BỐC TOKEN (BANK CẠN), THỬ RESERVE 1 THẺ HOẶC PASS
        // =====================================================================
        if (player.getReservedCards().size() < 3 && !getAllVisibleCards(state).isEmpty()) {
            PlantCard fallbackCard = getAllVisibleCards(state).get(0);
            return BotAction.builder()
                    .type(BotActionType.RESERVE_CARD)
                    .cardId(fallbackCard.getId())
                    .reason("Ngân hàng cạn kiệt tài nguyên, bot đặt chỗ thẻ \"" + fallbackCard.getName() + "\" để giữ nhịp ván đấu.")
                    .calculationDurationNanos(System.nanoTime() - startTime)
                    .build();
        }

        return BotAction.builder()
                .type(BotActionType.PASS)
                .reason("Không có hành động hợp lệ khả thi, bot tự động bỏ qua lượt.")
                .calculationDurationNanos(System.nanoTime() - startTime)
                .build();
    }

    /**
     * Thực thi hành động mà Bot đã tính toán trực tiếp lên Game thông qua GameEngine.
     */
    public static void executeMove(GameEngine gameEngine, Game game, Player player, BotAction action) {
        if (action == null || gameEngine == null || game == null || player == null) {
            return;
        }

        String playerId = player.getId();

        switch (action.getType()) {
            case BUY_CARD -> {
                gameEngine.buyPlantCard(game, playerId, action.getCardId(), action.isFromReserved());
            }
            case RESERVE_CARD -> {
                gameEngine.reservePlantCard(game, playerId, action.getCardId(), action.getDeckTier());
                // Nếu sau khi reserve vượt quá 10 token (nhận WILD), trả bớt token
                if (player.getTotalTokensCount() > 10 && action.getTokensToReturn() != null && !action.getTokensToReturn().isEmpty()) {
                    gameEngine.returnTokens(game, playerId, action.getTokensToReturn());
                }
            }
            case TAKE_TOKENS -> {
                gameEngine.takeTokens(game, playerId, action.getTokensToTake());
                // Nếu sau khi lấy vượt quá 10 token, trả lại số token đã định trước
                if (player.getTotalTokensCount() > 10 && action.getTokensToReturn() != null && !action.getTokensToReturn().isEmpty()) {
                    gameEngine.returnTokens(game, playerId, action.getTokensToReturn());
                }
            }
            case RETURN_TOKENS -> {
                if (action.getTokensToReturn() != null && !action.getTokensToReturn().isEmpty()) {
                    gameEngine.returnTokens(game, playerId, action.getTokensToReturn());
                }
            }
            case PASS -> {
                gameEngine.endTurn(game, playerId);
            }
        }
    }

    // =========================================================================
    // HELPER FUNCTIONS & EVALUATION FORMULAS
    // =========================================================================

    public static boolean canAffordCard(Player player, PlantCard card) {
        if (player == null || card == null) return false;
        Map<Resource, Integer> cost = card.getCost();
        int wildNeeded = 0;

        for (Map.Entry<Resource, Integer> entry : cost.entrySet()) {
            Resource res = entry.getKey();
            int required = entry.getValue();
            int bonus = player.getBonuses().getOrDefault(res, 0);
            int needed = Math.max(0, required - bonus);
            int tokens = player.getTokens().getOrDefault(res, 0);

            if (tokens < needed) {
                wildNeeded += (needed - tokens);
            }
        }

        int playerWild = player.getTokens().getOrDefault(Resource.WILD, 0);
        return playerWild >= wildNeeded;
    }

    public static int calculateMissingTokens(Player player, PlantCard card) {
        if (player == null || card == null) return 99;
        Map<Resource, Integer> cost = card.getCost();
        int missing = 0;

        for (Map.Entry<Resource, Integer> entry : cost.entrySet()) {
            Resource res = entry.getKey();
            int required = entry.getValue();
            int bonus = player.getBonuses().getOrDefault(res, 0);
            int needed = Math.max(0, required - bonus);
            int tokens = player.getTokens().getOrDefault(res, 0);

            if (tokens < needed) {
                missing += (needed - tokens);
            }
        }

        int playerWild = player.getTokens().getOrDefault(Resource.WILD, 0);
        return Math.max(0, missing - playerWild);
    }

    public static Map<Resource, Integer> getMissingResources(Player player, PlantCard card) {
        Map<Resource, Integer> missing = new EnumMap<>(Resource.class);
        if (player == null || card == null) return missing;

        for (Map.Entry<Resource, Integer> entry : card.getCost().entrySet()) {
            Resource res = entry.getKey();
            int required = entry.getValue();
            int bonus = player.getBonuses().getOrDefault(res, 0);
            int needed = Math.max(0, required - bonus);
            int tokens = player.getTokens().getOrDefault(res, 0);

            if (tokens < needed) {
                missing.put(res, needed - tokens);
            }
        }
        return missing;
    }

    public static double evaluateCardValue(GameState state, Player player, PlantCard card, boolean isReserved) {
        if (card == null) return 0.0;

        // Điểm cơ bản
        double utility = card.getPrestigePoints() * 12.0;

        // Phân cấp Tier (Chiến thuật Turn Economy: Tier 2 là Sweet Spot)
        switch (card.getTier()) {
            case 2 -> utility += 4.5;
            case 3 -> utility += 6.0;
            case 1 -> utility += 1.5;
        }

        // Tác động tới Khách Quý (Nobles / Royal Visitors):
        // Nếu mua cây này đóng góp vào điều kiện nhận Khách Quý (+3★ = 36 utility)
        if (state != null && state.getVisibleVisitors() != null) {
            Resource bonusRes = card.getBonusResource();
            for (VisitorCard visitor : state.getVisibleVisitors()) {
                Map<Resource, Integer> reqs = visitor.getRequirements();
                if (reqs.containsKey(bonusRes)) {
                    int currentBonus = player.getBonuses().getOrDefault(bonusRes, 0);
                    int requiredBonus = reqs.get(bonusRes);
                    if (currentBonus < requiredBonus) {
                        // Nếu chỉ thiếu đúng 1 bonus này để được Khách Quý ngay lập tức
                        boolean willClaim = true;
                        for (Map.Entry<Resource, Integer> req : reqs.entrySet()) {
                            int b = player.getBonuses().getOrDefault(req.getKey(), 0);
                            if (req.getKey() == bonusRes) b += 1;
                            if (b < req.getValue()) {
                                willClaim = false;
                                break;
                            }
                        }
                        if (willClaim) {
                            utility += 38.0; // Rất cao vì sắp rước được 3 điểm Uy Tín ★ từ Khách Quý
                        } else {
                            utility += 3.0; // Tích lũy tiến độ
                        }
                    }
                }
            }
        }

        // Ưu tiên giải phóng thẻ đang giữ
        if (isReserved) {
            utility += 3.0;
        }

        return utility;
    }

    public static List<PlantCard> getAllVisibleCards(GameState state) {
        List<PlantCard> list = new ArrayList<>();
        if (state == null) return list;
        if (state.getVisibleTier3Cards() != null) list.addAll(state.getVisibleTier3Cards());
        if (state.getVisibleTier2Cards() != null) list.addAll(state.getVisibleTier2Cards());
        if (state.getVisibleTier1Cards() != null) list.addAll(state.getVisibleTier1Cards());
        return list;
    }

    private static Resource selectTokenToDiscard(Player player, PlantCard targetCard, Map<Resource, Integer> taking) {
        Map<Resource, Integer> combined = new EnumMap<>(player.getTokens());
        for (Map.Entry<Resource, Integer> e : taking.entrySet()) {
            combined.put(e.getKey(), combined.getOrDefault(e.getKey(), 0) + e.getValue());
        }
        return selectTokenToDiscardSimulated(combined, targetCard);
    }

    private static Resource selectTokenToDiscardSimulated(Map<Resource, Integer> tokens, PlantCard targetCard) {
        // Tuyệt đối không trả Phân bón vàng (WILD)
        // Ưu tiên trả loại tài nguyên mà targetCard KHÔNG cần hoặc người chơi đang có dư thừa
        Map<Resource, Integer> targetCost = (targetCard != null) ? targetCard.getCost() : Collections.emptyMap();

        Resource bestToDiscard = null;
        int maxSurplus = -999;

        for (Resource res : Resource.values()) {
            if (res == Resource.WILD) continue;
            int count = tokens.getOrDefault(res, 0);
            if (count > 0) {
                int needed = targetCost.getOrDefault(res, 0);
                int surplus = count - needed;
                if (surplus > maxSurplus) {
                    maxSurplus = surplus;
                    bestToDiscard = res;
                }
            }
        }

        return bestToDiscard;
    }

    private static String formatResourceList(Iterable<Resource> resources) {
        List<String> names = new ArrayList<>();
        for (Resource r : resources) {
            names.add(r.name());
        }
        return String.join(", ", names);
    }

    private record CandidateCard(PlantCard card, boolean isReserved, double utility, int missingTokens, double score) {
        public CandidateCard(PlantCard card, boolean isReserved, double utility, int missingTokens) {
            this(card, isReserved, utility, missingTokens, utility / (missingTokens + 0.6));
        }
    }
}

