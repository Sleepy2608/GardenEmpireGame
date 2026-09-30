package com.gardenempire.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.gardenempire.game.Resource;
import lombok.Data;

import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GameActionRequest {
    @JsonAlias({"actionType", "type"})
    private String type;
    
    private String playerId;
    private String gameId;
    
    // Direct fields
    @JsonAlias({"selectedTokens", "tokens"})
    private Map<Resource, Integer> selectedTokens;
    
    private String cardId;
    private boolean fromReserved;
    
    @JsonAlias({"fromDeckTier", "tier", "tierFromDeck"})
    private Integer fromDeckTier;
    
    private Map<Resource, Integer> returnedTokens;
    
    // Nested payload support if sent as { type, gameId, playerId, payload: { ... } }
    private Map<String, Object> payload;

    public String getResolvedActionType() {
        return type != null ? type.toUpperCase() : "";
    }

    public Map<Resource, Integer> getResolvedTokens() {
        if (selectedTokens != null && !selectedTokens.isEmpty()) {
            return selectedTokens;
        }
        if (payload != null) {
            Object rawTokens = payload.get("tokens");
            if (rawTokens == null) rawTokens = payload.get("selectedTokens");
            if (rawTokens instanceof Map) {
                Map<?, ?> map = (Map<?, ?>) rawTokens;
                Map<Resource, Integer> result = new java.util.EnumMap<>(Resource.class);
                map.forEach((k, v) -> {
                    try {
                        Resource r = Resource.valueOf(k.toString().toUpperCase());
                        int count = Integer.parseInt(v.toString());
                        if (count > 0) result.put(r, count);
                    } catch (Exception ignored) {}
                });
                return result;
            }
        }
        return selectedTokens;
    }

    public String getResolvedCardId() {
        if (cardId != null) return cardId;
        if (payload != null && payload.get("cardId") != null) {
            return payload.get("cardId").toString();
        }
        return null;
    }

    public boolean isResolvedFromReserved() {
        if (fromReserved) return true;
        if (payload != null && payload.get("fromReserved") != null) {
            return Boolean.parseBoolean(payload.get("fromReserved").toString());
        }
        return false;
    }

    public Integer getResolvedFromDeckTier() {
        if (fromDeckTier != null) return fromDeckTier;
        if (payload != null) {
            Object rawTier = payload.get("fromDeckTier");
            if (rawTier == null) rawTier = payload.get("tier");
            if (rawTier != null) {
                try {
                    return Integer.parseInt(rawTier.toString());
                } catch (Exception ignored) {}
            }
        }
        return null;
    }

    public Map<Resource, Integer> getResolvedReturnedTokens() {
        if (returnedTokens != null && !returnedTokens.isEmpty()) {
            return returnedTokens;
        }
        if (payload != null) {
            Object raw = payload.get("tokens");
            if (raw == null) raw = payload.get("returnedTokens");
            if (raw instanceof Map) {
                Map<?, ?> map = (Map<?, ?>) raw;
                Map<Resource, Integer> result = new java.util.EnumMap<>(Resource.class);
                map.forEach((k, v) -> {
                    try {
                        Resource r = Resource.valueOf(k.toString().toUpperCase());
                        int count = Integer.parseInt(v.toString());
                        if (count > 0) result.put(r, count);
                    } catch (Exception ignored) {}
                });
                return result;
            }
        }
        return returnedTokens;
    }
}

