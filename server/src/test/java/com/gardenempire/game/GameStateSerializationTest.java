package com.gardenempire.game;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import java.util.List;

public class GameStateSerializationTest {

    @Test
    void testJsonKeys() throws Exception {
        GameState state = GameState.builder()
                .gameId("test-game")
                .isGameOver(true)
                .isFinalRound(true)
                .players(List.of(
                        Player.builder().id("p1").name("Alice").isHost(true).hasLeft(false).build()
                ))
                .build();

        ObjectMapper mapper = new ObjectMapper();
        String json = mapper.writeValueAsString(state);
        System.out.println("SERIALIZED_JSON: " + json);
    }
}

