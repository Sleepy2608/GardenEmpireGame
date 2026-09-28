package com.gardenempire.dto;

import com.gardenempire.game.Player;
import lombok.Data;

@Data
public class CreateRoomRequest {
    private String roomName;
    private int maxPlayers;
    private Player hostPlayer;
}
