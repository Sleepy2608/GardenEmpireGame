package com.gardenempire.service;

import com.gardenempire.dto.CreateRoomRequest;
import com.gardenempire.dto.JoinRoomRequest;
import com.gardenempire.exception.GameException;
import com.gardenempire.game.Player;
import com.gardenempire.room.Room;
import com.gardenempire.room.RoomManager;
import com.gardenempire.room.RoomStatus;
import com.gardenempire.websocket.GameMessageHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class RoomService {
    private final RoomManager roomManager;
    private final GameService gameService;
    private final RoomCleanupService cleanupService;
    private final GameMessageHandler messageHandler;

    // Map<RoomId, Map<PlayerId, ExpireTimestamp>> — dùng cho kick ng khác
    // kick cooldown: 2 phút
    private final Map<String, Map<String, Long>> kickedCooldownMap = new ConcurrentHashMap<>();

    public List<Room> getAllRooms() {
        return roomManager.getAllRooms().stream()
                .filter(r -> r.getStatus() == RoomStatus.WAITING)
                .toList();
    }

    public Room getRoomById(String roomId) {
        return roomManager.getRoom(roomId)
                .orElseThrow(() -> new GameException("Không tìm thấy phòng với ID: " + roomId));
    }

    public Room createRoom(CreateRoomRequest request) {
        String roomId = "GARDEN-" + (int)(Math.random() * 9000 + 1000);
        Player host = request.getHostPlayer();
        if (host.getAvatar() == null || host.getAvatar().isBlank()) {
            host.setAvatar("🌱");
        }
        host.setHost(true);

        int maxPlayers = request.getMaxPlayers();
        if (maxPlayers < 2 || maxPlayers > 4) {
            maxPlayers = 4;
        }

        Room room = Room.builder()
                .id(roomId)
                .code(roomId)
                .name(request.getRoomName())
                .hostId(host.getId())
                .hostName(host.getName())
                .hostAvatar(host.getAvatar())
                .maxPlayers(maxPlayers)
                .status(RoomStatus.WAITING)
                .gameId(roomId)
                .build();

        room.getPlayers().add(host);
        roomManager.addRoom(room);
        cleanupService.recordActivity(roomId);
        return room;
    }

    public Room joinRoom(String roomId, JoinRoomRequest request) {
        Room room = getRoomById(roomId);

        // Kiểm tra cooldown 2 phút nếu người chơi đã bị kick
        Long expireTime = kickedCooldownMap
                .getOrDefault(roomId, Map.of())
                .get(request.getId());
        if (expireTime != null && System.currentTimeMillis() < expireTime) {
            long remainingSec = (expireTime - System.currentTimeMillis()) / 1000;
            long mins = remainingSec / 60;
            long secs = remainingSec % 60;
            String timeStr = mins > 0 ? mins + " phút " + secs + " giây" : secs + " giây";
            throw new GameException("Bạn đã bị chủ phòng mời ra. Vui lòng chờ thêm " + timeStr + " để vào lại phòng này.");
        }

        if (room.getStatus() != RoomStatus.WAITING) {
            throw new GameException("Phòng đã bắt đầu hoặc đã kết thúc");
        }

        if (room.getPlayers().size() >= room.getMaxPlayers()) {
            throw new GameException("Phòng đã đầy");
        }

        boolean alreadyInRoom = room.getPlayers().stream()
                .anyMatch(p -> p.getId().equals(request.getId()));

        if (!alreadyInRoom) {
            Player newPlayer = Player.builder()
                    .id(request.getId())
                    .name(request.getName())
                    .avatar(request.getAvatar() != null && !request.getAvatar().isBlank() ? request.getAvatar() : "🌱")
                    .isHost(false)
                    .build();
            room.getPlayers().add(newPlayer);

            try {
                com.gardenempire.game.Game activeGame = gameService.getGame(roomId);
                if (activeGame != null && activeGame.getState().getPlayers().stream().noneMatch(p -> p.getId().equals(newPlayer.getId()))) {
                    activeGame.getState().getPlayers().add(newPlayer);
                }
            } catch (Exception ignored) {}
        }

        cleanupService.recordActivity(roomId);
        // Broadcast cập nhật danh sách người chơi cho phòng chờ
        messageHandler.broadcastRoomUpdate(roomId, room);
        return room;
    }

    public Room joinRoomByCode(com.gardenempire.dto.JoinByCodeRequest request) {
        JoinRoomRequest joinRequest = new JoinRoomRequest();
        joinRequest.setId(request.getId());
        joinRequest.setName(request.getName());
        joinRequest.setAvatar(request.getAvatar());
        return joinRoom(request.getCode(), joinRequest);
    }

    public Room leaveRoom(String roomId, String playerId) {
        Room room = getRoomById(roomId);
        room.getPlayers().removeIf(p -> p.getId().equals(playerId));

        if (room.getPlayers().isEmpty()) {
            cleanupService.deleteRoomCompletely(roomId);
            return null;
        }

        // Nếu chủ phòng rời, chuyển giao quyền cho người tiếp theo
        if (playerId.equals(room.getHostId())) {
            Player newHost = room.getPlayers().get(0);
            newHost.setHost(true);
            room.setHostId(newHost.getId());
            room.setHostName(newHost.getName());
            room.setHostAvatar(newHost.getAvatar());
        }

        cleanupService.recordActivity(roomId);
        messageHandler.broadcastRoomUpdate(roomId, room);
        return room;
    }

    public Room startGame(String roomId, String hostId) {
        Room room = getRoomById(roomId);
        if (!room.getHostId().equals(hostId)) {
            throw new GameException("Chỉ chủ phòng mới có quyền bắt đầu trận đấu");
        }
        if (room.getPlayers().size() < 2) {
            throw new GameException("Cần ít nhất 2 người chơi để bắt đầu");
        }
        if (room.getPlayers().size() > 4) {
            throw new GameException("Số lượng người chơi không được vượt quá 4 người");
        }

        room.setStatus(RoomStatus.PLAYING);
        String gameId = gameService.initGame(room.getId(), room.getPlayers());
        room.setGameId(gameId);
        cleanupService.recordActivity(roomId);
        // Broadcast GAME_STARTED cho toàn bộ người trong phòng chờ
        messageHandler.broadcastGameStarted(roomId, gameId);
        return room;
    }

    /**
     * Chủ phòng kick người chơi khác ra khỏi phòng chờ.
     * Người bị kick bị chặn vào lại phòng trong 2 phút.
     */
    public Room kickPlayer(String roomId, String hostId, String targetPlayerId) {
        Room room = getRoomById(roomId);

        if (!room.getHostId().equals(hostId)) {
            throw new GameException("Chỉ chủ phòng mới có quyền đuổi người chơi");
        }
        if (hostId.equals(targetPlayerId)) {
            throw new GameException("Không thể tự đuổi chính mình");
        }

        boolean existed = room.getPlayers().removeIf(p -> p.getId().equals(targetPlayerId));
        if (!existed) {
            throw new GameException("Người chơi không tồn tại trong phòng");
        }

        // Ghi nhớ cooldown 2 phút (120000ms)
        kickedCooldownMap
                .computeIfAbsent(roomId, k -> new ConcurrentHashMap<>())
                .put(targetPlayerId, System.currentTimeMillis() + 120_000L);

        cleanupService.recordActivity(roomId);

        // Broadcast cho tất cả người trong phòng cập nhật danh sách
        messageHandler.broadcastRoomUpdate(roomId, room);
        // Broadcast riêng cho người bị kick biết mình bị đuổi
        messageHandler.broadcastPlayerKicked(roomId, targetPlayerId);

        return room;
    }
}
