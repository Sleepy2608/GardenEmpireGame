package com.gardenempire.game;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class Game {
    private String id;
    private GameState state;
    
    private Deck<PlantCard> tier1Deck;
    private Deck<PlantCard> tier2Deck;
    private Deck<PlantCard> tier3Deck;
    private Deck<VisitorCard> visitorDeck;
    
    public Game(String id, List<Player> players) {
        this.id = id;
        this.state = GameState.builder()
                .gameId(id)
                .players(new ArrayList<>(players))
                .build();
    }
}
