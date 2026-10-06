package com.gardenempire.game;

import com.gardenempire.exception.GameException;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class GameEngine {

    private Random random = new Random();

    public void setRandom(Random random) {
        this.random = random;
    }

    public Game createNewGame(String gameId, List<Player> players) {
        if (players == null || players.size() < 2 || players.size() > 4) {
            throw new GameException("Số lượng người chơi phải từ 2 đến 4 người để bắt đầu trò chơi.");
        }

        Game game = new Game(gameId, players);
        initializeDecksAndMarket(game);
        initializeBank(game, players.size());
        
        // Chọn ngẫu nhiên người đi đầu tiên
        int randomIndex = this.random.nextInt(players.size());
        String firstPlayerId = players.get(randomIndex).getId();
        game.getState().setFirstPlayerId(firstPlayerId);
        game.getState().setCurrentTurnPlayerId(firstPlayerId);
        
        return game;
    }

    private void initializeBank(Game game, int playerCount) {
        int tokenCount = switch (playerCount) {
            case 2 -> 4;
            case 3 -> 5;
            default -> 7;
        };

        Map<Resource, Integer> bank = new EnumMap<>(Resource.class);
        for (Resource res : Resource.values()) {
            if (res == Resource.WILD) {
                bank.put(res, 5); // Luôn có 5 Phân bón vàng (WILD)
            } else {
                bank.put(res, tokenCount);
            }
        }
        game.getState().setResourceBank(bank);
    }

    private void initializeDecksAndMarket(Game game) {
        // Khởi tạo và xáo bài từ CardCatalog
        List<PlantCard> t1 = new ArrayList<>(CardCatalog.createTier1Cards());
        Collections.shuffle(t1);
        game.setTier1Deck(new Deck<>(t1));

        List<PlantCard> t2 = new ArrayList<>(CardCatalog.createTier2Cards());
        Collections.shuffle(t2);
        game.setTier2Deck(new Deck<>(t2));

        List<PlantCard> t3 = new ArrayList<>(CardCatalog.createTier3Cards());
        Collections.shuffle(t3);
        game.setTier3Deck(new Deck<>(t3));

        List<VisitorCard> visitors = new ArrayList<>(CardCatalog.createVisitorCards());
        Collections.shuffle(visitors);
        game.setVisitorDeck(new Deck<>(visitors));

        // Mở 4 thẻ mỗi Tier
        for (int i = 0; i < 4; i++) {
            PlantCard c1 = game.getTier1Deck().draw();
            if (c1 != null) game.getState().getVisibleTier1Cards().add(c1);

            PlantCard c2 = game.getTier2Deck().draw();
            if (c2 != null) game.getState().getVisibleTier2Cards().add(c2);

            PlantCard c3 = game.getTier3Deck().draw();
            if (c3 != null) game.getState().getVisibleTier3Cards().add(c3);
        }

        // Mở Khách Thăm Vườn = số người chơi + 1
        int numVisitors = game.getState().getPlayers().size() + 1;
        for (int i = 0; i < numVisitors; i++) {
            VisitorCard v = game.getVisitorDeck().draw();
            if (v != null) game.getState().getVisibleVisitors().add(v);
        }

        updateDeckCounts(game);
    }

    public void updateDeckCounts(Game game) {
        game.getState().setTier1DeckCount(game.getTier1Deck().size());
        game.getState().setTier2DeckCount(game.getTier2Deck().size());
        game.getState().setTier3DeckCount(game.getTier3Deck().size());
    }

    // =========================================================================
    // 3 HÀNH ĐỘNG CHÍNH (MAIN ACTIONS) — Mỗi lượt người chơi CHỈ CHỌN 1 TRONG 3
    // =========================================================================

    // -------------------------------------------------------------------------
    // HÀNH ĐỘNG CHÍNH 1: LẤY TÀI NGUYÊN (TAKE TOKENS)
    // -------------------------------------------------------------------------
    public void takeTokens(Game game, String playerId, Map<Resource, Integer> requestedTokens) {
        validateTurnAndActive(game, playerId);

        if (requestedTokens == null || requestedTokens.isEmpty()) {
            throw new GameException("Vui lòng chọn tài nguyên cần lấy.");
        }

        if (requestedTokens.containsKey(Resource.WILD)) {
            throw new GameException("Không được lấy trực tiếp Phân bón vàng (WILD) từ ngân hàng.");
        }

        Map<Resource, Integer> bank = game.getState().getResourceBank();
        int totalTokensRequested = requestedTokens.values().stream().mapToInt(Integer::intValue).sum();

        if (requestedTokens.size() == 1) {
            // Lấy 2 token cùng loại
            Map.Entry<Resource, Integer> entry = requestedTokens.entrySet().iterator().next();
            Resource res = entry.getKey();
            int count = entry.getValue();

            if (count != 2) {
                throw new GameException("Chỉ được lấy 2 token nếu chọn cùng 1 loại tài nguyên.");
            }

            int currentInBank = bank.getOrDefault(res, 0);
            if (currentInBank < 4) {
                throw new GameException("Ngân hàng phải có từ 4 token " + res + " trở lên mới được lấy 2.");
            }
        } else if (totalTokensRequested == 3) {
            // Lấy 3 token khác nhau (mỗi loại đúng 1)
            for (Map.Entry<Resource, Integer> entry : requestedTokens.entrySet()) {
                if (entry.getValue() != 1) {
                    throw new GameException("Chỉ được lấy 1 token cho mỗi loại khi lấy 3 tài nguyên khác nhau.");
                }
                if (bank.getOrDefault(entry.getKey(), 0) < 1) {
                    throw new GameException("Tài nguyên " + entry.getKey() + " trong ngân hàng đã hết.");
                }
            }
        } else {
            // Trường hợp đặc biệt: Bank còn ít hơn 3 loại token, cho phép lấy tối đa các token khác loại còn lại
            long availableDistinctTypes = bank.entrySet().stream()
                    .filter(e -> e.getKey() != Resource.WILD && e.getValue() > 0)
                    .count();

            if (availableDistinctTypes < 3 && totalTokensRequested == availableDistinctTypes) {
                for (Map.Entry<Resource, Integer> entry : requestedTokens.entrySet()) {
                    if (entry.getValue() != 1 || bank.getOrDefault(entry.getKey(), 0) < 1) {
                        throw new GameException("Yêu cầu lấy tài nguyên không hợp lệ.");
                    }
                }
            } else {
                throw new GameException("Bạn phải lấy 3 tài nguyên khác loại hoặc 2 tài nguyên cùng loại.");
            }
        }

        Player player = getPlayer(game, playerId);

        // Chuyển token từ Bank sang Player
        for (Map.Entry<Resource, Integer> entry : requestedTokens.entrySet()) {
            Resource res = entry.getKey();
            int count = entry.getValue();
            bank.put(res, bank.get(res) - count);
            player.getTokens().put(res, player.getTokens().getOrDefault(res, 0) + count);
        }

        // Nếu tổng token sau khi lấy <= 10 -> Lượt chơi hoàn tất và chuyển lượt
        // Nếu > 10 -> Giữ nguyên lượt để người chơi thực hiện EXTRA ACTION: returnTokens
        if (player.getTotalTokensCount() <= 10) {
            endTurn(game, playerId);
        }
    }

    // -------------------------------------------------------------------------
    // HÀNH ĐỘNG CHÍNH 2: TRỒNG CÂY (BUY PLANT CARD)
    // -------------------------------------------------------------------------
    public void buyPlantCard(Game game, String playerId, String cardId, boolean fromReserved) {
        validateTurnAndActive(game, playerId);
        Player player = getPlayer(game, playerId);

        PlantCard targetCard = null;
        int tierFound = -1;

        if (fromReserved) {
            targetCard = player.getReservedCards().stream()
                    .filter(c -> c.getId().equals(cardId))
                    .findFirst()
                    .orElseThrow(() -> new GameException("Thẻ cây không nằm trong danh sách đã giữ."));
        } else {
            if ((targetCard = findAndRemoveFromList(game.getState().getVisibleTier1Cards(), cardId)) != null) tierFound = 1;
            else if ((targetCard = findAndRemoveFromList(game.getState().getVisibleTier2Cards(), cardId)) != null) tierFound = 2;
            else if ((targetCard = findAndRemoveFromList(game.getState().getVisibleTier3Cards(), cardId)) != null) tierFound = 3;

            if (targetCard == null) {
                throw new GameException("Không tìm thấy thẻ cây trên bàn cờ.");
            }
        }

        // Tính toán chi phí thực tế sau khi trừ Bonus vĩnh viễn
        Map<Resource, Integer> cost = targetCard.getCost();
        Map<Resource, Integer> tokensToPay = new EnumMap<>(Resource.class);
        int wildNeeded = 0;

        for (Map.Entry<Resource, Integer> entry : cost.entrySet()) {
            Resource res = entry.getKey();
            int requiredAmount = entry.getValue();
            int playerBonus = player.getBonuses().getOrDefault(res, 0);
            int amountAfterBonus = Math.max(0, requiredAmount - playerBonus);

            int playerToken = player.getTokens().getOrDefault(res, 0);
            if (playerToken >= amountAfterBonus) {
                tokensToPay.put(res, amountAfterBonus);
            } else {
                tokensToPay.put(res, playerToken);
                wildNeeded += (amountAfterBonus - playerToken);
            }
        }

        int playerWild = player.getTokens().getOrDefault(Resource.WILD, 0);
        if (playerWild < wildNeeded) {
            // Hoàn lại thẻ về vị trí cũ nếu mua thất bại (khi mua từ bàn)
            if (!fromReserved) {
                restoreVisibleCard(game, targetCard, tierFound);
            }
            throw new GameException("Bạn không đủ tài nguyên và phân bón vàng để trồng cây này.");
        }

        // Thực hiện thanh toán: Trừ token của người chơi và trả lại vào Bank
        Map<Resource, Integer> bank = game.getState().getResourceBank();
        for (Map.Entry<Resource, Integer> pay : tokensToPay.entrySet()) {
            Resource res = pay.getKey();
            int count = pay.getValue();
            player.getTokens().put(res, player.getTokens().get(res) - count);
            bank.put(res, bank.getOrDefault(res, 0) + count);
        }

        if (wildNeeded > 0) {
            player.getTokens().put(Resource.WILD, playerWild - wildNeeded);
            bank.put(Resource.WILD, bank.getOrDefault(Resource.WILD, 0) + wildNeeded);
        }

        // Nhận cây: Thêm vào vườn, cộng điểm và bonus
        if (fromReserved) {
            player.getReservedCards().remove(targetCard);
        }
        player.getPurchasedCards().add(targetCard);
        player.setPrestigePoints(player.getPrestigePoints() + targetCard.getPrestigePoints());
        
        Resource bonus = targetCard.getBonusResource();
        if (bonus != null) {
            player.getBonuses().put(bonus, player.getBonuses().getOrDefault(bonus, 0) + 1);
        }

        // Rút thẻ mới lấp đầy bàn cờ nếu mua từ bàn
        if (!fromReserved) {
            refillMarket(game, tierFound);
        }

        endTurn(game, playerId);
    }

    // -------------------------------------------------------------------------
    // HÀNH ĐỘNG CHÍNH 3: GIỮ CÂY (RESERVE PLANT CARD)
    // -------------------------------------------------------------------------
    public void reservePlantCard(Game game, String playerId, String cardId, Integer tierFromDeck) {
        validateTurnAndActive(game, playerId);
        Player player = getPlayer(game, playerId);

        if (player.getReservedCards().size() >= 3) {
            throw new GameException("Bạn chỉ được giữ tối đa 3 thẻ cây trên tay.");
        }

        PlantCard targetCard = null;
        int tierFound = -1;

        if (cardId != null) {
            if ((targetCard = findAndRemoveFromList(game.getState().getVisibleTier1Cards(), cardId)) != null) tierFound = 1;
            else if ((targetCard = findAndRemoveFromList(game.getState().getVisibleTier2Cards(), cardId)) != null) tierFound = 2;
            else if ((targetCard = findAndRemoveFromList(game.getState().getVisibleTier3Cards(), cardId)) != null) tierFound = 3;

            if (targetCard == null) {
                throw new GameException("Không tìm thấy thẻ cây trên bàn để giữ.");
            }
            refillMarket(game, tierFound);
        } else if (tierFromDeck != null) {
            Deck<PlantCard> deck = switch (tierFromDeck) {
                case 1 -> game.getTier1Deck();
                case 2 -> game.getTier2Deck();
                case 3 -> game.getTier3Deck();
                default -> throw new GameException("Tier không hợp lệ.");
            };
            targetCard = deck.draw();
            if (targetCard == null) {
                throw new GameException("Chồng bài Tier " + tierFromDeck + " đã hết.");
            }
            updateDeckCounts(game);
        } else {
            throw new GameException("Phải chỉ định thẻ bài hoặc chồng bài cần giữ.");
        }

        player.getReservedCards().add(targetCard);

        // Nhận 1 Phân bón vàng (WILD) từ Bank nếu còn
        Map<Resource, Integer> bank = game.getState().getResourceBank();
        int wildInBank = bank.getOrDefault(Resource.WILD, 0);
        if (wildInBank > 0) {
            bank.put(Resource.WILD, wildInBank - 1);
            player.getTokens().put(Resource.WILD, player.getTokens().getOrDefault(Resource.WILD, 0) + 1);
        }

        // Nếu tổng token sau khi nhận WILD <= 10 -> Lượt chơi hoàn tất
        // Nếu > 10 -> Yêu cầu người chơi trả bớt token bằng EXTRA ACTION: returnTokens
        if (player.getTotalTokensCount() <= 10) {
            endTurn(game, playerId);
        }
    }

    // =========================================================================
    // EXTRA ACTION 1: TRẢ LẠI TOKEN DƯ (Khi và chỉ khi tổng token trên tay > 10)
    // Trả lại về cho số token còn lại 10
    // =========================================================================
    public void returnTokens(Game game, String playerId, Map<Resource, Integer> returnedTokens) {
        validateTurnAndActive(game, playerId);
        Player player = getPlayer(game, playerId);

        if (player.getTotalTokensCount() <= 10) {
            throw new GameException("Bạn đang có " + player.getTotalTokensCount() + " token (không vượt quá 10), không cần phải trả lại.");
        }

        if (returnedTokens == null || returnedTokens.isEmpty()) {
            throw new GameException("Vui lòng chọn tài nguyên cần trả lại.");
        }

        int totalReturned = returnedTokens.values().stream().mapToInt(Integer::intValue).sum();
        if (player.getTotalTokensCount() - totalReturned > 10) {
            throw new GameException("Bạn cần trả thêm token để số token trên tay không vượt quá 10 (còn dư " + (player.getTotalTokensCount() - totalReturned - 10) + " token).");
        }

        for (Map.Entry<Resource, Integer> entry : returnedTokens.entrySet()) {
            Resource res = entry.getKey();
            int count = entry.getValue();
            int current = player.getTokens().getOrDefault(res, 0);
            if (current < count) {
                throw new GameException("Bạn không có đủ token " + res + " để trả lại.");
            }
        }

        Map<Resource, Integer> bank = game.getState().getResourceBank();
        for (Map.Entry<Resource, Integer> entry : returnedTokens.entrySet()) {
            Resource res = entry.getKey();
            int count = entry.getValue();
            player.getTokens().put(res, player.getTokens().get(res) - count);
            bank.put(res, bank.getOrDefault(res, 0) + count);
        }

        // Khi đã trả đủ token để tổng số <= 10 -> Chính thức hoàn tất lượt chơi
        if (player.getTotalTokensCount() <= 10) {
            endTurn(game, playerId);
        }
    }

    // =========================================================================
    // EXTRA ACTION 2: TỰ ĐỘNG RƯỚC KHÁCH THĂM VƯỜN (Cuối lượt khi đủ điều kiện cây)
    // Tối đa 1 lượt chỉ chiêu mộ thêm 1 khách
    // =========================================================================
    private void checkAndClaimVisitors(Game game, Player player) {
        List<VisitorCard> visibleVisitors = game.getState().getVisibleVisitors();
        VisitorCard eligibleVisitor = null;

        for (VisitorCard v : visibleVisitors) {
            boolean eligible = true;
            for (Map.Entry<Resource, Integer> req : v.getRequirements().entrySet()) {
                int playerBonus = player.getBonuses().getOrDefault(req.getKey(), 0);
                if (playerBonus < req.getValue()) {
                    eligible = false;
                    break;
                }
            }
            if (eligible) {
                eligibleVisitor = v;
                break; // Mỗi lượt chỉ rước tối đa 1 Khách
            }
        }

        if (eligibleVisitor != null) {
            visibleVisitors.remove(eligibleVisitor);
            player.getVisitors().add(eligibleVisitor);
            player.setPrestigePoints(player.getPrestigePoints() + eligibleVisitor.getPrestigePoints());
        }
    }

    // =========================================================================
    // CHUYỂN LƯỢT & XÁC ĐỊNH THẮNG CUỘC
    // =========================================================================
    public void endTurn(Game game, String playerId) {
        Player player = getPlayer(game, playerId);
        
        // 1. Tự động rước Khách nếu đủ điều kiện (EXTRA ACTION 2)
        checkAndClaimVisitors(game, player);

        // 2. Kiểm tra kích hoạt Vòng chung kết (15 điểm)
        if (player.getPrestigePoints() >= 15 && !game.getState().isFinalRound()) {
            game.getState().setFinalRound(true);
        }

        // 3. Chuyển lượt sang người kế tiếp
        List<Player> players = game.getState().getPlayers();
        int currentIndex = -1;
        for (int i = 0; i < players.size(); i++) {
            if (players.get(i).getId().equals(playerId)) {
                currentIndex = i;
                break;
            }
        }

        int nextIndex = (currentIndex + 1) % players.size();
        String nextPlayerId = players.get(nextIndex).getId();

        // 4. Nếu đang ở Final Round và đã hoàn thành vòng quay về người đầu tiên -> Kết thúc game
        if (game.getState().isFinalRound() && nextPlayerId.equals(game.getState().getFirstPlayerId())) {
            game.getState().setGameOver(true);
            game.getState().setCurrentTurnPlayerId(null);
            determineWinner(game);
            return;
        }

        game.getState().setCurrentTurnPlayerId(nextPlayerId);
    }

    private void determineWinner(Game game) {
        List<Player> players = game.getState().getPlayers();
        Player winner = players.stream()
                .max((p1, p2) -> {
                    if (p1.getPrestigePoints() != p2.getPrestigePoints()) {
                        return Integer.compare(p1.getPrestigePoints(), p2.getPrestigePoints());
                    }
                    // Hòa điểm: Người có ít thẻ cây đã mua hơn sẽ thắng
                    return Integer.compare(p2.getPurchasedCards().size(), p1.getPurchasedCards().size());
                })
                .orElse(null);

        if (winner != null) {
            game.getState().setWinnerPlayerId(winner.getId());
        }
    }

    // =========================================================================
    // HELPER METHODS
    // =========================================================================
    private void validateTurnAndActive(Game game, String playerId) {
        if (game.getState().isGameOver()) {
            throw new GameException("Trò chơi đã kết thúc.");
        }
        if (!playerId.equals(game.getState().getCurrentTurnPlayerId())) {
            throw new GameException("Chưa đến lượt của bạn.");
        }
    }

    public Player getPlayer(Game game, String playerId) {
        return game.getState().getPlayers().stream()
                .filter(p -> p.getId().equals(playerId))
                .findFirst()
                .orElseThrow(() -> new GameException("Không tìm thấy người chơi: " + playerId));
    }

    private PlantCard findAndRemoveFromList(List<PlantCard> list, String cardId) {
        for (int i = 0; i < list.size(); i++) {
            if (list.get(i).getId().equals(cardId)) {
                return list.remove(i);
            }
        }
        return null;
    }

    private void restoreVisibleCard(Game game, PlantCard card, int tier) {
        switch (tier) {
            case 1 -> game.getState().getVisibleTier1Cards().add(card);
            case 2 -> game.getState().getVisibleTier2Cards().add(card);
            case 3 -> game.getState().getVisibleTier3Cards().add(card);
        }
    }

    private void refillMarket(Game game, int tier) {
        PlantCard newCard = switch (tier) {
            case 1 -> game.getTier1Deck().draw();
            case 2 -> game.getTier2Deck().draw();
            case 3 -> game.getTier3Deck().draw();
            default -> null;
        };

        if (newCard != null) {
            switch (tier) {
                case 1 -> game.getState().getVisibleTier1Cards().add(newCard);
                case 2 -> game.getState().getVisibleTier2Cards().add(newCard);
                case 3 -> game.getState().getVisibleTier3Cards().add(newCard);
            }
        }
        updateDeckCounts(game);
    }
}
