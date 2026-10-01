package com.gardenempire.service;

import com.gardenempire.room.Room;
import com.gardenempire.room.RoomManager;
import com.gardenempire.room.RoomStatus;
import com.gardenempire.websocket.GameMessageHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomCleanupService {

    private final RoomManager roomManager;
    private final GameService gameService;
    private final GameMessageHandler messageHandler;

    // Map roomId -> lastActivityTimestamp
    private final Map<String, Long> roomLastActivity = new ConcurrentHashMap<>();

    // Inactivity threshold for abandoned rooms: 5 minutes (300,000 ms)
    private static final long IDLE_THRESHOLD_MS = 5 * 60 * 1000L;
    // Finished game retention threshold: 2 minutes (120,000 ms)
    private static final long FINISHED_THRESHOLD_MS = 2 * 60 * 1000L;

    public void recordActivity(String roomId) {
        if (roomId != null) {
            roomLastActivity.put(roomId, System.currentTimeMillis());
        }
    }

    public void removeTracking(String roomId) {
        if (roomId != null) {
            roomLastActivity.remove(roomId);
        }
    }

    /**
     * Tự động dọn dẹp phòng bỏ hoang hoặc đã kết thúc định kỳ mỗi 60 giây.
     */
    @Scheduled(fixedRate = 60000)
    public void cleanupIdleAndFinishedRooms() {
        long now = System.currentTimeMillis();

        for (Room room : roomManager.getAllRooms()) {
            String roomId = room.getId();
            long lastActive = roomLastActivity.getOrDefault(roomId, now);
            long inactiveDuration = now - lastActive;

            int activeWsCount = messageHandler.getActiveSessionCount(roomId);

            // 1. Tự động giải phóng phòng đã kết thúc sau 2 phút
            if (room.getStatus() == RoomStatus.FINISHED && inactiveDuration > FINISHED_THRESHOLD_MS) {
                log.info("🧹 [Tự Động Dọn Dẹp] Giải phóng phòng đã kết thúc: roomId={}", roomId);
                deleteRoomCompletely(roomId);
                continue;
            }

            // 2. Tự động giải phóng phòng bỏ hoang (không có ai kết nối WebSocket trong 5 phút)
            if (activeWsCount == 0 && inactiveDuration > IDLE_THRESHOLD_MS) {
                log.info("🧹 [Tự Động Dọn Dẹp] Giải phóng phòng bỏ hoang (idle > 5 phút): roomId={}", roomId);
                deleteRoomCompletely(roomId);
            }
        }
    }

    public void deleteRoomCompletely(String roomId) {
        roomManager.removeRoom(roomId);
        gameService.removeGame(roomId);
        messageHandler.cleanRoom(roomId);
        roomLastActivity.remove(roomId);
    }
}
