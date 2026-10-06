package com.gardenempire.controller;

import com.gardenempire.dto.CreateRoomRequest;
import com.gardenempire.dto.JoinRoomRequest;
import com.gardenempire.room.Room;
import com.gardenempire.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<Room> getRoomById(@PathVariable String roomId) {
        return ResponseEntity.ok(roomService.getRoomById(roomId));
    }

    @PostMapping
    public ResponseEntity<Room> createRoom(@RequestBody CreateRoomRequest request) {
        return ResponseEntity.ok(roomService.createRoom(request));
    }

    @PostMapping("/{roomId}/join")
    public ResponseEntity<Room> joinRoom(@PathVariable String roomId, @RequestBody JoinRoomRequest request) {
        return ResponseEntity.ok(roomService.joinRoom(roomId, request));
    }

    @PostMapping("/join-code")
    public ResponseEntity<Room> joinRoomByCode(@RequestBody com.gardenempire.dto.JoinByCodeRequest request) {
        return ResponseEntity.ok(roomService.joinRoomByCode(request));
    }

    @PostMapping("/{roomId}/leave")
    public ResponseEntity<Room> leaveRoom(@PathVariable String roomId, @RequestParam String playerId) {
        return ResponseEntity.ok(roomService.leaveRoom(roomId, playerId));
    }

    @PostMapping("/{roomId}/start")
    public ResponseEntity<Room> startGame(@PathVariable String roomId, @RequestParam String hostId) {
        return ResponseEntity.ok(roomService.startGame(roomId, hostId));
    }

    @PostMapping("/{roomId}/kick")
    public ResponseEntity<Room> kickPlayer(
            @PathVariable String roomId,
            @RequestBody com.gardenempire.dto.KickRequest request) {
        return ResponseEntity.ok(roomService.kickPlayer(roomId, request.getHostId(), request.getTargetPlayerId()));
    }
}
