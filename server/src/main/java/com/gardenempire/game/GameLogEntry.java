package com.gardenempire.game;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Thực thể lưu trữ một mục nhật ký hành động trong ván đấu Garden Empire
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameLogEntry {
    private String id;           // UUID ngắn nhận diện mục log
    private long timestamp;      // Thời điểm ghi nhận (epoch millis)
    private String playerId;     // ID người chơi thực hiện (null nếu là sự kiện hệ thống)
    private String playerName;   // Tên người chơi
    private String playerAvatar; // Linh vật đại diện (🌱, 🌺, 🍄, ...)
    private String actionType;   // Loại hành động (TAKE_TOKENS_DISTINCT, BUY_CARD_BOARD, ...)
    private String message;      // Thông điệp tiếng Việt đầy đủ
    private Map<String, Object> details; // Metadata chi tiết bổ sung
}
