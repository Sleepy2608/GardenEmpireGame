package com.gardenempire.service;

import com.gardenempire.dto.CreateRoomRequest;
import com.gardenempire.dto.JoinRoomRequest;
import com.gardenempire.exception.GameException;
import com.gardenempire.game.Player;
import com.gardenempire.room.Room;
import com.gardenempire.room.RoomManager;
import com.gardenempire.room.RoomStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoomService {
    private final RoomManager roomManager;
    private final GameService gameService;

    public List<Room> getAllRooms() {
        return roomManager.getAllRooms();
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

        Room room = Room.builder()
                .id(roomId)
                .code(roomId)
                .name(request.getRoomName())
                .hostId(host.getId())
                .hostName(host.getName())
                .hostAvatar(host.getAvatar())
                .maxPlayers(request.getMaxPlayers())
                .status(RoomStatus.WAITING)
                .gameId(roomId)
                .build();

        room.getPlayers().add(host);
        roomManager.addRoom(room);
        gameService.initGame(roomId, room.getPlayers());
        return room;
    }

    public Room joinRoom(String roomId, JoinRoomRequest request) {
        Room room = getRoomById(roomId);

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

        if (room.getPlayers().size() == room.getMaxPlayers()) {
            room.setStatus(RoomStatus.PLAYING);
            String gameId = gameService.initGame(room.getId(), room.getPlayers());
            room.setGameId(gameId);
        }

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
            roomManager.removeRoom(roomId);
            return null;
        }

        if (playerId.equals(room.getHostId())) {
            Player newHost = room.getPlayers().get(0);
            newHost.setHost(true);
            room.setHostId(newHost.getId());
            room.setHostName(newHost.getName());
            room.setHostAvatar(newHost.getAvatar());
        }

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

        room.setStatus(RoomStatus.PLAYING);
        String gameId = gameService.initGame(room.getId(), room.getPlayers());
        room.setGameId(gameId);
        return room;
    }
}
