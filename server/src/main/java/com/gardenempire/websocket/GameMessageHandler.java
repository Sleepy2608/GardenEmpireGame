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
    
    private final Map<String, Map<String, WebSocketSession>> gameSessions = new ConcurrentHashMap<>();
    private final Map<String, Map<String, String>> playerSessions = new ConcurrentHashMap<>();
    // Quản lý phiên toàn cục theo playerId để phát hiện người chơi đăng nhập ở nhiều nơi
    record GlobalSessionInfo(String gameId, String sessionId, WebSocketSession session) {}
    private final Map<String, GlobalSessionInfo> globalPlayerSessions = new ConcurrentHashMap<>();

    public void registerSession(String gameId, String playerId, WebSocketSession session) {
        Map<String, WebSocketSession> sessions = gameSessions.computeIfAbsent(gameId, k -> new ConcurrentHashMap<>());
        Map<String, String> players = playerSessions.computeIfAbsent(gameId, k -> new ConcurrentHashMap<>());

        // Nếu người chơi đã có phiên hoạt động từ trước (tab khác hoặc thiết bị khác)
        if (playerId != null) {
            GlobalSessionInfo oldInfo = globalPlayerSessions.put(playerId, new GlobalSessionInfo(gameId, session.getId(), session));
            if (oldInfo != null && !oldInfo.sessionId().equals(session.getId())) {
                WebSocketSession oldSession = oldInfo.session();
                if (oldSession != null && oldSession.isOpen()) {
                    try {
                        Map<String, Object> kickMsg = Map.of(
                            "type", "SESSION_TERMINATED",
                            "reason", "DUPLICATE_LOGIN",
                            "message", "Đã đăng nhập ở một tab hoặc thiết bị khác."
                        );
                        sendToSession(oldSession, kickMsg);
                        oldSession.close();
                        log.info("Đã ngắt phiên WebSocket cũ do trùng lặp: playerId={}, oldSessionId={}, newSessionId={}",
                                playerId, oldInfo.sessionId(), session.getId());
                    } catch (Exception e) {
                        log.warn("Lỗi khi ngắt phiên cũ: {}", e.getMessage());
                    }
                }
                // Dọn session cũ khỏi game cũ nếu khác gameId
                Map<String, WebSocketSession> oldGameSessions = gameSessions.get(oldInfo.gameId());
                if (oldGameSessions != null) {
                    oldGameSessions.remove(oldInfo.sessionId());
                }
            }
            players.put(playerId, session.getId());
        }

        sessions.put(session.getId(), session);
        
        // Immediately send current game state upon join / reconnect
        try {
            GameState state = gameService.getGameState(gameId, playerId);
            if (state != null) {
                sendToSession(session, new GameStateResponse("GAME_STATE_UPDATE", state));
            }
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
            globalPlayerSessions.computeIfPresent(playerId, (id, info) ->
                info.sessionId().equals(sessionId) ? null : info
            );
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
            if (updatedState != null) {
                broadcastGameState(gameId, updatedState);
            }
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

    /**
     * Gửi sự kiện YOU_ARE_KICKED đến đúng session của người bị kick.
     * Những người khác đã nhận ROOM_UPDATE trước đó.
     */
    public void broadcastPlayerKicked(String roomId, String kickedPlayerId) {
        Map<String, String> players = playerSessions.get(roomId);
        Map<String, WebSocketSession> sessions = gameSessions.get(roomId);
        if (players == null || sessions == null) return;

        String sessionId = players.get(kickedPlayerId);
        if (sessionId == null) return;

        WebSocketSession session = sessions.get(sessionId);
        Map<String, Object> message = new java.util.LinkedHashMap<>();
        message.put("type", "YOU_ARE_KICKED");
        message.put("roomId", roomId);
        sendToSession(session, message);
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
