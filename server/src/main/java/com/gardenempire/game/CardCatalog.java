package com.gardenempire.game;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Dữ liệu bài chuẩn 100% theo game gốc Splendor (90 Plant Cards + 10 Visitors)
 * Thứ tự chi phí: EARTH (Black) | SEED (White) | SUNLIGHT (Red) | WATER (Blue) | NUTRIENTS (Green)
 */
public class CardCatalog {

    private static Map<Resource, Integer> cost(int earth, int seed, int sunlight, int water, int nutrients) {
        Map<Resource, Integer> map = new EnumMap<>(Resource.class);
        if (earth > 0) map.put(Resource.EARTH, earth);
        if (seed > 0) map.put(Resource.SEED, seed);
        if (sunlight > 0) map.put(Resource.SUNLIGHT, sunlight);
        if (water > 0) map.put(Resource.WATER, water);
        if (nutrients > 0) map.put(Resource.NUTRIENTS, nutrients);
        return map;
    }

    private static Map<Resource, Integer> req(int earth, int seed, int sunlight, int water, int nutrients) {
        return cost(earth, seed, sunlight, water, nutrients);
    }

    public static List<PlantCard> createTier1Cards() {
        List<PlantCard> list = new ArrayList<>();

        // ==================================================
        // TIER 1 — BLACK (EARTH Bonus) — 8 thẻ
        // ==================================================
        list.add(new PlantCard("t1_e1", "Cỏ May Mắn", 1, cost(0, 1, 1, 1, 1), 0, Resource.EARTH));
        list.add(new PlantCard("t1_e2", "Dây Trầu", 1, cost(0, 0, 1, 0, 2), 0, Resource.EARTH));
        list.add(new PlantCard("t1_e3", "Cây Sen Đá", 1, cost(0, 2, 0, 0, 2), 0, Resource.EARTH));
        list.add(new PlantCard("t1_e4", "Cây Lưỡi Hổ", 1, cost(1, 0, 3, 0, 1), 0, Resource.EARTH));
        list.add(new PlantCard("t1_e5", "Cây Kim Tiền", 1, cost(0, 0, 0, 0, 3), 0, Resource.EARTH));
        list.add(new PlantCard("t1_e6", "Bí Ngô Mini", 1, cost(0, 1, 1, 2, 1), 0, Resource.EARTH));
        list.add(new PlantCard("t1_e7", "Khoai Lang Mầm", 1, cost(0, 2, 1, 2, 0), 0, Resource.EARTH));
        list.add(new PlantCard("t1_e8", "Củ Cải Đỏ", 1, cost(0, 0, 4, 0, 0), 1, Resource.EARTH));

        // ==================================================
        // TIER 1 — WHITE (SEED Bonus) — 8 thẻ
        // ==================================================
        list.add(new PlantCard("t1_s1", "Hạt Mầm Đậu Đen", 1, cost(1, 0, 0, 2, 2), 0, Resource.SEED));
        list.add(new PlantCard("t1_s2", "Hạt Mè Đen", 1, cost(1, 0, 2, 0, 0), 0, Resource.SEED));
        list.add(new PlantCard("t1_s3", "Đậu Hà Lan", 1, cost(1, 0, 1, 1, 1), 0, Resource.SEED));
        list.add(new PlantCard("t1_s4", "Ngô Non", 1, cost(0, 0, 0, 3, 0), 0, Resource.SEED));
        list.add(new PlantCard("t1_s5", "Hạt Đậu Phộng", 1, cost(0, 0, 0, 2, 2), 0, Resource.SEED));
        list.add(new PlantCard("t1_s6", "Lúa Mạch Non", 1, cost(1, 0, 1, 1, 2), 0, Resource.SEED));
        list.add(new PlantCard("t1_s7", "Hạt Sen Tươi", 1, cost(1, 3, 0, 1, 0), 0, Resource.SEED));
        list.add(new PlantCard("t1_s8", "Đậu Tằm", 1, cost(0, 0, 0, 0, 4), 1, Resource.SEED));

        // ==================================================
        // TIER 1 — RED (SUNLIGHT Bonus) — 8 thẻ
        // ==================================================
        list.add(new PlantCard("t1_su1", "Cây Ngò Gai", 1, cost(0, 3, 0, 0, 0), 0, Resource.SUNLIGHT));
        list.add(new PlantCard("t1_su2", "Cây Hoa Giấy", 1, cost(3, 1, 1, 0, 0), 0, Resource.SUNLIGHT));
        list.add(new PlantCard("t1_su3", "Hoa Mười Giờ", 1, cost(0, 0, 0, 2, 1), 0, Resource.SUNLIGHT));
        list.add(new PlantCard("t1_su4", "Cà Chua Bi", 1, cost(2, 2, 0, 0, 1), 0, Resource.SUNLIGHT));
        list.add(new PlantCard("t1_su5", "Cây Ớt Chỉ Thiên", 1, cost(1, 2, 0, 1, 1), 0, Resource.SUNLIGHT));
        list.add(new PlantCard("t1_su6", "Hoa Hướng Dương Con", 1, cost(1, 1, 0, 1, 1), 0, Resource.SUNLIGHT));
        list.add(new PlantCard("t1_su7", "Cây Xương Rồng", 1, cost(0, 2, 2, 0, 0), 0, Resource.SUNLIGHT));
        list.add(new PlantCard("t1_su8", "Cây Húng Quế", 1, cost(0, 4, 0, 0, 0), 1, Resource.SUNLIGHT));

        // ==================================================
        // TIER 1 — BLUE (WATER Bonus) — 8 thẻ
        // ==================================================
        list.add(new PlantCard("t1_w1", "Rau Mồng Tơi", 1, cost(2, 1, 0, 0, 0), 0, Resource.WATER));
        list.add(new PlantCard("t1_w2", "Rau Muống", 1, cost(1, 1, 2, 0, 1), 0, Resource.WATER));
        list.add(new PlantCard("t1_w3", "Cây Dương Xỉ", 1, cost(1, 1, 1, 0, 1), 0, Resource.WATER));
        list.add(new PlantCard("t1_w4", "Cây Trầu Bà", 1, cost(0, 0, 1, 1, 3), 0, Resource.WATER));
        list.add(new PlantCard("t1_w5", "Rau Cải Xanh", 1, cost(3, 0, 0, 0, 0), 0, Resource.WATER));
        list.add(new PlantCard("t1_w6", "Dưa Leo", 1, cost(0, 1, 2, 0, 2), 0, Resource.WATER));
        list.add(new PlantCard("t1_w7", "Bèo Hoa Dâu", 1, cost(2, 0, 0, 0, 2), 0, Resource.WATER));
        list.add(new PlantCard("t1_w8", "Cây Thủy Trúc", 1, cost(0, 0, 4, 0, 0), 1, Resource.WATER));

        // ==================================================
        // TIER 1 — GREEN (NUTRIENTS Bonus) — 8 thẻ
        // ==================================================
        list.add(new PlantCard("t1_n1", "Cây Xà Lách", 1, cost(0, 2, 0, 1, 0), 0, Resource.NUTRIENTS));
        list.add(new PlantCard("t1_n2", "Cải Thìa", 1, cost(0, 0, 2, 2, 0), 0, Resource.NUTRIENTS));
        list.add(new PlantCard("t1_n3", "Bí Đao Mầm", 1, cost(0, 1, 0, 3, 1), 0, Resource.NUTRIENTS));
        list.add(new PlantCard("t1_n4", "Cây Tía Tô", 1, cost(1, 1, 1, 1, 0), 0, Resource.NUTRIENTS));
        list.add(new PlantCard("t1_n5", "Nấm Rơm", 1, cost(2, 1, 1, 1, 0), 0, Resource.NUTRIENTS));
        list.add(new PlantCard("t1_n6", "Dâu Tây Mầm", 1, cost(2, 0, 2, 1, 0), 0, Resource.NUTRIENTS));
        list.add(new PlantCard("t1_n7", "Cây Bạc Hà", 1, cost(0, 0, 3, 0, 0), 0, Resource.NUTRIENTS));
        list.add(new PlantCard("t1_n8", "Cây Nha Đam", 1, cost(4, 0, 0, 0, 0), 1, Resource.NUTRIENTS));

        return list;
    }

    public static List<PlantCard> createTier2Cards() {
        List<PlantCard> list = new ArrayList<>();

        // ==================================================
        // TIER 2 — BLACK (EARTH Bonus) — 6 thẻ
        // ==================================================
        list.add(new PlantCard("t2_e1", "Cây Bàng Vuông", 2, cost(0, 3, 0, 2, 2), 1, Resource.EARTH));
        list.add(new PlantCard("t2_e2", "Cây Me Cổ", 2, cost(2, 3, 0, 0, 3), 1, Resource.EARTH));
        list.add(new PlantCard("t2_e3", "Cây Cọ Dầu", 2, cost(0, 0, 2, 1, 4), 2, Resource.EARTH));
        list.add(new PlantCard("t2_e4", "Tre Xanh", 2, cost(0, 5, 0, 0, 0), 2, Resource.EARTH));
        list.add(new PlantCard("t2_e5", "Cây Trắc Bách Diệp", 2, cost(0, 0, 3, 0, 5), 2, Resource.EARTH));
        list.add(new PlantCard("t2_e6", "Cây Cau Vua", 2, cost(6, 0, 0, 0, 0), 3, Resource.EARTH));

        // ==================================================
        // TIER 2 — WHITE (SEED Bonus) — 6 thẻ
        // ==================================================
        list.add(new PlantCard("t2_s1", "Cây Cam Sành", 2, cost(2, 0, 2, 0, 3), 1, Resource.SEED));
        list.add(new PlantCard("t2_s2", "Cây Ổi Bo", 2, cost(0, 2, 3, 3, 0), 1, Resource.SEED));
        list.add(new PlantCard("t2_s3", "Cây Bưởi Da Xanh", 2, cost(2, 0, 4, 0, 1), 2, Resource.SEED));
        list.add(new PlantCard("t2_s4", "Cây Xoài Cát", 2, cost(0, 0, 5, 0, 0), 2, Resource.SEED));
        list.add(new PlantCard("t2_s5", "Cây Chanh Đào", 2, cost(3, 0, 5, 0, 0), 2, Resource.SEED));
        list.add(new PlantCard("t2_s6", "Cây Nhãn Lồng", 2, cost(0, 6, 0, 0, 0), 3, Resource.SEED));

        // ==================================================
        // TIER 2 — RED (SUNLIGHT Bonus) — 6 thẻ
        // ==================================================
        list.add(new PlantCard("t2_su1", "Hoa Cúc Họa Mi", 2, cost(3, 0, 2, 3, 0), 1, Resource.SUNLIGHT));
        list.add(new PlantCard("t2_su2", "Cây Mai Vàng", 2, cost(3, 2, 2, 0, 0), 1, Resource.SUNLIGHT));
        list.add(new PlantCard("t2_su3", "Cây Hoa Đào", 2, cost(0, 1, 0, 4, 2), 2, Resource.SUNLIGHT));
        list.add(new PlantCard("t2_su4", "Cây Phượng Vĩ", 2, cost(5, 3, 0, 0, 0), 2, Resource.SUNLIGHT));
        list.add(new PlantCard("t2_su5", "Hoa Hướng Dương Lớn", 2, cost(5, 0, 0, 0, 0), 2, Resource.SUNLIGHT));
        list.add(new PlantCard("t2_su6", "Cây Muồng Hoàng Yến", 2, cost(0, 0, 6, 0, 0), 3, Resource.SUNLIGHT));

        // ==================================================
        // TIER 2 — BLUE (WATER Bonus) — 6 thẻ
        // ==================================================
        list.add(new PlantCard("t2_w1", "Hoa Tulip Nước", 2, cost(0, 0, 3, 2, 2), 1, Resource.WATER));
        list.add(new PlantCard("t2_w2", "Hoa Súng Thái", 2, cost(3, 0, 0, 2, 3), 1, Resource.WATER));
        list.add(new PlantCard("t2_w3", "Hoa Sen Trắng", 2, cost(0, 5, 0, 3, 0), 2, Resource.WATER));
        list.add(new PlantCard("t2_w4", "Cây Bần Chua", 2, cost(0, 0, 0, 5, 0), 2, Resource.WATER));
        list.add(new PlantCard("t2_w5", "Dừa Nước", 2, cost(4, 2, 1, 0, 0), 2, Resource.WATER));
        list.add(new PlantCard("t2_w6", "Cây Liễu Rủ", 2, cost(0, 0, 0, 6, 0), 3, Resource.WATER));

        // ==================================================
        // TIER 2 — GREEN (NUTRIENTS Bonus) — 6 thẻ
        // ==================================================
        list.add(new PlantCard("t2_n1", "Hoa Hồng Nhung", 2, cost(0, 3, 3, 0, 2), 1, Resource.NUTRIENTS));
        list.add(new PlantCard("t2_n2", "Hoa Ly Trắng", 2, cost(2, 2, 0, 3, 0), 1, Resource.NUTRIENTS));
        list.add(new PlantCard("t2_n3", "Hoa Phong Lan", 2, cost(1, 4, 0, 2, 0), 2, Resource.NUTRIENTS));
        list.add(new PlantCard("t2_n4", "Cây Trầm Hương", 2, cost(0, 0, 0, 0, 5), 2, Resource.NUTRIENTS));
        list.add(new PlantCard("t2_n5", "Hoa Cẩm Tú Cầu", 2, cost(0, 0, 0, 5, 3), 2, Resource.NUTRIENTS));
        list.add(new PlantCard("t2_n6", "Cây Ngọc Lan", 2, cost(0, 0, 0, 0, 6), 3, Resource.NUTRIENTS));

        return list;
    }

    public static List<PlantCard> createTier3Cards() {
        List<PlantCard> list = new ArrayList<>();

        // ==================================================
        // TIER 3 — BLACK (EARTH Bonus) — 4 thẻ
        // ==================================================
        list.add(new PlantCard("t3_e1", "Đại Thụ Baobab", 3, cost(0, 3, 3, 3, 5), 3, Resource.EARTH));
        list.add(new PlantCard("t3_e2", "Cổ Thụ Gõ Đỏ", 3, cost(0, 0, 7, 0, 0), 4, Resource.EARTH));
        list.add(new PlantCard("t3_e3", "Cây Đa Nghìn Năm", 3, cost(3, 0, 6, 0, 3), 4, Resource.EARTH));
        list.add(new PlantCard("t3_e4", "Bách Tùng Ngàn Năm", 3, cost(3, 0, 7, 0, 0), 5, Resource.EARTH));

        // ==================================================
        // TIER 3 — WHITE (SEED Bonus) — 4 thẻ
        // ==================================================
        list.add(new PlantCard("t3_s1", "Mộc Miên Linh Ứng", 3, cost(3, 0, 5, 3, 3), 3, Resource.SEED));
        list.add(new PlantCard("t3_s2", "Ngọc Am Hoàng Tộc", 3, cost(7, 0, 0, 0, 0), 4, Resource.SEED));
        list.add(new PlantCard("t3_s3", "Hoàng Đàn Cổ Mộc", 3, cost(6, 3, 3, 0, 0), 4, Resource.SEED));
        list.add(new PlantCard("t3_s4", "Cây Dã Hương Nghìn Năm", 3, cost(7, 3, 0, 0, 0), 5, Resource.SEED));

        // ==================================================
        // TIER 3 — RED (SUNLIGHT Bonus) — 4 thẻ
        // ==================================================
        list.add(new PlantCard("t3_su1", "Cổ Thụ Sequoia", 3, cost(3, 3, 0, 5, 3), 3, Resource.SUNLIGHT));
        list.add(new PlantCard("t3_su2", "Dương Quang Đại Thụ", 3, cost(0, 0, 0, 0, 7), 4, Resource.SUNLIGHT));
        list.add(new PlantCard("t3_su3", "Kim Ngân Cổ Thụ", 3, cost(0, 0, 3, 3, 6), 4, Resource.SUNLIGHT));
        list.add(new PlantCard("t3_su4", "Cây Lộc Vừng Cổ Tích", 3, cost(0, 0, 3, 0, 7), 5, Resource.SUNLIGHT));

        // ==================================================
        // TIER 3 — BLUE (WATER Bonus) — 4 thẻ
        // ==================================================
        list.add(new PlantCard("t3_w1", "Rừng Đước Cổ Sinh", 3, cost(5, 3, 3, 0, 3), 3, Resource.WATER));
        list.add(new PlantCard("t3_w2", "Thủy Mộc Thần Bí", 3, cost(0, 7, 0, 0, 0), 4, Resource.WATER));
        list.add(new PlantCard("t3_w3", "Sen Vua Khổng Lồ", 3, cost(3, 6, 0, 3, 0), 4, Resource.WATER));
        list.add(new PlantCard("t3_w4", "Cây Thủy Tùng Cổ", 3, cost(0, 7, 0, 3, 0), 5, Resource.WATER));

        // ==================================================
        // TIER 3 — GREEN (NUTRIENTS Bonus) — 4 thẻ
        // ==================================================
        list.add(new PlantCard("t3_n1", "Cây Sưa Đỏ Đại Thụ", 3, cost(3, 5, 3, 3, 0), 3, Resource.NUTRIENTS));
        list.add(new PlantCard("t3_n2", "Linh Chi Cổ Thụ", 3, cost(0, 3, 0, 6, 3), 4, Resource.NUTRIENTS));
        list.add(new PlantCard("t3_n3", "Cây Pơ Mu Linh Thiêng", 3, cost(0, 0, 0, 7, 0), 4, Resource.NUTRIENTS));
        list.add(new PlantCard("t3_n4", "Vạn Niên Tùng Chúa", 3, cost(0, 0, 0, 7, 3), 5, Resource.NUTRIENTS));

        return list;
    }

    public static List<VisitorCard> createVisitorCards() {
        List<VisitorCard> list = new ArrayList<>();
        // 10 Khách Thăm Vườn (Garden Visitors / Nobles) — 3 Điểm mỗi thẻ
        // 5 thẻ yêu cầu 3 loại x 3
        list.add(new VisitorCard("v_01", "Ong Chúa Vườn Hoa", 3, req(3, 3, 3, 0, 0))); // Earth, Seed, Sunlight
        list.add(new VisitorCard("v_02", "Bướm Nữ Hoàng Alexandra", 3, req(3, 3, 0, 3, 0)));    // Earth, Seed, Water
        list.add(new VisitorCard("v_03", "Bọ Rùa May Mắn", 3, req(3, 0, 3, 0, 3)));    // Earth, Sunlight, Nutrients
        list.add(new VisitorCard("v_04", "Chim Hoàng Yến Vàng", 3, req(0, 3, 0, 3, 3))); // Seed, Water, Nutrients
        list.add(new VisitorCard("v_05", "Sóc Nâu Tinh Nghịch", 3, req(0, 0, 3, 3, 3)));// Sunlight, Water, Nutrients

        // 5 thẻ yêu cầu 2 loại x 4
        list.add(new VisitorCard("v_06", "Nhím Nhỏ Đáng Yêu", 3, req(4, 0, 4, 0, 0))); // Earth, Sunlight
        list.add(new VisitorCard("v_07", "Chuồn Chuồn Ớt", 3, req(4, 4, 0, 0, 0)));    // Earth, Seed
        list.add(new VisitorCard("v_08", "Chim Én Báo Xuân", 3, req(0, 4, 0, 4, 0)));  // Seed, Water
        list.add(new VisitorCard("v_09", "Cú Mèo Tri Thức", 3, req(0, 0, 0, 4, 4)));   // Water, Nutrients
        list.add(new VisitorCard("v_10", "Kiến Thợ Cần Mẫn", 3, req(0, 0, 4, 0, 4)));  // Nutrients, Sunlight

        return list;
    }
}
