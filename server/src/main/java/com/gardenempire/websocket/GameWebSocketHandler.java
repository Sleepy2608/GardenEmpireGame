package com.gardenempire.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@Slf4j
@Component
@RequiredArgsConstructor
public class GameWebSocketHandler extends TextWebSocketHandler {

    private final GameMessageHandler gameMessageHandler;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String gameId = getQueryParam(session.getUri(), "gameId");
        if (gameId != null) {
            gameMessageHandler.registerSession(gameId, session);
            log.info("WebSocket kết nối: gameId={}, sessionId={}", gameId, session.getId());
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        String gameId = getQueryParam(session.getUri(), "gameId");
        if (gameId != null) {
            gameMessageHandler.handleMessage(session, gameId, message.getPayload());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String gameId = getQueryParam(session.getUri(), "gameId");
        if (gameId != null) {
            gameMessageHandler.removeSession(gameId, session.getId());
            log.info("WebSocket ngắt kết nối: gameId={}, sessionId={}", gameId, session.getId());
        }
    }

    private String getQueryParam(URI uri, String paramName) {
        if (uri == null) return null;
        return UriComponentsBuilder.fromUri(uri).build()
                .getQueryParams().getFirst(paramName);
    }
}
