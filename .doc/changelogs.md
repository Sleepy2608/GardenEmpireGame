# 📜 NHẬT KÝ THAY ĐỔI & LỊCH SỬ PHIÊN BẢN (CHANGELOG)

Tất cả các thay đổi đáng chú ý của dự án **Garden Empire Game** được ghi chép và lưu trữ đầy đủ tại tài liệu này từ giai đoạn khởi tạo ban đầu (v0.0.0).  
Định dạng dựa trên [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), và dự án tuân thủ [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## 🚀 [v1.3.1] — 2026-10-16
### 🐛 Sửa Lỗi & Ổn Định Hệ Thống (Bug Fixes & Concurrency)
- **Khắc Phục Triệt Để Lỗi Tạo Nhiều Phòng Khi Nhấp Chuột Liên Tục (Anti-Spam & Duplicate Room Prevention):**
  - **Phòng thủ đa tầng Client - Server:**
    - **Frontend Lock & UX:** Bổ sung cờ mutex `isCreatingRoom` và `isJoiningRoom` trong `LobbyUI.js`. Khi bấm tạo hoặc vào phòng, lập tức vô hiệu hóa nút bấm (`disabled`), khóa các ô nhập liệu, kích hoạt trạng thái loading với spinner quay mượt mà (`⏳ Đang khởi tạo phòng...`). Tự động mở khóa an toàn trong khối `finally` kèm timeout an toàn 8 giây nếu mất kết nối.
    - **Backend Rate-Limiting & Cooldown (2.5s):** Quy định cooldown tạo phòng 2.5 giây cho mỗi Host (`ROOM_CREATION_COOLDOWN_MS = 2500`). Đồng bộ hóa đa luồng qua `hostId.intern()` ngăn chặn race conditions trên Tomcat.
    - **Xử Lý Thông Minh Trùng Lặp (Idempotent Reuse):** Nếu cùng một Host gửi nhiều request tạo phòng liên tiếp trong vòng 2.5 giây (do double-click hoặc độ trễ mạng), server tự động nhận diện và tái sử dụng phòng chờ vừa tạo thay vì sinh ra phòng rác mới.
    - **Tự Động Dọn Phòng Chờ Cũ (Active Room Cleanup):** Tự động dọn dẹp triệt để bất kỳ phòng `WAITING` mồ côi nào trước đó của Host bằng `cleanupService.deleteRoomCompletely()`, đảm bảo 1 Host không bao giờ có 2 phòng chờ cùng xuất hiện trên Sảnh.
    - **Kiểm Thử Đơn Vị Tự Động:** Bổ sung bộ kiểm thử `RoomServiceTest.java` với 4 kịch bản kiểm thử concurrency, idempotent duplicate handling và cooldown cleanup, nâng tổng số test backend lên **32/32 tests PASS 100%**.

---

## 🚀 [v1.3.0] — 2026-10-14
### ✨ Nâng Cấp Giao Diện & Trải Nghiệm (UI/UX)
- **Đại Tu Toàn Diện Hộp Thoại Luật Chơi Bàn Đấu (In-Game Rules Modal Overhaul):**
  - Chuyển đổi từ danh sách chữ cơ bản thành giao diện Bách Khoa Toàn Thư phân tab cao cấp gồm **5 Tab điều hướng trực quan**:
    1. **🎯 Mục Tiêu & Tổng Quan:** Quy định ngưỡng 15 Điểm Uy Tín kích hoạt Vòng Chung Kết, bản chất xây dựng guồng máy tài nguyên (*Engine Building*) và Bảng ánh xạ đối sánh chi tiết 100% các thành phần Splendor $\leftrightarrow$ Garden Empire.
    2. **⚡ 3 Hành Động Lượt Đi:** Phân tích trực quan 3 hành động chính trong lượt (Lấy token 3 khác màu hoặc 2 cùng màu khi cọc $\ge 4$, Trồng cây có trừ giảm giá vĩnh viễn & bù WILD ⭐, Đặt chỗ thẻ bài tối đa 3 thẻ trên tay nhận +1 WILD) kèm công thức chi phí rõ ràng.
    3. **✨ Khách & Giảm Giá Vĩnh Viễn:** Minh họa 3 bước của guồng máy giảm giá tích lũy (*Snowball Effect*), 2 hành động phụ tự động (hoàn trả token khi vượt quá 10 viên và tự động rước Khách Thăm Vườn +3★).
    4. **⚖️ Thiết Lập & Thắng Bại:** Bảng ma trận điều chỉnh tài nguyên và khách theo 2, 3, 4 người chơi; quy chế Vòng Chung Kết công bằng số lượt và **Luật Bẻ Hòa Điểm (Tie-Breaker Rule)** chuẩn quốc tế: *Khi bằng điểm, người mua ít thẻ cây hơn sẽ giành chiến thắng*.
    5. **💡 Cẩm Nang Chiến Thuật:** Bí quyết thực chiến qua từng giai đoạn ván đấu (Đầu game mầm xanh Tier 1, Giữa game đặt chỗ phá lối chơi đối thủ, Cuối game tạo bước nhảy điểm bứt phá).
  - Bổ sung thanh điều hướng phân trang (Nút `← Trang Trước`, `Trang Sau →`, chỉ báo `Trang X / 5`), thanh tab trượt mượt mà và hỗ trợ đóng modal nhanh bằng phím `✕`, nút "Đã Hiểu" hoặc click ngoài phông nền (Backdrop).
  - Thiết kế chuẩn Glassmorphism sinh thái, huy hiệu tài nguyên (🟫, 💧, ☀️, 🌰, 🧪, ⭐) đồng bộ với bàn cờ, thân thiện trên mọi độ phân giải.

### 🛡️ Tối Ưu Backend & Trình Biên Dịch (Build & Architecture)
- **Tương thích Java 21 / 25 & Lombok 1.18.38:**
  - Chuyển đổi các Spring Service và Controller sang sử dụng Explicit Constructor Injection thay cho `@RequiredArgsConstructor` để tương thích hoàn toàn với Eclipse JDT / ECJ của VS Code Language Server và Maven Compiler.
  - Cấu hình chuẩn xác `maven-compiler-plugin` 3.11.0 và annotation processor path cho Lombok.
  - Bảo đảm 100% 28/28 Unit & Integration tests vượt qua với `BUILD SUCCESS`.

### 📚 Cập Nhật Tài Liệu Dự Án (.doc/)
- **Cập nhật `.doc/revelant_links.md`:** Bổ sung liên kết tham khảo từ **Board Games Fandom Splendor** và cẩm nang tiếng Việt từ **BoardGame VN**.
- **Cập nhật `.doc/how_to_play.md`:** Bổ sung Mục 9 về danh mục tài liệu tham khảo chuẩn quốc tế, tinh chỉnh chi tiết bảng thiết lập bàn cờ cùng luật bẻ hòa điểm.

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

## 📜 [v1.1.0] — 2026-10-09
### ✨ Tính Năng Mới (Features)
- **Nhật Ký Hành Động Thời Gian Thực (Game Action Logs):**
  - Ghi nhận chi tiết từng nước đi của người chơi: bốc token, giữ thẻ, trồng cây, rước khách quý, kích hoạt lượt chung kết khi chạm mốc 15 điểm.
  - Widget nổi bật tại góc trên bên phải (Top-Right), có khả năng thu gọn thành 1 dòng Mini Ticker mỏng nhẹ.
  - Token badge highlight sinh động cho từng loại năng lượng (Đất, Nước, Nắng, Hạt, Dinh dưỡng, Vàng).
  - Tự động cuộn theo hành động mới nhất và lưu trữ 50 nhật ký gần nhất trong `GameState`.
- **Huy hiệu phiên bản ứng dụng (`.app-version-badge`):** Hiển thị phiên bản v1.1.0 tại các màn hình chính, sảnh chờ và phòng chờ.

### 🧪 Kiểm Thử Tự Động (Testing)
- Bổ sung các bài kiểm tra logic ghi log trong `GameEngineTest.java`.
- Bổ sung kịch bản kiểm thử tích hợp đa tab `tests/test_game_action_logs_e2e.js` xác thực tính năng ghi nhận và đồng bộ action logs thời gian thực.

### 📚 Tài Liệu (Documentation)
- Cập nhật README và tài liệu cẩm nang cách chơi mô tả khu vực nhật ký bàn đấu.

---

## 🌳 [v1.0.4] — 2026-10-08
### ✨ Tính Năng Mới & Đồ Họa Bàn Cờ (Tabletop 3D Arena & Fertilizer)
- **Tái Cấu Trúc Bàn Đấu 3D Tabletop Arena:**
  - Thiết kế bàn cờ phẳng 3D chân thực: Thảm đấu trung tâm (Central Mat), các khay thẻ phân tầng rõ rệt (Tier 1 🌱, Tier 2 🌿, Tier 3 🌳) và khay Khách Thăm Vườn danh giá.
  - Hiệu ứng chiều sâu đa lớp cho xấp bài úp (`layered deck stacks`) và hiệu ứng phản quang lấp lánh cho các viên ngọc năng lượng.
  - Hào quang nhấp nháy phát sáng (`aura pulse`) trên thanh điều khiển người chơi khi đến lượt của mình.
- **Phân Bón Vàng WILD Token:**
  - Bổ sung tài nguyên đồ họa Phân Bón Vàng và ánh xạ chính thức token WILD thành Phân Bón Vàng trong toàn bộ giao diện và logic.
- **Thư Viện Thẻ Khách Thăm Vườn (Visitors Catalog):**
  - Tích hợp đầy đủ metadata linh vật và hiển thị đồ họa các vị khách cao quý: Ong Chúa, Bướm Alexandra, Bọ Rùa, Chim Ruồi, Sóc Nâu...
- **Chuẩn Hóa Thuật Ngữ Tài Nguyên:**
  - Đồng bộ đổi tên gọi tài nguyên từ "Earth" sang "Dirt" (Đất) trên cả Client và Server.

### 📐 Tối Ưu Bố Cục & Đường Dẫn Web
- **Bộ Điều Chỉnh Kích Thước Bàn Cờ Tự Động (`TabletopFit.js`):**
  - Tự động co giãn theo tỷ lệ màn hình thực tế, cố định vị trí thanh điều khiển người chơi ở đáy màn hình.
- **Đường Dẫn Sạch (Clean URLs):**
  - Loại bỏ hoàn toàn phần mở rộng `.html` trên URL (`/game`, `/waiting-room`, `/lobby`), cấu hình rewrite đồng bộ trên Vercel.
- **Tích Hợp Vercel Speed Insights:**
  - Đo lường và giám sát tốc độ tải trang, Core Web Vitals thời gian thực.

---

## 🎨 [v1.0.3] — 2026-10-07
### ✨ Cải Tiến Giao Diện & Hình Ảnh (UI & Assets)
- **Hệ Thống Icon Tài Nguyên Trực Quan:**
  - Tích hợp bộ biểu tượng đồ họa cho từng loại năng lượng: Đất 🟫, Nước 💧, Ánh Sáng ☀️, Hạt Giống 🌰, Dinh Dưỡng 🧪, Phân Bón ⭐.
  - Cập nhật hiển thị token và chi phí trên các thẻ người chơi (Player Cards) trực quan và dễ nhận biết hơn.

### 📚 Tài Liệu Hướng Dẫn (Documentation)
- **Khởi Tạo Cẩm Nang Cách Chơi (`how_to_play.md`):**
  - Soạn thảo tài liệu hướng dẫn chơi chi tiết từ quy tắc cơ bản đến các mẹo chiến thuật xây dựng guồng máy tài nguyên.
  - Cập nhật README dự án và tài liệu hướng dẫn icon người chơi.

---

## 🛡️ [v1.0.2] — 2026-10-07
### 🛡️ Bảo Mật & Quản Lý Phiên (Security & Session Management)
- **Cơ Chế Chống Đăng Nhập Trùng Lặp (SessionGuard):**
  - Theo dõi phiên người chơi toàn cục theo thời gian thực trên WebSocket backend.
  - Tự động ngắt kết nối phiên cũ và hiển thị hộp thoại cảnh báo xung đột tài khoản (Conflict Modal Overlay) nếu phát hiện tài khoản đăng nhập từ tab hoặc thiết bị khác.
  - Tích hợp mô-đun `sessionGuard` xuyên suốt toàn bộ các màn hình: Đăng nhập, Sảnh chờ, Phòng chờ và Bàn đấu.

### ⚡ Hiệu Năng & Trải Nghiệm (Performance & UX)
- **Tối Ưu Hóa Sảnh Chờ (Lobby Room List):**
  - Bổ sung cơ chế làm ấm máy chủ (backend pre-warming), cache SWR và hiệu ứng tải khung xương (Skeleton Loading) giúp hiển thị danh sách phòng mượt mà.
- **Tối Ưu Độ Tương Phản & Khoảng Cách Bàn Cờ:**
  - Nới rộng khoảng cách giữa các bảng người chơi và tinh chỉnh màu sắc tương phản giúp dễ quan sát.
- **Sửa Lỗi Máy Chủ:**
  - Bỏ qua ngoại lệ `game-not-started` đối với chủ phòng trong `GameService`.

### 🧪 Tái Cấu Trúc Kiểm Thử (Testing)
- Di chuyển bộ kịch bản kiểm thử tự động đa tab `test_multi_tab.js` vào thư mục chuẩn `tests/`.

---

## 👥 [v1.0.1] — 2026-10-06
### ✨ Tính Năng Mới (Features)
- **Phòng Chờ Đa Người Chơi & Quản Trị Chủ Phòng (Waiting Room & Host Management):**
  - Màn hình phòng chờ chuyên biệt hiển thị danh sách người chơi tham gia, avatar và trạng thái sẵn sàng.
  - Quyền hạn Chủ phòng (Host): Bắt đầu trận đấu khi đủ điều kiện hoặc kích hoạt nhật ký sự kiện phòng.
- **Tính Năng Kick & Phạt Cấm Vào Lại Phòng:**
  - Cho phép chủ phòng loại bỏ (Kick) người chơi không mong muốn; áp dụng thời gian chờ phạt cấm vào lại 2 phút (2-minute cooldown ban).
- **Ràng Buộc Quy Mô Phòng Đấu:**
  - Ngăn chặn bắt đầu trận đấu khi có ít hơn 2 người chơi; áp dụng nghiêm ngặt ràng buộc từ 2 đến 4 người chơi trong `GameEngine`.

### 🌐 Tối Ưu Chia Sẻ Mạng Xã Hội (SEO & Open Graph)
- Tích hợp ảnh đại diện xem trước Open Graph (`graden_empire.png`) tối ưu tỷ lệ 1200x675 chuẩn Facebook / Zalo, favicon và meta tags bảo mật.
- Bổ sung Giấy phép mã nguồn mở MIT License.
- Nâng phiên bản lên v1.0.1 và tài liệu hóa tính năng Waiting Room.

---

## 🌿 [v1.0.0] — 2026-10-04
### 🚀 Bản Phát Hành Khởi Đầu (Initial Production Release)
- **Kiến Trúc Bàn Cờ Bách Thảo Trực Tuyến:**
  - Chuyển thể luật chơi kiệt tác Splendor sang chủ đề kiến tạo khu vườn thực vật hoàng gia.
  - Hệ thống 6 loại tài nguyên năng lượng: Đất, Nước, Ánh Sáng, Hạt Giống, Dinh Dưỡng và Phân Bón Vàng WILD.
  - Guồng máy tích lũy (Engine Building): Ươm mầm cây thuộc 3 cấp độ (Tier 1 🌱, Tier 2 🌿, Tier 3 🌳) để nhận điểm uy tín vĩnh viễn và giảm giá chi phí mua cây tiếp theo.
  - Khách Thăm Vườn (Visitors): Tự động ghé thăm mang lại ngay +3 Điểm Uy Tín (3★) khi khu vườn đủ điều kiện.
- **Tích Hợp Cơ Sở Dữ Liệu PostgreSQL:**
  - Kết nối cơ sở dữ liệu Clever Cloud PostgreSQL thông qua Spring Data JPA và Hibernate ORM.
  - Quản lý cấu hình kết nối an toàn qua biến môi trường.
- **Triển Khai Đám Mây Toàn Diện:**
  - Máy chủ Backend Java 21 Spring Boot triển khai trên Render Cloud, cấu hình tối ưu HikariCP Connection Pool.
  - Ứng dụng Frontend triển khai trên Vercel CDN với cấu hình modern rewrites.
- **Huy Hiệu Phiên Bản & SEO:**
  - Bổ sung huy hiệu v1.0.0 trên giao diện sảnh chờ và phòng đấu.
  - Khởi tạo sitemap và các thẻ meta SEO cơ bản.

---

## 🏗️ [v0.0.0] — 2026-09-27 đến 2026-10-02
### 🧪 Giai Đoạn Nguyên Mẫu & Xây Dựng Nền Tảng Cốt Lõi (Prototype & Foundation)

#### 1. Khởi Tạo Dự Án & Kiến Trúc Ban Đầu (2026-09-27 & 2026-09-28)
- Khởi tạo kho mã nguồn dự án (Initial commit).
- Thiết lập cấu hình dự án ban đầu, `.gitignore`, `.gitattributes` và Docker Compose.
- Xây dựng cấu trúc thư mục Client, các trang HTML (Login, Lobby, Game), CSS và các mô hình dữ liệu frontend.
- Khởi tạo dự án Spring Boot, mô hình miền trò chơi (Game, Player, Card, Room) và các REST Controller / WebSocket Handler ban đầu.
- Cấu hình triển khai Vercel, Dockerfile backend đa tầng và các endpoint WebSocket linh hoạt.

#### 2. Xây Dựng Game Engine & Quy Tắc Trò Chơi (2026-09-29)
- Thiết kế phân hạng 3 Tier thẻ cây trồng và danh mục thẻ Khách Thăm Vườn; cân bằng chi phí và điểm uy tín.
- Chuyển dịch hệ thống tài nguyên đá quý Splendor sang hệ năng lượng sinh thái bách thảo.
- Xây dựng cỗ máy trò chơi cốt lõi (`GameEngine`), quản lý trạng thái lượt đi và quy tắc trò chơi.
- Bộ kiểm thử đơn vị JUnit cho kịch bản bàn cờ 2, 3 và 4 người chơi.
- Tách biệt chuẩn xác **3 hành động chính** (Lấy token, Trồng cây, Đặt chỗ) và **2 hành động phụ tự động** (Trả token dư quá 10, Tự động rước khách).

#### 3. Thiết Kế Giao Diện Bàn Cờ & Trải Nghiệm Người Dùng (2026-09-29 & 2026-09-30)
- Xây dựng hệ thống Design Tokens CSS, bảng màu xanh thực vật tự nhiên (Botanical Theme), hiệu ứng kính mờ và animation.
- Dựng layout bàn cờ chính, banner lượt đi, khay tài nguyên, thẻ bài và các lớp phủ Modal.
- Thiết kế Dashboard người chơi, thông tin phòng sảnh chờ và modal hướng dẫn luật chơi cơ bản ban đầu.
- Tinh chỉnh bảng chọn token thành hộp ngang linh hoạt.

#### 4. Đồng Bộ Thời Gian Thực & Âm Thanh Web Audio (2026-09-30 & 2026-10-01)
- API và Controller tạo phòng, tham gia phòng chơi bằng mã code 6 ký tự.
- Đồng bộ hóa trạng thái bàn cờ thời gian thực qua WebSocket Native.
- Khởi tạo sẵn bàn cờ và bộ bài ngay khi tạo phòng để tránh xung đột đồng bộ khi người chơi khác tham gia.
- Cơ chế khóa đồng thời (Room Concurrency Lock), chống xung đột dữ liệu (Anti-Race Condition) và khôi phục kết nối liền mạch khi F5 / Reconnect.
- Tích hợp Web Audio API phát âm thanh tổng hợp tự nhiên sinh động khi nhặt token, trồng cây, và bục vinh quang chiến thắng (Victory Podium).
- Kiểm thử tự động E2E đa tab xác thực toàn bộ vòng đời một ván đấu thời gian thực.

#### 5. Tự Động Thu Dọn Phòng & Đóng Gói Docker (2026-10-01 & 2026-10-02)
- Thiết kế danh sách phòng dạng thẻ hàng ngang hiện đại; lọc chỉ hiển thị các phòng còn chỗ trống để tham gia.
- Tự động rời phòng và đóng socket khi quay lại sảnh sau khi kết thúc ván đấu; tự động giải phóng RAM phòng chơi.
- Xây dựng `RoomCleanupService` với `@EnableScheduling` tự động quét dọn và hủy các phòng không hoạt động định kỳ.
- Đóng gói Dockerfile đa tầng cho backend với tối ưu JVM, Nginx reverse proxy cho frontend và Docker Compose điều phối toàn bộ hệ thống.
- Cấu hình môi trường động linh hoạt (`window.APP_CONFIG`), hỗ trợ kiểm thử đa tài khoản trên môi trường cục bộ (localhost).
