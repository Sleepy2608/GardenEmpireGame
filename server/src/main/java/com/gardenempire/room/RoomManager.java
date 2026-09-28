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
        return Optional.ofNullable(rooms.get(roomId));
    }

    public Room addRoom(Room room) {
        rooms.put(room.getId(), room);
        return room;
    }

    public void removeRoom(String roomId) {
        rooms.remove(roomId);
    }
}
