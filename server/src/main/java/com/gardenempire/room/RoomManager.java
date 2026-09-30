package com.gardenempire.room;

import com.gardenempire.exception.GameException;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RoomManager {
    private final Map<String, Room> rooms = new ConcurrentHashMap<>();

    public List<Room> getAllRooms() {
        return new ArrayList<>(rooms.values());
    }

    public Optional<Room> getRoom(String roomId) {
        if (roomId == null) return Optional.empty();
        Room r = rooms.get(roomId);
        if (r != null) return Optional.of(r);
        return rooms.values().stream()
                .filter(room -> roomId.equalsIgnoreCase(room.getId()) || (room.getCode() != null && roomId.equalsIgnoreCase(room.getCode())))
                .findFirst();
    }

    public Room addRoom(Room room) {
        rooms.put(room.getId(), room);
        return room;
    }

    public void removeRoom(String roomId) {
        rooms.remove(roomId);
    }
}
