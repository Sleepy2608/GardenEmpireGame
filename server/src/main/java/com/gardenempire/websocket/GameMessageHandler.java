package com.gardenempire.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gardenempire.dto.GameActionRequest;
import com.gardenempire.dto.GameStateResponse;
import com.gardenempire.game.GameState;
import com.gardenempire.service.GameService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class GameMessageHandler {
    private final GameService gameService;
    private final ObjectMapper objectMapper;
    
    // Map gameId -> Map(sessionId -> WebSocketSession)
    private final Map<String, Map<String, WebSocketSession>> gameSessions = new ConcurrentHashMap<>();
    // Map gameId -> Map(playerId -> sessionId)
    private final Map<String, Map<String, String>> playerSessions = new ConcurrentHashMap<>();

    public void registerSession(String gameId, String playerId, WebSocketSession session) {
        Map<String, WebSocketSession> sessions = gameSessions.computeIfAbsent(gameId, k -> new ConcurrentHashMap<>());
        Map<String, String> players = playerSessions.computeIfAbsent(gameId, k -> new ConcurrentHashMap<>());

        // If player previously had an active session (e.g. before F5 refresh), close and replace it
        if (playerId != null) {
            String oldSessionId = players.put(playerId, session.getId());
            if (oldSessionId != null && !oldSessionId.equals(session.getId())) {
                WebSocketSession oldSession = sessions.remove(oldSessionId);
                if (oldSession != null && oldSession.isOpen()) {
                    try {
                        oldSession.close();
                    } catch (Exception ignored) {}
                }
            }
        }

        sessions.put(session.getId(), session);
        
        // Immediately send current game state upon join / reconnect
        try {
            GameState state = gameService.getGameState(gameId);
            sendToSession(session, new GameStateResponse("GAME_STATE_UPDATE", state));
        } catch (Exception e) {
            log.warn("Chưa có game state hoặc lỗi khi nạp: {}", e.getMessage());
        }
    }

    public void removeSession(String gameId, String playerId, String sessionId) {
        Map<String, WebSocketSession> sessions = gameSessions.get(gameId);
        if (sessions != null) {
            sessions.remove(sessionId);
            if (sessions.isEmpty()) {
                gameSessions.remove(gameId);
            }
        }
        if (playerId != null) {
            Map<String, String> players = playerSessions.get(gameId);
            if (players != null) {
                players.remove(playerId, sessionId);
                if (players.isEmpty()) {
                    playerSessions.remove(gameId);
                }
            }
        }
    }

    public void handleMessage(WebSocketSession session, String gameId, String payload) {
        try {
            GameActionRequest action = objectMapper.readValue(payload, GameActionRequest.class);
            if (action.getGameId() == null) {
                action.setGameId(gameId);
            }
            GameState updatedState = gameService.processAction(gameId, action);
            broadcastGameState(gameId, updatedState);
        } catch (com.gardenempire.exception.GameException ge) {
            log.warn("Lỗi logic game cho gameId={}: {}", gameId, ge.getMessage());
            Map<String, Object> err = Map.of("type", "ERROR", "message", ge.getMessage());
            sendToSession(session, err);
        } catch (Exception e) {
            log.error("Lỗi xử lý tin nhắn websocket: ", e);
            Map<String, Object> err = Map.of("type", "ERROR", "message", "Hành động không hợp lệ: " + e.getMessage());
            sendToSession(session, err);
        }
    }

    public void broadcastGameState(String gameId, GameState state) {
        Map<String, WebSocketSession> sessions = gameSessions.get(gameId);
        if (sessions != null) {
            GameStateResponse res = new GameStateResponse("GAME_STATE_UPDATE", state);
            sessions.values().forEach(session -> sendToSession(session, res));
        }
    }

    public int getActiveSessionCount(String gameId) {
        Map<String, WebSocketSession> sessions = gameSessions.get(gameId);
        if (sessions == null) return 0;
        return (int) sessions.values().stream().filter(WebSocketSession::isOpen).count();
    }

    /**
     * Broadcast cập nhật danh sách phòng (khi có người vào/ra/rời phòng)
     * Frontend lắng nghe type = "ROOM_UPDATE"
     */
    public void broadcastRoomUpdate(String roomId, com.gardenempire.room.Room room) {
        Map<String, Object> message = new java.util.LinkedHashMap<>();
        message.put("type", "ROOM_UPDATE");
        message.put("room", room);
        broadcastToRoom(roomId, message);
    }

    /**
     * Broadcast sự kiện bắt đầu game cho toàn bộ client trong phòng chờ
     * Frontend lắng nghe type = "GAME_STARTED"
     */
    public void broadcastGameStarted(String roomId, String gameId) {
        Map<String, Object> message = new java.util.LinkedHashMap<>();
        message.put("type", "GAME_STARTED");
        message.put("roomId", roomId);
        message.put("gameId", gameId);
        broadcastToRoom(roomId, message);
    }

    /** Gửi 1 message tới tất cả sessions đang mở trong 1 game/room */
    private void broadcastToRoom(String roomId, Object message) {
        Map<String, WebSocketSession> sessions = gameSessions.get(roomId);
        if (sessions != null) {
            sessions.values().forEach(session -> sendToSession(session, message));
        }
    }

    public void cleanRoom(String gameId) {
        Map<String, WebSocketSession> sessions = gameSessions.remove(gameId);
        if (sessions != null) {
            sessions.values().forEach(s -> {
                if (s.isOpen()) {
                    try {
                        s.close();
                    } catch (Exception ignored) {}
                }
            });
        }
        playerSessions.remove(gameId);
    }

    private void sendToSession(WebSocketSession session, Object message) {
        if (session != null && session.isOpen()) {
            try {
                String json = objectMapper.writeValueAsString(message);
                session.sendMessage(new TextMessage(json));
            } catch (IOException e) {
                log.error("Lỗi gửi tin nhắn qua WebSocket: ", e);
            }
        }
    }
}
