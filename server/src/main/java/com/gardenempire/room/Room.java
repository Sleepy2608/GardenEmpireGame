package com.gardenempire.room;

import com.gardenempire.game.Player;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Room {
    private String id;
    private String name;
    private String hostId;
    private String hostName;
    private int maxPlayers;
    
    @Builder.Default
    private RoomStatus status = RoomStatus.WAITING;
    
    @Builder.Default
    private List<Player> players = new ArrayList<>();
    
    private String gameId;
}
