package com.gardenempire.game;

import com.gardenempire.exception.GameException;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class GameEngine {

    public Game createNewGame(String gameId, List<Player> players) {
        Game game = new Game(gameId, players);
        initializeDecksAndMarket(game);
        initializeBank(game, players.size());
        
        // Random starting player
        if (!players.isEmpty()) {
            game.getState().setCurrentTurnPlayerId(players.get(0).getId());
        }
        
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
                bank.put(res, 5); // 5 Wild fertilizers
            } else {
                bank.put(res, tokenCount);
            }
        }
        game.getState().setResourceBank(bank);
    }

    private void initializeDecksAndMarket(Game game) {
        // Setup mock/starter decks
        game.setTier1Deck(new Deck<>(createSamplePlantCards(1, 40)));
        game.setTier2Deck(new Deck<>(createSamplePlantCards(2, 30)));
        game.setTier3Deck(new Deck<>(createSamplePlantCards(3, 20)));
        game.setVisitorDeck(new Deck<>(createSampleVisitors(10)));

        // Reveal 4 cards per tier
        for (int i = 0; i < 4; i++) {
            PlantCard c1 = game.getTier1Deck().draw();
            if (c1 != null) game.getState().getVisibleTier1Cards().add(c1);

            PlantCard c2 = game.getTier2Deck().draw();
            if (c2 != null) game.getState().getVisibleTier2Cards().add(c2);

            PlantCard c3 = game.getTier3Deck().draw();
            if (c3 != null) game.getState().getVisibleTier3Cards().add(c3);
        }

        // Reveal visitors: playerCount + 1
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

    private List<PlantCard> createSamplePlantCards(int tier, int count) {
        List<PlantCard> list = new ArrayList<>();
        Resource[] resources = {Resource.EARTH, Resource.WATER, Resource.SUNLIGHT, Resource.SEED, Resource.NUTRIENTS};
        Random rand = new Random();

        for (int i = 1; i <= count; i++) {
            Resource bonus = resources[rand.nextInt(resources.length)];
            Map<Resource, Integer> cost = new EnumMap<>(Resource.class);
            cost.put(resources[rand.nextInt(resources.length)], tier + rand.nextInt(2));
            if (tier > 1) {
                cost.put(resources[rand.nextInt(resources.length)], tier);
            }

            int points = (tier == 1) ? (rand.nextDouble() > 0.7 ? 1 : 0) : (tier == 2 ? 1 + rand.nextInt(3) : 3 + rand.nextInt(3));

            list.add(PlantCard.builder()
                    .id("plant_t" + tier + "_" + i)
                    .tier(tier)
                    .prestigePoints(points)
                    .bonusResource(bonus)
                    .cost(cost)
                    .build());
        }
        return list;
    }

    private List<VisitorCard> createSampleVisitors(int count) {
        List<VisitorCard> list = new ArrayList<>();
        Resource[] resources = {Resource.EARTH, Resource.WATER, Resource.SUNLIGHT, Resource.SEED, Resource.NUTRIENTS};
        Random rand = new Random();

        for (int i = 1; i <= count; i++) {
            Map<Resource, Integer> req = new EnumMap<>(Resource.class);
            req.put(resources[rand.nextInt(resources.length)], 3 + rand.nextInt(2));
            req.put(resources[rand.nextInt(resources.length)], 3 + rand.nextInt(2));

            list.add(VisitorCard.builder()
                    .id("visitor_" + i)
                    .prestigePoints(3)
                    .requirements(req)
                    .build());
        }
        return list;
    }
}
