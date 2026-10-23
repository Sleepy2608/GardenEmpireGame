package com.gardenempire.service;

import com.gardenempire.dto.CreateRoomRequest;
import com.gardenempire.game.Player;
import com.gardenempire.room.Room;
import com.gardenempire.room.RoomManager;
import com.gardenempire.room.RoomStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class RoomServiceTest {

    @Autowired
    private RoomService roomService;

    @Autowired
    private RoomManager roomManager;

    @Test
    @DisplayName("Tạo phòng cơ bản thành công với thông tin Host")
    void testCreateRoomSuccess() {
        String hostId = "host-test-" + System.currentTimeMillis();
        Player host = Player.builder().id(hostId).name("Lan").avatar("🌸").build();
        CreateRoomRequest req = new CreateRoomRequest();
        req.setRoomName("Vườn Lan Hồ Điệp");
        req.setMaxPlayers(4);
        req.setHostPlayer(host);

        Room room = roomService.createRoom(req);

        assertNotNull(room);
        assertNotNull(room.getId());
        assertEquals("Vườn Lan Hồ Điệp", room.getName());
        assertEquals(RoomStatus.WAITING, room.getStatus());
        assertEquals(hostId, room.getHostId());
        assertEquals(1, room.getPlayers().size());
        assertTrue(room.getPlayers().get(0).isHost());
    }

    @Test
    @DisplayName("Chống tạo nhiều phòng: Gửi 2 request tạo phòng liên tiếp từ 1 Host sẽ trả về cùng 1 phòng (Idempotent)")
    void testRapidDuplicateCreateRoomReturnsSameRoom() {
        String hostId = "host-spam-" + System.currentTimeMillis();
        Player host = Player.builder().id(hostId).name("Minh").avatar("🌳").build();

        CreateRoomRequest req1 = new CreateRoomRequest();
        req1.setRoomName("Vườn Cổ Thụ 1");
        req1.setMaxPlayers(3);
        req1.setHostPlayer(host);

        CreateRoomRequest req2 = new CreateRoomRequest();
        req2.setRoomName("Vườn Cổ Thụ 2 (Click spam)");
        req2.setMaxPlayers(3);
        req2.setHostPlayer(host);

        // Click lần 1
        Room room1 = roomService.createRoom(req1);
        assertNotNull(room1);

        // Click liên tiếp lần 2 (ngay lập tức)
        Room room2 = roomService.createRoom(req2);
        assertNotNull(room2);

        // Phải trả về chính xác cùng 1 phòng để tránh sinh phòng rác
        assertEquals(room1.getId(), room2.getId(), "Hai request liên tiếp từ cùng một host phải trả về cùng mã phòng");

        // Kiểm tra danh sách phòng trên sảnh chỉ có duy nhất 1 phòng do host này tạo
        long hostWaitingRoomsCount = roomManager.getAllRooms().stream()
                .filter(r -> hostId.equals(r.getHostId()) && r.getStatus() == RoomStatus.WAITING)
                .count();
        assertEquals(1, hostWaitingRoomsCount, "Chỉ được phép có duy nhất 1 phòng chờ của host trên hệ thống");
    }

    @Test
    @DisplayName("Hai Host khác nhau có thể tạo phòng đồng thời mà không bị ảnh hưởng lẫn nhau")
    void testDifferentHostsCanCreateRoomsSimultaneously() {
        String hostAId = "host-A-" + System.currentTimeMillis();
        Player hostA = Player.builder().id(hostAId).name("Alice").avatar("🌿").build();
        CreateRoomRequest reqA = new CreateRoomRequest();
        reqA.setRoomName("Phòng của Alice");
        reqA.setMaxPlayers(4);
        reqA.setHostPlayer(hostA);

        String hostBId = "host-B-" + System.currentTimeMillis();
        Player hostB = Player.builder().id(hostBId).name("Bob").avatar("💧").build();
        CreateRoomRequest reqB = new CreateRoomRequest();
        reqB.setRoomName("Phòng của Bob");
        reqB.setMaxPlayers(2);
        reqB.setHostPlayer(hostB);

        Room roomA = roomService.createRoom(reqA);
        Room roomB = roomService.createRoom(reqB);

        assertNotNull(roomA);
        assertNotNull(roomB);
        assertNotEquals(roomA.getId(), roomB.getId());
        assertEquals(hostAId, roomA.getHostId());
        assertEquals(hostBId, roomB.getHostId());
    }

    @Test
    @DisplayName("Tự động dọn dẹp phòng WAITING cũ khi Host tạo phòng mới sau thời gian cooldown")
    void testOldWaitingRoomCleanedUpOnNewRoomAfterCooldown() throws InterruptedException {
        String hostId = "host-cleanup-" + System.currentTimeMillis();
        Player host = Player.builder().id(hostId).name("Hoàng").avatar("☀️").build();

        CreateRoomRequest req1 = new CreateRoomRequest();
        req1.setRoomName("Phòng Chờ Cũ");
        req1.setMaxPlayers(4);
        req1.setHostPlayer(host);

        Room oldRoom = roomService.createRoom(req1);
        String oldRoomId = oldRoom.getId();
        assertTrue(roomManager.getRoom(oldRoomId).isPresent(), "Phòng cũ phải tồn tại");

        // Chờ hết cooldown 2.5s (chờ 2.6s)
        Thread.sleep(2600);

        CreateRoomRequest req2 = new CreateRoomRequest();
        req2.setRoomName("Phòng Mới Sau Khi Hủy Cũ");
        req2.setMaxPlayers(4);
        req2.setHostPlayer(host);

        Room newRoom = roomService.createRoom(req2);
        assertNotNull(newRoom);
        assertNotEquals(oldRoomId, newRoom.getId(), "Phòng mới phải có ID mới sau cooldown");

        // Phòng cũ phải bị tự động xóa hoàn toàn để tránh rác sảnh
        assertTrue(roomManager.getRoom(oldRoomId).isEmpty(), "Phòng WAITING cũ của cùng host phải được tự động dọn dẹp");
        assertTrue(roomManager.getRoom(newRoom.getId()).isPresent(), "Phòng mới phải tồn tại");
    }
}
