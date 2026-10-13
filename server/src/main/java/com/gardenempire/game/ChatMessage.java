package com.gardenempire.game;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Thực thể lưu trữ một tin nhắn chat trong ván đấu Garden Empire
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private String id;           // UUID nhận diện tin nhắn
    private long timestamp;      // Thời điểm gửi (epoch millis)
    private String playerId;     // ID người chơi gửi (null nếu là hệ thống)
    private String playerName;   // Tên người chơi gửi
    private String playerAvatar; // Linh vật đại diện (🌱, 🌺, 🍄, ...)
    private String content;      // Nội dung tin nhắn (đã sanitize HTML & giới hạn độ dài)
}
