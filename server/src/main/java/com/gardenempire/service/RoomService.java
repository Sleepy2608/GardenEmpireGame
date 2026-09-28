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
        String roomId = UUID.randomUUID().toString().substring(0, 8);
        Player host = request.getHostPlayer();
        host.setHost(true);

        Room room = Room.builder()
                .id(roomId)
                .name(request.getRoomName())
                .hostId(host.getId())
                .hostName(host.getName())
                .maxPlayers(request.getMaxPlayers())
                .status(RoomStatus.WAITING)
                .build();

        room.getPlayers().add(host);
        return roomManager.addRoom(room);
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
                    .isHost(false)
                    .build();
            room.getPlayers().add(newPlayer);
        }

        // If room is full, start the game
        if (room.getPlayers().size() == room.getMaxPlayers()) {
            room.setStatus(RoomStatus.PLAYING);
            String gameId = gameService.initGame(room.getId(), room.getPlayers());
            room.setGameId(gameId);
        }

        return room;
    }
}
