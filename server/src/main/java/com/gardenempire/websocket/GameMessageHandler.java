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

    public void registerSession(String gameId, WebSocketSession session) {
        gameSessions.computeIfAbsent(gameId, k -> new ConcurrentHashMap<>()).put(session.getId(), session);
        
        // Broadcast current game state upon join
        try {
            GameState state = gameService.getGameState(gameId);
            sendToSession(session, new GameStateResponse("GAME_STATE_UPDATE", state));
        } catch (Exception e) {
            log.warn("Chưa có game state hoặc lỗi: {}", e.getMessage());
        }
    }

    public void removeSession(String gameId, String sessionId) {
        Map<String, WebSocketSession> sessions = gameSessions.get(gameId);
        if (sessions != null) {
            sessions.remove(sessionId);
            if (sessions.isEmpty()) {
                gameSessions.remove(gameId);
            }
        }
    }

    public void handleMessage(String gameId, String payload) {
        try {
            GameActionRequest action = objectMapper.readValue(payload, GameActionRequest.class);
            GameState updatedState = gameService.processAction(gameId, action);
            broadcastGameState(gameId, updatedState);
        } catch (Exception e) {
            log.error("Lỗi xử lý tin nhắn websocket: ", e);
        }
    }

    public void broadcastGameState(String gameId, GameState state) {
        Map<String, WebSocketSession> sessions = gameSessions.get(gameId);
        if (sessions != null) {
            GameStateResponse res = new GameStateResponse("GAME_STATE_UPDATE", state);
            sessions.values().forEach(session -> sendToSession(session, res));
        }
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
