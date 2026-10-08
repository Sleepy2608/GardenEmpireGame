package com.gardenempire.integration;

import com.gardenempire.dto.CreateRoomRequest;
import com.gardenempire.dto.GameActionRequest;
import com.gardenempire.dto.JoinRoomRequest;
import com.gardenempire.game.*;
import com.gardenempire.room.Room;
import com.gardenempire.room.RoomStatus;
import com.gardenempire.service.GameService;
import com.gardenempire.service.RoomService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class MultiPlayerGameFlowIntegrationTest {

    @Autowired
    private RoomService roomService;

    @Autowired
    private GameService gameService;

    @Test
    @DisplayName("E2E Multi-Player Lifecycle: Room Creation -> Join -> Turn Progression -> Actions -> Victory")
    void testCompleteMultiPlayerGameFlow() {
        // 1. Create Room by Host (Alice)
        Player host = Player.builder().id("p1").name("Alice").avatar("🌿").build();
        CreateRoomRequest createReq = new CreateRoomRequest();
        createReq.setRoomName("Phòng Vườn E2E");
        createReq.setMaxPlayers(3);
        createReq.setHostPlayer(host);

        Room room = roomService.createRoom(createReq);
        String roomId = room.getId();

        assertNotNull(room);
        assertEquals(RoomStatus.WAITING, room.getStatus());
        assertEquals(1, room.getPlayers().size());

        // 2. Player 2 (Bob) and Player 3 (Charlie) Join
        JoinRoomRequest joinBob = new JoinRoomRequest();
        joinBob.setId("p2");
        joinBob.setName("Bob");
        joinBob.setAvatar("💧");
        roomService.joinRoom(roomId, joinBob);

        JoinRoomRequest joinCharlie = new JoinRoomRequest();
        joinCharlie.setId("p3");
        joinCharlie.setName("Charlie");
        joinCharlie.setAvatar("☀️");
        roomService.joinRoom(roomId, joinCharlie);

        assertEquals(3, room.getPlayers().size());

        // 3. Host Starts Game
        roomService.startGame(roomId, host.getId());
        assertEquals(RoomStatus.PLAYING, room.getStatus());

        // 4. Verify Initial Game State for 3 Players
        GameState state = gameService.getGameState(roomId);
        assertNotNull(state);
        assertEquals(3, state.getPlayers().size());
        assertTrue(List.of("p1", "p2", "p3").contains(state.getCurrentTurnPlayerId()));
        // Đặt lượt về p1 để tiếp tục kịch bản tuần tự của integration test
        state.setCurrentTurnPlayerId("p1");
        state.setFirstPlayerId("p1");
        // For 3 players: Bank has 5 of each base resource and 5 Wilds
        assertEquals(5, state.getResourceBank().get(Resource.DIRT));
        assertEquals(5, state.getResourceBank().get(Resource.NUTRIENTS));
        assertEquals(5, state.getResourceBank().get(Resource.WILD));

        // 5. Action 1: Player 1 (Alice) takes 3 distinct tokens (DIRT, WATER, SUNLIGHT)
        Map<Resource, Integer> takeTokensP1 = Map.of(
                Resource.DIRT, 1,
                Resource.WATER, 1,
                Resource.SUNLIGHT, 1
        );
        GameActionRequest action1 = new GameActionRequest();
        action1.setType("TAKE_RESOURCES");
        action1.setGameId(roomId);
        action1.setPlayerId("p1");
        action1.setSelectedTokens(takeTokensP1);

        state = gameService.processAction(roomId, action1);
        assertEquals("p2", state.getCurrentTurnPlayerId(), "Turn should rotate to Bob (p2)");
        assertEquals(1, state.getPlayers().get(0).getTokens().get(Resource.DIRT));
        assertEquals(1, state.getPlayers().get(0).getTokens().get(Resource.WATER));
        assertEquals(1, state.getPlayers().get(0).getTokens().get(Resource.SUNLIGHT));
        assertEquals(4, state.getResourceBank().get(Resource.DIRT));

        // 6. Action 2: Player 2 (Bob) takes 2 same tokens (NUTRIENTS x2)
        Map<Resource, Integer> takeTokensP2 = Map.of(
                Resource.NUTRIENTS, 2
        );
        GameActionRequest action2 = new GameActionRequest();
        action2.setType("TAKE_RESOURCES");
        action2.setGameId(roomId);
        action2.setPlayerId("p2");
        action2.setSelectedTokens(takeTokensP2);

        state = gameService.processAction(roomId, action2);
        assertEquals("p3", state.getCurrentTurnPlayerId(), "Turn should rotate to Charlie (p3)");
        assertEquals(2, state.getPlayers().get(1).getTokens().get(Resource.NUTRIENTS));
        assertEquals(3, state.getResourceBank().get(Resource.NUTRIENTS));

        // 7. Action 3: Player 3 (Charlie) reserves a visible Tier 1 card
        PlantCard cardToReserve = state.getVisibleTier1Cards().get(0);
        String cardIdToReserve = cardToReserve.getId();

        GameActionRequest action3 = new GameActionRequest();
        action3.setType("RESERVE_PLANT");
        action3.setGameId(roomId);
        action3.setPlayerId("p3");
        action3.setCardId(cardIdToReserve);

        state = gameService.processAction(roomId, action3);
        assertEquals("p1", state.getCurrentTurnPlayerId(), "Turn should wrap around to Alice (p1)");
        assertEquals(1, state.getPlayers().get(2).getTokens().get(Resource.WILD), "Should receive 1 Wild token on reserve");
        assertEquals(1, state.getPlayers().get(2).getReservedCards().size());
        assertEquals(cardIdToReserve, state.getPlayers().get(2).getReservedCards().get(0).getId());

        // 8. Test Excess Token Return Workflow
        Player p1 = state.getPlayers().get(0);
        // Total tokens: 6 DIRT + 6 WATER + 1 SUNLIGHT = 13 tokens (excess 3)
        p1.getTokens().put(Resource.DIRT, 6);
        p1.getTokens().put(Resource.WATER, 6);

        Map<Resource, Integer> returnTokens = Map.of(
                Resource.DIRT, 3
        );
        GameActionRequest returnAction = new GameActionRequest();
        returnAction.setType("RETURN_TOKENS");
        returnAction.setGameId(roomId);
        returnAction.setPlayerId("p1");
        returnAction.setReturnedTokens(returnTokens);

        state = gameService.processAction(roomId, returnAction);
        assertEquals(3, p1.getTokens().get(Resource.DIRT));

        // 9. Test Victory Condition & Tiebreaker
        p1.setPrestigePoints(15);
        state.setFinalRound(true);
        // Player 2 gets 15 points but with 2 cards vs Player 1 having 5 cards
        Player p2 = state.getPlayers().get(1);
        p2.setPrestigePoints(15);
        p2.getPurchasedCards().add(cardToReserve);
        p2.getPurchasedCards().add(cardToReserve);

        p1.getPurchasedCards().addAll(List.of(cardToReserve, cardToReserve, cardToReserve, cardToReserve, cardToReserve));

        // Finish round (p1 turn -> p2 turn -> p3 turn ends round)
        state.setCurrentTurnPlayerId("p3");
        GameActionRequest p3PassAction = new GameActionRequest();
        p3PassAction.setType("TAKE_RESOURCES");
        p3PassAction.setGameId(roomId);
        p3PassAction.setPlayerId("p3");
        p3PassAction.setSelectedTokens(Map.of(Resource.SEED, 1, Resource.NUTRIENTS, 1, Resource.DIRT, 1));

        state = gameService.processAction(roomId, p3PassAction);
        assertTrue(state.isGameOver(), "Game should be finished after final round ends");
        assertEquals("p2", state.getWinnerPlayerId(), "Bob (p2) should win tiebreaker with fewer cards (2 vs 5)");
    }
}
