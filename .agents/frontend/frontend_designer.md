---
name: frontend-designer
description: Quy chuẩn thiết kế và phát triển giao diện người dùng (UI/UX), hệ thống Design Tokens và quy tắc Glassmorphism cho dự án GardenEmpireGame (Game bàn cờ chiến thuật Splendor chủ đề Vườn Hoàng Gia). Tự động phối hợp với skill ui-ux-pro-max, áp dụng bảng màu 5 năng lượng thực vật + 1 vàng WILD, và đảm bảo tuân thủ tiêu chuẩn trợ năng WCAG.
---

# FRONTEND_DESIGNER.md — Quy Chuẩn Thiết Kế & Phát Triển Giao Diện (Frontend Agent Protocol)

Tài liệu này định nghĩa toàn bộ quy chuẩn bắt buộc dành cho Agent và Developer khi xây dựng mới, chỉnh sửa, nâng cấp hoặc sửa lỗi giao diện người dùng (`client/`) trong dự án **GardenEmpireGame**.
> **Mục tiêu cốt lõi:** Giao diện bàn cờ đạt chuẩn thẩm mỹ cao cấp (Anti-Slop), kết hợp hài hoà giữa chủ đề **Vườn Hoàng Gia Trung Cổ (Royal Garden)** và phong cách **Deep Forest Dark Glassmorphism**, trực quan, nhạy bén và vượt qua 100% bài kiểm thử DOM & OCR thực tế.

---

## 1. Cơ Chế Tự Động Kích Hoạt & Phối Hợp Skill `ui-ux-pro-max`

Bất cứ khi nào nhận yêu cầu liên quan đến **Frontend / UI / UX / Layout / CSS / Component**, Agent **BẮT BUỘC** kiểm tra và nạp skill `ui-ux-pro-max` để lấy cảm hứng và tiêu chuẩn thiết kế:

### 1.1. Tra cứu Design System & Domain Chuyên Sâu
Sử dụng script tìm kiếm của `ui-ux-pro-max` (chạy chuẩn trên môi trường Windows):
```powershell
# Tạo cấu trúc Design System hoàn chỉnh cho trang / tính năng mới:
python "C:\Users\VIVOBOOK\.agents\skills\ui-ux-pro-max\scripts\search.py" "board game medieval garden strategy" --design-system

# Tra cứu UX, tương tác, hoặc khả năng tiếp cận (Accessibility):
python "C:\Users\VIVOBOOK\.agents\skills\ui-ux-pro-max\scripts\search.py" "collapsible widget accordion toggle button" --domain ux
python "C:\Users\VIVOBOOK\.agents\skills\ui-ux-pro-max\scripts\search.py" "icon button accessible label" --domain icons
```

### 1.2. Tiêu Chuẩn Trợ Năng Bắt Buộc (Accessibility & Usability)
- **Độ tương phản (Contrast):** Văn bản chính phải đạt độ tương phản tối thiểu $\ge 4.5:1$ so với nền; icon mang ngữ nghĩa và đường viền điều khiển đạt $\ge 3:1$.
- **Vùng chạm / Click tối thiểu:** Kích thước tương tác tối thiểu $\ge 44\text{px} \times 44\text{px}$ (hoặc có vùng đệm padding mở rộng).
- **Trạng thái ARIA:** Mọi nút thu gọn/mở rộng, modal, tab chuyển đổi bắt buộc có các thuộc tính ngữ nghĩa:
  - `aria-expanded="true"` / `aria-expanded="false"` cho nút toggle/accordion.
  - `aria-label` cho các nút chỉ có icon hoặc chưa có nhãn chữ trực tiếp.
  - `aria-hidden="true"` cho các icon trang trí đứng cạnh nhãn chữ.
- **Ổn định bố cục (Layout Stability):** Trạng thái hover, active, focus không được làm xê dịch kích thước bao ngoài (không thay đổi `border-width` hay margin đột ngột gây giật layout xung quanh).

---

## 2. Hệ Thống Design Tokens Chuẩn Của GardenEmpireGame

Mọi màn hình (`index.html`, `lobby.html`, `waiting-room.html`, `game.html`) và các file CSS (`common.css`, `game.css`, `lobby.css`, `waiting-room.css`) phải dùng đồng bộ các biến CSS được định nghĩa tại `client/css/common.css`:

### 2.1. Bảng Màu 5 Năng Lượng Thực Vật + 1 Vàng WILD (Botanical Energies)

| Năng lượng | Biến CSS | Mã màu chính | Gradient đại diện | Ý nghĩa trong game |
| :--- | :--- | :--- | :--- | :--- |
| **Đất (Dirt / Earth)** | `--color-dirt` | `#8B5A2B` | `linear-gradient(135deg, #a4642f 0%, #5c3516 100%)` | Tài nguyên đất màu mỡ (Tương đương Onyx) |
| **Nước (Water)** | `--color-water` | `#0284C7` | `linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)` | Tài nguyên nước nguồn (Tương đương Sapphire) |
| **Ánh Sáng (Light)** | `--color-light` | `#EAB308` | `linear-gradient(135deg, #facc15 0%, #ca8a04 100%)` | Năng lượng quang hợp mặt trời (Tương đương Diamond) |
| **Hạt Giống (Seed)** | `--color-seed` | `#64748B` | `linear-gradient(135deg, #94a3b8 0%, #475569 100%)` | Mầm cây giống xám bạc (Tương đương Slate / White) |
| **Dinh Dưỡng (Nutrient)** | `--color-nutrient` | `#16A34A` | `linear-gradient(135deg, #22c55e 0%, #15803d 100%)` | Tinh chất nuôi cây ngọc lục bảo (Tương đương Emerald) |
| **Phân Bón Vàng WILD** | `--color-gold` | `#F59E0B` | `linear-gradient(135deg, #fbbf24 0%, #d97706 100%)` | Tài nguyên vàng vạn năng (Tương đương Gold / Wild Token) |

### 2.2. Nền Tảng & Bề Mặt Kính Mờ (Deep Forest Glassmorphism)
- `--bg-deep-forest`: `#07100b` (Màu xanh rừng rậm bóng đêm, tạo chiều sâu sân khấu).
- `--bg-forest-gradient`: `radial-gradient(circle at 50% 0%, #10291d 0%, #07100b 75%)`.
- `--bg-surface-glass`: `rgba(15, 35, 23, 0.75)` với `backdrop-filter: blur(14px)`.
- `--bg-surface-glass-heavy`: `rgba(11, 26, 17, 0.94)` (Dùng cho Modal và Widget nổi bật).
- Đường viền tự nhiên:
  - `--border-nature`: `rgba(74, 222, 128, 0.2)` (Viền xanh lục dịu mát).
  - `--border-nature-focus`: `rgba(74, 222, 128, 0.6)`.
  - `--border-gold`: `rgba(245, 158, 11, 0.4)` (Viền vàng ánh kim hoàng gia).
  - `--border-gold-focus`: `rgba(251, 191, 36, 0.8)`.

### 2.3. Quy Chuẩn Font Chữ (Typography Hierarchy)
- **Font hiển thị & Tiêu đề:** `'Plus Jakarta Sans'`, `'Outfit'`, `'Be Vietnam Pro'`, sans-serif.
- **Font giao diện & Nhãn chức năng:** `'Be Vietnam Pro'`, `'Plus Jakarta Sans'`, sans-serif.
- **Font số liệu, điểm số & bộ đếm tài nguyên:** `'Outfit'`, `'Plus Jakarta Sans'`, sans-serif. **Bắt buộc** kết hợp `font-variant-numeric: tabular-nums` để các con số không bị xê dịch khi nhảy giá trị.

### 2.4. Quy Tắc Tiện Ích Toàn Cục (Global Utility)
- **Ẩn phần tử an toàn:** `.hidden { display: none !important; }` đã được chuẩn hoá tại `common.css`. Mọi thao tác ẩn/hiện phân khu, badge, ticker hoặc modal phải sử dụng class này hoặc quy tắc ràng buộc trạng thái tương ứng.

---

## 3. Kiến Trúc Bố Cục Bàn Đấu (Tabletop 3D Arena Layout)

Bàn cờ `client/game.html` được tổ chức theo hình mẫu **Around-The-Table (Vây quanh chiếu cờ trung tâm)**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🌿 GARDEN EMPIRE  |  PHÒNG: ABCXYZ  |  LƯỢT: Bạn [30s]  | 🔊 [Luật] [Rời]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                         [PLAYER 3 / ĐỐI THỦ TRÊN]                           │
│                                                                             │
│ [PLAYER 2]      ┌────────────────────────────────────────┐  📜 GAME LOGS  ⛶ │
│ (Trái: Avatar,  │ 🦋 KHÁCH THĂM VƯỜN (Visitors Row)      │  • [#8] An: +1 Đất│
│  Điểm ★,        │ [Chồng Khách] [Khách 1] [Khách 2]...    │  • [#7] Bảo giữ...│
│  Token & Kho)   ├────────────────────────────────────────┤  (3 Recent / Ticker)
│                 │ 🌳 CHỢ CÂY TRỒNG (Plant Market 3 Tiers)│                  │
│ 💬 CHAT ▼       │ [Tier 3: Deck úp + 4 Thẻ Mở Ngửa]      │  [PLAYER 4]      │
│ • An: Chào bạn! │ [Tier 2: Deck úp + 4 Thẻ Mở Ngửa]      │  (Phải: Avatar,  │
│ [Nhập...] [➤]   │ [Tier 1: Deck úp + 4 Thẻ Mở Ngửa]      │   Điểm ★,        │
│                 ├────────────────────────────────────────┤   Token & Kho)   │
│                 │ 🪙 NGÂN HÀNG NĂNG LƯỢNG (6 Viên Ngọc)  │                  │
│                 │ [🟫] [💧] [☀️] [🌰] [🧪] [⭐]          │                  │
│                 └────────────────────────────────────────┘                  │
│                                                                             │
│        [PLAYER 1 — CHÍNH BẠN (MASTER PLAYER DASHBOARD CỐ ĐỊNH Ở ĐÁY)]       │
│  • Avatar & Tên | 🏆 Điểm: 12/15★ | 📦 Token cầm tay | 🌿 Bonus | 📑 Đặt chỗ│
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.1. Các Phân Khu Chức Năng Cốt Lõi
1. **Khung Trò Chuyện Trực Tuyến (`#chat-widget` — Bottom-Left):**
   - Đặt đối xứng phía dưới ghế Player 2.
   - Hỗ trợ phím tắt `Enter` tiện lợi (tự động mở rộng & focus ô gõ), `Esc` để hủy focus.
   - Trạng thái thu gọn (`is-collapsed`): Ẩn toàn bộ feed & input, hiển thị Mini Ticker mỏng nhẹ cuộn tin mới nhất kèm chấm xung nhịp `chat-pulse-dot`.
   - Nút mũi tên chuyển đổi `▼` (khi mở) và `▲` (khi thu gọn), tích hợp `aria-expanded`. Tuyệt đối không để icon mũi tên bị trùng lặp trong nội dung ticker.
2. **Nhật Ký Hành Động (`#game-log-widget` — Top-Right):**
   - Đặt đối xứng ở góc trên bên phải, hiển thị 3 hành động gần nhất kèm số thứ tự toàn cục `#1, #2... #N`.
   - Bấm vào widget hoặc nút mở rộng `⛶` để mở Modal toàn bộ lịch sử ván đấu.
3. **Thanh Điều Khiển Người Chơi (`#my-player-panel` — Bottom Dashboard):**
   - Cố định ở đáy bàn đấu, chia làm 4 cột rõ rệt: Hồ sơ & Điểm số 15★, Khay Token năng lượng, Khay Bonus cây đã trồng, Khay 3 thẻ đặt chỗ.
   - Khi tới lượt (`my-turn-active`): Phát hào quang ngọc lục bảo viền sáng (`0 0 24px rgba(74, 222, 128, 0.45)`).
4. **Chợ Cây Trồng (`#plant-market-container` — 3 Tiers):**
   - Hiển thị từ Tier 3 (trên cùng) xuống Tier 1 (dưới cùng).
   - Mỗi Tier gồm chồng bài úp bên trái (hiển thị số thẻ còn lại) và tối đa 4 thẻ cây mở ngửa.
5. **Pop-up Vinh Danh & Đếm Ngược Đóng Phòng (`#victory-modal`):**
   - Tự động kích hoạt khi ván đấu có người chiến thắng hoặc kích hoạt vòng chung kết.
   - Hỗ trợ nút `🔍 Xem Lại Bàn Cờ` để thu nhỏ thành thanh nổi **Endgame Floating Bar** giúp người chơi tiếp tục quan sát bàn đấu mà không bị che khuất.

---

## 4. Quy Chuẩn Đồ Họa & Icon (No-Slop Iconography)

- **Quy tắc tuyệt đối:** Không dùng emoji làm icon điều hướng hệ thống hoặc icon chức năng chính.
- **Ưu tiên Vector:** Dùng SVG hoặc ký tự Unicode chuẩn kỹ thuật có cấu trúc (Phosphor, Heroicons, Lucide).
- **Phân định ngữ nghĩa:**
  - Token tài nguyên và linh vật khách thăm vườn được phép dùng icon hình tượng phong phú (`🌱`, `🌺`, `🍀`, `🍄`, `🟫`, `💧`, `☀️`, `🌰`, `🧪`, `⭐`).
  - Nút điều khiển, đóng mở, âm thanh, luật chơi phải dùng ký tự/SVG sắc nét (`🔊`, `🔇`, `⛶`, `🗗`, `▼`, `▲`, `➤`, `✕`, `📋`).

---

## 5. Quy Trình Làm Việc Khi Nhận Tác Vụ Frontend

1. **Bước 1: Khảo sát hiện trạng (Audit)**
   - Đọc cấu trúc DOM trong `client/*.html` và các selector liên quan trong `client/css/*.css`.
   - Xác định biến CSS cần kế thừa từ `common.css`.
2. **Bước 2: Thiết kế & Triển khai (Code)**
   - Triển khai HTML sạch, ngữ nghĩa, đúng cấu trúc.
   - Áp dụng các biến token chuẩn, không hardcode mã màu lạ.
   - Đảm bảo trạng thái focus, hover, disabled rõ ràng.
3. **Bước 3: Kiểm thử tự động & Chụp ảnh đối soát**
   - Chạy bộ kiểm thử tương ứng theo [.agents/test/test_agents.md](file:///c:/University%20Coding%20Project/GardenEmpireGame/.agents/test/test_agents.md).
   - Chụp ảnh màn hình thật và đối soát OCR dữ liệu hiển thị khớp 100% với logic game.
4. **Bước 4: Bàn giao & Đề xuất commit**
   - Chỉ xuất khối lệnh commit theo đúng chuẩn tại [.agents/commit/commit_agents.md](file:///c:/University%20Coding%20Project/GardenEmpireGame/.agents/commit/commit_agents.md).
