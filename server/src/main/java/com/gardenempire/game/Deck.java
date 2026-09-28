package com.gardenempire.game;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Deck<T> {
    private final List<T> cards;

    public Deck() {
        this.cards = new ArrayList<>();
    }

    public Deck(List<T> initialCards) {
        this.cards = new ArrayList<>(initialCards);
        shuffle();
    }

    public void shuffle() {
        Collections.shuffle(cards);
    }

    public T draw() {
        if (cards.isEmpty()) {
            return null;
        }
        return cards.remove(cards.size() - 1);
    }

    public int size() {
        return cards.size();
    }

    public boolean isEmpty() {
        return cards.isEmpty();
    }
}
