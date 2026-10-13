# 📜 NHẬT KÝ THAY ĐỔI & LỊCH SỬ PHIÊN BẢN (CHANGELOG)

Tất cả các thay đổi đáng chú ý của dự án **Garden Empire Game** sẽ được ghi chép và lưu trữ tại tài liệu này.
Định dạng được dựa trên [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), và dự án tuân thủ [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## 🚀 [v1.2.0] — 2026-10-14
### ✨ Tính Năng Mới (Features)
- **Khung Trò Chuyện Trực Tuyến (In-Game Chat Box):**
  - Đặt tại góc dưới bên trái bàn đấu (Bottom-Left), đối xứng trực quan với Nhật ký hành động (Game Action Logs).
  - Phím tắt `Enter` tiện lợi: Khi đang quan sát bàn cờ, nhấn `Enter` để tự động mở rộng khung chat và focus vào ô nhập tin nhắn ngay lập tức (`Esc` để hủy focus).
  - Gửi tin nhắn tức thời tới tất cả người chơi trong phòng thông qua WebSocket Native (`CHAT_MESSAGE_RECEIVED`).
  - Nút thu gọn / mở rộng (`▼` / `▲`) chuyển đổi thành thanh Chat Bar mini mỏng nhẹ hiển thị tin nhắn mới nhất.
  - Huy hiệu tin chưa đọc (🔴 Unread Badge) nhấp nháy sinh động khi có tin mới trong trạng thái khung chat đang thu gọn.
  - Hiệu ứng âm thanh thông báo pop nhẹ nhàng (`SoundFX.playChatSound()` kết hợp tần số 587.33Hz + 880Hz).
  - Tự động cuộn thông minh (`autoScroll`): Giữ người dùng luôn ở tin nhắn mới nhất, tạm dừng cuộn nếu người dùng đang chủ động cuộn lên đọc lịch sử.
  - Tích hợp nút bật/tắt khung chat trên thanh điều hướng Top Bar (`#btn-toggle-chat`).

### 🛡️ Bảo Mật & Ổn Định (Security & Performance)
- **Khử độc mã độc XSS (HTML Sanitization):** Tự động mã hóa các thẻ `<script>`, `<img>`, `<iframe>` và các ký tự đặc biệt (`&`, `<`, `>`, `"`, `'`).
- **Chống Spam (Anti-Flood Cooldown):** Giới hạn tần suất 600ms giữa 2 lần gửi tin liên tiếp của một người chơi.
- **Giới hạn độ dài:** Tối đa 120 ký tự cho mỗi tin nhắn để tránh tràn giao diện.
- **Quản lý bộ nhớ RAM in-memory:** Bàn đấu lưu trữ tối đa 50 tin nhắn gần nhất; tự động đồng bộ và khôi phục 100% khi người chơi F5 / Reconnect lại phòng đấu.
- **Miễn trừ lượt đi (`isTurnExempt`):** Cho phép mọi người chơi chat tự do mọi lúc, không phụ thuộc vào lượt đi hiện tại hay trạng thái kết thúc ván đấu.

### 📐 Tối Ưu Bố Cục Giao Diện (Layout & Styling)
- **Tự động cân chỉnh vị trí động (`TabletopFit.js`):** Tự động tính toán biến CSS `--panel-bottom-offset` dựa trên chiều cao thực tế của `#my-player-panel` và mức zoom trình duyệt (50%, 67%, 75%, 100%), đảm bảo khung chat luôn hiển thị hoàn hảo phía trên thanh điều khiển người chơi mà không bị che khuất.
- Thiết kế chuẩn Glassmorphism: Nền mờ khói đen, viền sáng tinh tế, bong bóng chat riêng biệt cho bản thân (nền ngọc lục bảo) và đối thủ.

### 🧪 Kiểm Thử Tự Động (Testing)
- Bổ sung 5 Unit Tests trong `GameEngineTest.java` và 1 Integration Test trong `MultiPlayerGameFlowIntegrationTest.java` (Nâng tổng số test backend lên **28/28 tests PASS 100%**).
- Bổ sung kịch bản kiểm thử E2E Node.js đa tab `tests/test_in_game_chat_e2e.js` xác thực chống spam, khử độc XSS và đồng bộ tin nhắn đa client.

---

## 📜 [v1.1.0] — 2026-10-08
### ✨ Tính Năng Mới (Features)
- **Nhật Ký Hành Động Thời Gian Thực (Game Action Logs):**
  - Ghi nhận chi tiết từng nước đi của người chơi: bốc token, giữ thẻ, trồng cây, rước khách quý, kích hoạt lượt chung kết khi chạm mốc 15 điểm.
  - Widget nổi bật tại góc trên bên phải (Top-Right), có khả năng thu gọn thành 1 dòng Mini Ticker mỏng nhẹ.
  - Token badge highlight sinh động cho từng loại năng lượng (Đất, Nước, Nắng, Hạt, Dinh dưỡng, Vàng).
  - Tự động cuộn theo hành động mới nhất và lưu trữ 50 nhật ký gần nhất trong `GameState`.
- **Huy hiệu phiên bản ứng dụng (`.app-version-badge`):** Hiển thị phiên bản v1.1.0 tại các màn hình chính, sảnh chờ và phòng chờ.

---

## 🌿 [v1.0.0] — 2026-10-04
### 🚀 Bản Phát Hành Khởi Đầu (Initial Release)
- **Bàn Cờ Chiến Thuật Tabletop 3D:** Lấy cảm hứng từ luật chơi Splendor với chủ đề xây dựng vườn sinh thái.
- **Hệ thống 6 loại tài nguyên năng lượng:** Đất, Nước, Ánh Sáng, Hạt Giống, Dinh Dưỡng và Phân Bón Vàng WILD.
- **Guồng máy tích lũy (Engine Building):** Nuôi trồng cây thuộc 3 cấp độ (Tier 1, 2, 3) để tích lũy điểm uy tín vĩnh viễn và giảm giá chi phí mua cây tiếp theo.
- **Khách Thăm Vườn (Visitors):** Tự động ghé thăm và cộng ngay 3★ khi khu vườn đáp ứng đủ điều kiện số lượng cây trồng.
- **Phòng Chờ Đa Người Chơi (Waiting Room):**
  - Quản lý chủ phòng (Room Host), bắt đầu trận đấu 2–4 người chơi.
  - Tính năng kick người chơi và cấm vào lại phòng (cooldown ban 2 phút).
- **Đồng bộ thời gian thực qua WebSocket Native.**
- **Triển khai Cloud Hosting:** Vercel (Frontend), Render (Backend Java 21 Spring Boot), Clever Cloud (PostgreSQL).
