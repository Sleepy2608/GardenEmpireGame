package com.gardenempire.game;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class CardCatalog {

    public static List<PlantCard> createTier1Cards() {
        List<PlantCard> list = new ArrayList<>();
        // 40 Thẻ Tier 1: Cây giống / Mầm non (Chi phí 3-5 token cơ bản, 0-1 điểm)
        // Nhóm EARTH Bonus
        list.add(new PlantCard("t1_01", "Cỏ May Mắn", 1, Map.of(Resource.WATER, 1, Resource.SUNLIGHT, 1, Resource.SEED, 1, Resource.NUTRIENTS, 1), 0, Resource.EARTH));
        list.add(new PlantCard("t1_02", "Dây Trầu", 1, Map.of(Resource.WATER, 2, Resource.SEED, 1), 0, Resource.EARTH));
        list.add(new PlantCard("t1_03", "Cây Sen Đá", 1, Map.of(Resource.SUNLIGHT, 2, Resource.NUTRIENTS, 1), 0, Resource.EARTH));
        list.add(new PlantCard("t1_04", "Cây Lưỡi Hổ", 1, Map.of(Resource.WATER, 3), 0, Resource.EARTH));
        list.add(new PlantCard("t1_05", "Cây Kim Tiền", 1, Map.of(Resource.WATER, 1, Resource.NUTRIENTS, 2), 0, Resource.EARTH));
        list.add(new PlantCard("t1_06", "Bí Ngô Mini", 1, Map.of(Resource.SUNLIGHT, 2, Resource.SEED, 2), 0, Resource.EARTH));
        list.add(new PlantCard("t1_07", "Khoai Lang Mầm", 1, Map.of(Resource.EARTH, 1, Resource.WATER, 3, Resource.NUTRIENTS, 1), 0, Resource.EARTH));
        list.add(new PlantCard("t1_08", "Củ Cải Đỏ", 1, Map.of(Resource.WATER, 4), 1, Resource.EARTH));

        // Nhóm WATER Bonus
        list.add(new PlantCard("t1_09", "Rau Mồng Tơi", 1, Map.of(Resource.EARTH, 1, Resource.SUNLIGHT, 1, Resource.SEED, 1, Resource.NUTRIENTS, 1), 0, Resource.WATER));
        list.add(new PlantCard("t1_10", "Rau Muống", 1, Map.of(Resource.SUNLIGHT, 2, Resource.EARTH, 1), 0, Resource.WATER));
        list.add(new PlantCard("t1_11", "Cây Dương Xỉ", 1, Map.of(Resource.NUTRIENTS, 2, Resource.SEED, 1), 0, Resource.WATER));
        list.add(new PlantCard("t1_12", "Cây Trầu Bà", 1, Map.of(Resource.NUTRIENTS, 3), 0, Resource.WATER));
        list.add(new PlantCard("t1_13", "Rau Cải Xanh", 1, Map.of(Resource.EARTH, 1, Resource.SUNLIGHT, 2), 0, Resource.WATER));
        list.add(new PlantCard("t1_14", "Dưa Leo", 1, Map.of(Resource.EARTH, 2, Resource.NUTRIENTS, 2), 0, Resource.WATER));
        list.add(new PlantCard("t1_15", "Bèo Hoa Dâu", 1, Map.of(Resource.WATER, 1, Resource.SUNLIGHT, 3, Resource.SEED, 1), 0, Resource.WATER));
        list.add(new PlantCard("t1_16", "Cây Thủy Trúc", 1, Map.of(Resource.SUNLIGHT, 4), 1, Resource.WATER));

        // Nhóm SUNLIGHT Bonus
        list.add(new PlantCard("t1_17", "Cây Ngò Gai", 1, Map.of(Resource.EARTH, 1, Resource.WATER, 1, Resource.SEED, 1, Resource.NUTRIENTS, 1), 0, Resource.SUNLIGHT));
        list.add(new PlantCard("t1_18", "Cây Hoa Giấy", 1, Map.of(Resource.SEED, 2, Resource.WATER, 1), 0, Resource.SUNLIGHT));
        list.add(new PlantCard("t1_19", "Hoa Mười Giờ", 1, Map.of(Resource.EARTH, 2, Resource.NUTRIENTS, 1), 0, Resource.SUNLIGHT));
        list.add(new PlantCard("t1_20", "Cà Chua Bi", 1, Map.of(Resource.EARTH, 3), 0, Resource.SUNLIGHT));
        list.add(new PlantCard("t1_21", "Cây Ớt Chỉ Thiên", 1, Map.of(Resource.WATER, 1, Resource.SEED, 2), 0, Resource.SUNLIGHT));
        list.add(new PlantCard("t1_22", "Hoa Hướng Dương Con", 1, Map.of(Resource.WATER, 2, Resource.NUTRIENTS, 2), 0, Resource.SUNLIGHT));
        list.add(new PlantCard("t1_23", "Cây Xương Rồng", 1, Map.of(Resource.SUNLIGHT, 1, Resource.NUTRIENTS, 3, Resource.EARTH, 1), 0, Resource.SUNLIGHT));
        list.add(new PlantCard("t1_24", "Cây Húng Quế", 1, Map.of(Resource.NUTRIENTS, 4), 1, Resource.SUNLIGHT));

        // Nhóm SEED Bonus
        list.add(new PlantCard("t1_25", "Hạt Mầm Đậu Đen", 1, Map.of(Resource.EARTH, 1, Resource.WATER, 1, Resource.SUNLIGHT, 1, Resource.NUTRIENTS, 1), 0, Resource.SEED));
        list.add(new PlantCard("t1_26", "Hạt Mè Đen", 1, Map.of(Resource.NUTRIENTS, 2, Resource.SUNLIGHT, 1), 0, Resource.SEED));
        list.add(new PlantCard("t1_27", "Đậu Hà Lan", 1, Map.of(Resource.WATER, 2, Resource.EARTH, 1), 0, Resource.SEED));
        list.add(new PlantCard("t1_28", "Ngô Non", 1, Map.of(Resource.SUNLIGHT, 3), 0, Resource.SEED));
        list.add(new PlantCard("t1_29", "Hạt Đậu Phộng", 1, Map.of(Resource.EARTH, 2, Resource.WATER, 1), 0, Resource.SEED));
        list.add(new PlantCard("t1_30", "Lúa Mạch Non", 1, Map.of(Resource.SUNLIGHT, 2, Resource.EARTH, 2), 0, Resource.SEED));
        list.add(new PlantCard("t1_31", "Hạt Sen Tươi", 1, Map.of(Resource.SEED, 1, Resource.WATER, 1, Resource.NUTRIENTS, 3), 0, Resource.SEED));
        list.add(new PlantCard("t1_32", "Đậu Tằm", 1, Map.of(Resource.EARTH, 4), 1, Resource.SEED));

        // Nhóm NUTRIENTS Bonus
        list.add(new PlantCard("t1_33", "Cây Xà Lách", 1, Map.of(Resource.EARTH, 1, Resource.WATER, 1, Resource.SUNLIGHT, 1, Resource.SEED, 1), 0, Resource.NUTRIENTS));
        list.add(new PlantCard("t1_34", "Cải Thìa", 1, Map.of(Resource.EARTH, 2, Resource.SEED, 1), 0, Resource.NUTRIENTS));
        list.add(new PlantCard("t1_35", "Bí Đao Mầm", 1, Map.of(Resource.WATER, 2, Resource.SUNLIGHT, 1), 0, Resource.NUTRIENTS));
        list.add(new PlantCard("t1_36", "Cây Tía Tô", 1, Map.of(Resource.SEED, 3), 0, Resource.NUTRIENTS));
        list.add(new PlantCard("t1_37", "Nấm Rơm", 1, Map.of(Resource.SUNLIGHT, 1, Resource.EARTH, 2), 0, Resource.NUTRIENTS));
        list.add(new PlantCard("t1_38", "Dâu Tây Mầm", 1, Map.of(Resource.WATER, 2, Resource.SEED, 2), 0, Resource.NUTRIENTS));
        list.add(new PlantCard("t1_39", "Cây Bạc Hà", 1, Map.of(Resource.NUTRIENTS, 1, Resource.EARTH, 3, Resource.WATER, 1), 0, Resource.NUTRIENTS));
        list.add(new PlantCard("t1_40", "Cây Nha Đam", 1, Map.of(Resource.SEED, 4), 1, Resource.NUTRIENTS));

        return list;
    }

    public static List<PlantCard> createTier2Cards() {
        List<PlantCard> list = new ArrayList<>();
        // 30 Thẻ Tier 2: Cây hoa / Cây ăn quả / Cây bụi (Chi phí 5-8 token cơ bản, 1-3 điểm)
        // Nhóm EARTH Bonus
        list.add(new PlantCard("t2_01", "Cây Bàng Vuông", 2, Map.of(Resource.EARTH, 2, Resource.WATER, 3, Resource.NUTRIENTS, 3), 1, Resource.EARTH));
        list.add(new PlantCard("t2_02", "Cây Me Cổ", 2, Map.of(Resource.EARTH, 2, Resource.SUNLIGHT, 4, Resource.SEED, 1), 2, Resource.EARTH));
        list.add(new PlantCard("t2_03", "Cây Cọ Dầu", 2, Map.of(Resource.EARTH, 3, Resource.WATER, 2, Resource.NUTRIENTS, 2), 1, Resource.EARTH));
        list.add(new PlantCard("t2_04", "Tre Xanh", 2, Map.of(Resource.EARTH, 5), 2, Resource.EARTH));
        list.add(new PlantCard("t2_05", "Cây Trắc Bách Diệp", 2, Map.of(Resource.WATER, 4, Resource.NUTRIENTS, 2, Resource.EARTH, 1), 2, Resource.EARTH));
        list.add(new PlantCard("t2_06", "Cây Cau Vua", 2, Map.of(Resource.EARTH, 6), 3, Resource.EARTH));

        // Nhóm WATER Bonus
        list.add(new PlantCard("t2_07", "Hoa Tulip Nước", 2, Map.of(Resource.WATER, 2, Resource.SUNLIGHT, 3, Resource.SEED, 3), 1, Resource.WATER));
        list.add(new PlantCard("t2_08", "Hoa Súng Thái", 2, Map.of(Resource.WATER, 2, Resource.NUTRIENTS, 4, Resource.EARTH, 1), 2, Resource.WATER));
        list.add(new PlantCard("t2_09", "Hoa Sen Trắng", 2, Map.of(Resource.WATER, 3, Resource.SUNLIGHT, 2, Resource.SEED, 2), 1, Resource.WATER));
        list.add(new PlantCard("t2_10", "Cây Bần Chua", 2, Map.of(Resource.WATER, 5), 2, Resource.WATER));
        list.add(new PlantCard("t2_11", "Dừa Nước", 2, Map.of(Resource.SUNLIGHT, 4, Resource.EARTH, 2, Resource.WATER, 1), 2, Resource.WATER));
        list.add(new PlantCard("t2_12", "Cây Liễu Rủ", 2, Map.of(Resource.WATER, 6), 3, Resource.WATER));

        // Nhóm SUNLIGHT Bonus
        list.add(new PlantCard("t2_13", "Hoa Cúc Họa Mi", 2, Map.of(Resource.SUNLIGHT, 2, Resource.SEED, 3, Resource.NUTRIENTS, 3), 1, Resource.SUNLIGHT));
        list.add(new PlantCard("t2_14", "Cây Mai Vàng", 2, Map.of(Resource.SUNLIGHT, 2, Resource.EARTH, 4, Resource.WATER, 1), 2, Resource.SUNLIGHT));
        list.add(new PlantCard("t2_15", "Cây Hoa Đào", 2, Map.of(Resource.SUNLIGHT, 3, Resource.SEED, 2, Resource.NUTRIENTS, 2), 1, Resource.SUNLIGHT));
        list.add(new PlantCard("t2_16", "Cây Phượng Vĩ", 2, Map.of(Resource.SUNLIGHT, 5), 2, Resource.SUNLIGHT));
        list.add(new PlantCard("t2_17", "Hoa Hướng Dương Lớn", 2, Map.of(Resource.SEED, 4, Resource.WATER, 2, Resource.SUNLIGHT, 1), 2, Resource.SUNLIGHT));
        list.add(new PlantCard("t2_18", "Cây Muồng Hoàng Yến", 2, Map.of(Resource.SUNLIGHT, 6), 3, Resource.SUNLIGHT));

        // Nhóm SEED Bonus
        list.add(new PlantCard("t2_19", "Cây Cam Sành", 2, Map.of(Resource.SEED, 2, Resource.NUTRIENTS, 3, Resource.EARTH, 3), 1, Resource.SEED));
        list.add(new PlantCard("t2_20", "Cây Ổi Bo", 2, Map.of(Resource.SEED, 2, Resource.WATER, 4, Resource.SUNLIGHT, 1), 2, Resource.SEED));
        list.add(new PlantCard("t2_21", "Cây Bưởi Da Xanh", 2, Map.of(Resource.SEED, 3, Resource.NUTRIENTS, 2, Resource.EARTH, 2), 1, Resource.SEED));
        list.add(new PlantCard("t2_22", "Cây Xoài Cát", 2, Map.of(Resource.SEED, 5), 2, Resource.SEED));
        list.add(new PlantCard("t2_23", "Cây Chanh Đào", 2, Map.of(Resource.NUTRIENTS, 4, Resource.SUNLIGHT, 2, Resource.SEED, 1), 2, Resource.SEED));
        list.add(new PlantCard("t2_24", "Cây Nhãn Lồng", 2, Map.of(Resource.SEED, 6), 3, Resource.SEED));

        // Nhóm NUTRIENTS Bonus
        list.add(new PlantCard("t2_25", "Hoa Hồng Nhung", 2, Map.of(Resource.NUTRIENTS, 2, Resource.EARTH, 3, Resource.WATER, 3), 1, Resource.NUTRIENTS));
        list.add(new PlantCard("t2_26", "Hoa Ly Trắng", 2, Map.of(Resource.NUTRIENTS, 2, Resource.SEED, 4, Resource.SUNLIGHT, 1), 2, Resource.NUTRIENTS));
        list.add(new PlantCard("t2_27", "Hoa Phong Lan", 2, Map.of(Resource.NUTRIENTS, 3, Resource.EARTH, 2, Resource.WATER, 2), 1, Resource.NUTRIENTS));
        list.add(new PlantCard("t2_28", "Cây Trầm Hương", 2, Map.of(Resource.NUTRIENTS, 5), 2, Resource.NUTRIENTS));
        list.add(new PlantCard("t2_29", "Hoa Cẩm Tú Cầu", 2, Map.of(Resource.EARTH, 4, Resource.SEED, 2, Resource.NUTRIENTS, 1), 2, Resource.NUTRIENTS));
        list.add(new PlantCard("t2_30", "Cây Ngọc Lan", 2, Map.of(Resource.NUTRIENTS, 6), 3, Resource.NUTRIENTS));

        return list;
    }

    public static List<PlantCard> createTier3Cards() {
        List<PlantCard> list = new ArrayList<>();
        // 20 Thẻ Tier 3: Đại thụ / Linh mộc / Cổ thụ quý hiếm (Chi phí 7-14 token cơ bản, 3-5 điểm)
        // Nhóm EARTH Bonus
        list.add(new PlantCard("t3_01", "Đại Thụ Baobab", 3, Map.of(Resource.EARTH, 3, Resource.WATER, 5, Resource.NUTRIENTS, 3, Resource.SUNLIGHT, 3), 3, Resource.EARTH));
        list.add(new PlantCard("t3_02", "Cổ Thụ Gõ Đỏ", 3, Map.of(Resource.WATER, 7), 4, Resource.EARTH));
        list.add(new PlantCard("t3_03", "Cây Đa Nghìn Năm", 3, Map.of(Resource.EARTH, 3, Resource.WATER, 6, Resource.NUTRIENTS, 3), 4, Resource.EARTH));
        list.add(new PlantCard("t3_04", "Bách Tùng Ngàn Năm", 3, Map.of(Resource.EARTH, 7, Resource.WATER, 3), 5, Resource.EARTH));

        // Nhóm WATER Bonus
        list.add(new PlantCard("t3_05", "Rừng Đước Cổ Sinh", 3, Map.of(Resource.WATER, 3, Resource.SUNLIGHT, 5, Resource.SEED, 3, Resource.EARTH, 3), 3, Resource.WATER));
        list.add(new PlantCard("t3_06", "Thủy Mộc Thần Bí", 3, Map.of(Resource.SUNLIGHT, 7), 4, Resource.WATER));
        list.add(new PlantCard("t3_07", "Sen Vua Khổng Lồ", 3, Map.of(Resource.WATER, 3, Resource.SUNLIGHT, 6, Resource.SEED, 3), 4, Resource.WATER));
        list.add(new PlantCard("t3_08", "Cây Thủy Tùng Cổ", 3, Map.of(Resource.WATER, 7, Resource.SUNLIGHT, 3), 5, Resource.WATER));

        // Nhóm SUNLIGHT Bonus
        list.add(new PlantCard("t3_09", "Cổ Thụ Sequoia", 3, Map.of(Resource.SUNLIGHT, 3, Resource.SEED, 5, Resource.NUTRIENTS, 3, Resource.WATER, 3), 3, Resource.SUNLIGHT));
        list.add(new PlantCard("t3_10", "Dương Quang Đại Thụ", 3, Map.of(Resource.SEED, 7), 4, Resource.SUNLIGHT));
        list.add(new PlantCard("t3_11", "Kim Ngân Cổ Thụ", 3, Map.of(Resource.SUNLIGHT, 3, Resource.SEED, 6, Resource.NUTRIENTS, 3), 4, Resource.SUNLIGHT));
        list.add(new PlantCard("t3_12", "Cây Lộc Vừng Cổ Tích", 3, Map.of(Resource.SUNLIGHT, 7, Resource.SEED, 3), 5, Resource.SUNLIGHT));

        // Nhóm SEED Bonus
        list.add(new PlantCard("t3_13", "Mộc Miên Linh Ứng", 3, Map.of(Resource.SEED, 3, Resource.NUTRIENTS, 5, Resource.EARTH, 3, Resource.SUNLIGHT, 3), 3, Resource.SEED));
        list.add(new PlantCard("t3_14", "Ngọc Am Hoàng Tộc", 3, Map.of(Resource.NUTRIENTS, 7), 4, Resource.SEED));
        list.add(new PlantCard("t3_15", "Hoàng Đàn Cổ Mộc", 3, Map.of(Resource.SEED, 3, Resource.NUTRIENTS, 6, Resource.EARTH, 3), 4, Resource.SEED));
        list.add(new PlantCard("t3_16", "Cây Dã Hương Nghìn Năm", 3, Map.of(Resource.SEED, 7, Resource.NUTRIENTS, 3), 5, Resource.SEED));

        // Nhóm NUTRIENTS Bonus
        list.add(new PlantCard("t3_17", "Cây Sưa Đỏ Đại Thụ", 3, Map.of(Resource.NUTRIENTS, 3, Resource.EARTH, 5, Resource.WATER, 3, Resource.SEED, 3), 3, Resource.NUTRIENTS));
        list.add(new PlantCard("t3_18", "Linh Chi Cổ Thụ", 3, Map.of(Resource.EARTH, 7), 4, Resource.NUTRIENTS));
        list.add(new PlantCard("t3_19", "Cây Pơ Mu Linh Thiêng", 3, Map.of(Resource.NUTRIENTS, 3, Resource.EARTH, 6, Resource.WATER, 3), 4, Resource.NUTRIENTS));
        list.add(new PlantCard("t3_20", "Vạn Niên Tùng Chúa", 3, Map.of(Resource.NUTRIENTS, 7, Resource.EARTH, 3), 5, Resource.NUTRIENTS));

        return list;
    }

    public static List<VisitorCard> createVisitorCards() {
        List<VisitorCard> list = new ArrayList<>();
        // 10 Khách Thăm Vườn (Garden Visitors) — 3 Điểm mỗi thẻ
        list.add(new VisitorCard("v_01", "Ong Chúa Vườn Hoa", 3, Map.of(Resource.SUNLIGHT, 3, Resource.WATER, 3, Resource.NUTRIENTS, 3)));
        list.add(new VisitorCard("v_02", "Bướm Hoàng Yến", 3, Map.of(Resource.SUNLIGHT, 3, Resource.SEED, 3, Resource.EARTH, 3)));
        list.add(new VisitorCard("v_03", "Bọ Rùa May Mắn", 3, Map.of(Resource.EARTH, 3, Resource.WATER, 3, Resource.SEED, 3)));
        list.add(new VisitorCard("v_04", "Chim Ruồi Đổi Màu", 3, Map.of(Resource.WATER, 3, Resource.SUNLIGHT, 3, Resource.SEED, 3)));
        list.add(new VisitorCard("v_05", "Sóc Nâu Tinh Nghịch", 3, Map.of(Resource.EARTH, 3, Resource.NUTRIENTS, 3, Resource.SEED, 3)));
        list.add(new VisitorCard("v_06", "Nhím Nhỏ Đáng Yêu", 3, Map.of(Resource.EARTH, 4, Resource.WATER, 4)));
        list.add(new VisitorCard("v_07", "Chuồn Chuồn Ớt", 3, Map.of(Resource.WATER, 4, Resource.SUNLIGHT, 4)));
        list.add(new VisitorCard("v_08", "Chim Én Báo Xuân", 3, Map.of(Resource.SUNLIGHT, 4, Resource.SEED, 4)));
        list.add(new VisitorCard("v_09", "Cú Mèo Tri Thức", 3, Map.of(Resource.SEED, 4, Resource.NUTRIENTS, 4)));
        list.add(new VisitorCard("v_10", "Kiến Thợ Cần Mẫn", 3, Map.of(Resource.NUTRIENTS, 4, Resource.EARTH, 4)));

        return list;
    }
}
