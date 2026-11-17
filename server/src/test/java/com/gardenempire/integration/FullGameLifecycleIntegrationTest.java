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
class FullGameLifecycleIntegrationTest {

    @Autowired
    private RoomService roomService;

    @Autowired
    private GameService gameService;

    @Test
    @DisplayName("Master Lifecycle: Custom Turn Duration -> AFK Strike System -> Bot Takeover -> Walkover Victory")
    void testFullGameLifecycleAndNewFeatures() {
        // =========================================================================
        // 1. Create Room & Host Updates Turn Duration to 120s
        // =========================================================================
        Player host = Player.builder().id("master-p1").name("Mai Anh").avatar("🌸").build();
        CreateRoomRequest createReq = new CreateRoomRequest();
        createReq.setRoomName("Vườn Thực Vật Hoàng Gia");
        createReq.setMaxPlayers(3);
        createReq.setHostPlayer(host);

        Room room = roomService.createRoom(createReq);
        String roomId = room.getId();

        assertNotNull(room);
        assertEquals(RoomStatus.WAITING, room.getStatus());

        // Host cập nhật thời gian lượt 120s trong phòng chờ
        room = roomService.updateRoomSettings(roomId, host.getId(), 120);
        assertEquals(120, room.getTurnDurationSeconds(), "Phòng phải lưu thời gian lượt 120s");

        // 2. Join 2 other players: Bob and Charlie
        JoinRoomRequest joinBob = new JoinRoomRequest();
        joinBob.setId("master-p2");
        joinBob.setName("Bảo Long");
        joinBob.setAvatar("🎋");
        roomService.joinRoom(roomId, joinBob);

        JoinRoomRequest joinCharlie = new JoinRoomRequest();
        joinCharlie.setId("master-p3");
        joinCharlie.setName("Cát Tường");
        joinCharlie.setAvatar("🌺");
        roomService.joinRoom(roomId, joinCharlie);

        assertEquals(3, room.getPlayers().size());

        // 3. Host starts game
        roomService.startGame(roomId, host.getId());
        assertEquals(RoomStatus.PLAYING, room.getStatus());

        GameState state = gameService.getGameState(roomId);
        assertNotNull(state);
        assertEquals(120, state.getTurnDurationSeconds(), "GameState kế thừa thời gian lượt 120s từ phòng");
        assertEquals(3, state.getPlayers().size());

        // Set current turn to master-p1 for deterministic assertion flow
        state.setCurrentTurnPlayerId("master-p1");
        state.setFirstPlayerId("master-p1");

        // =========================================================================
        // 2. Turn 1: Player 1 takes 3 distinct tokens (DIRT, WATER, SUNLIGHT)
        // =========================================================================
        GameActionRequest act1 = new GameActionRequest();
        act1.setType("TAKE_RESOURCES");
        act1.setGameId(roomId);
        act1.setPlayerId("master-p1");
        act1.setSelectedTokens(Map.of(Resource.DIRT, 1, Resource.WATER, 1, Resource.SUNLIGHT, 1));

        state = gameService.processAction(roomId, act1);
        assertEquals("master-p2", state.getCurrentTurnPlayerId(), "Lượt chuyển sang Bảo Long (master-p2)");

        // =========================================================================
        // 3. AFK Strike 1 Simulation for Player 2
        // =========================================================================
        // Hết giờ lượt 1 của Player 2
        gameService.handleTurnTimeout(roomId, "master-p2");

        Player p2 = state.getPlayers().stream().filter(p -> p.getId().equals("master-p2")).findFirst().orElseThrow();
        assertEquals(1, p2.getConsecutiveAfkCount(), "Bảo Long phải bị tính Strike 1 cảnh báo AFK");
        assertFalse(p2.isBot(), "Bảo Long chưa biến thành bot sau Strike 1");

        // =========================================================================
        // 4. Smart Bot Takeover: Replaces Player 2 when disconnected or enabled
        // =========================================================================
        // Player 2 mất kết nối hoặc thoát -> Thay thế bằng Bot thông minh
        gameService.handlePlayerLeave(roomId, "master-p2", true);
        assertTrue(p2.isBot(), "Bảo Long tự động được tiếp quản bởi Bot AI thông minh");

        // Đặt lượt tới Bảo Long (Bot)
        state.setCurrentTurnPlayerId("master-p2");
        state.setTurnStartTime(System.currentTimeMillis());

        // Thực thi nước đi tự động của bot
        gameService.executeBotTurn(roomId, "master-p2");
        assertNotEquals("master-p2", state.getCurrentTurnPlayerId(), "Lượt đã chuyển sang người chơi kế tiếp sau khi Bot hành động");

        // =========================================================================
        // 5. In-Game Chat System
        // =========================================================================
        GameActionRequest chatReq = new GameActionRequest();
        chatReq.setType("SEND_CHAT");
        chatReq.setGameId(roomId);
        chatReq.setPlayerId("master-p1");
        chatReq.setMessage("Chúc mọi người chơi vui vẻ!");

        state = gameService.processAction(roomId, chatReq);
        assertNotNull(state.getChatMessages());
        assertFalse(state.getChatMessages().isEmpty());
        assertEquals("Mai Anh", state.getChatMessages().get(0).getPlayerName());
        assertEquals("Chúc mọi người chơi vui vẻ!", state.getChatMessages().get(0).getContent());

        // =========================================================================
        // 6. Walkover Victory: When opponents leave
        // =========================================================================
        // Player 3 rời ván đấu hoàn toàn (không bot)
        gameService.handlePlayerLeave(roomId, "master-p3", false);
        Player p3 = state.getPlayers().stream().filter(p -> p.getId().equals("master-p3")).findFirst().orElseThrow();
        assertTrue(p3.isHasLeft(), "Cát Tường đã rời ván");

        // Bot Bảo Long cũng rời ván đấu
        gameService.handlePlayerLeave(roomId, "master-p2", false);
        assertTrue(p2.isHasLeft(), "Bảo Long đã rời ván");

        // Chỉ còn lại duy nhất Player 1 -> Kích hoạt Walkover Victory
        assertTrue(state.isGameOver(), "Ván đấu kết thúc ngay lập tức khi chỉ còn 1 người sống sót");
        assertEquals("master-p1", state.getWinnerPlayerId(), "Mai Anh giành chiến thắng Walkover áp đảo");

        // Action logs ghi nhận chiến thắng
        assertFalse(state.getActionLogs().isEmpty(), "Có action logs ghi nhận");
        assertTrue(state.getActionLogs().stream().anyMatch(log -> "GAME_OVER".equals(log.getActionType())), "Logs ghi nhận sự kiện chiến thắng GAME_OVER");
    }
}
