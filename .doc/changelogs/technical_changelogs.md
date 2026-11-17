# 🏛️ NHẬT KÝ KỸ THUẬT & KIẾN TRÚC MÃ NGUỒN CHI TIẾT (DETAILED TECHNICAL CHANGELOG)

Tài liệu này lưu trữ toàn bộ các ghi chép kỹ thuật chuyên sâu của dự án **Garden Empire Game** dành cho Lập trình viên, Kiến trúc sư hệ thống và Chuyên viên kiểm thử (QA). Mỗi phiên bản mô tả chi tiết: tính năng, thay đổi kiến trúc, tệp mã nguồn liên quan, phương thức/hàm triển khai, cơ chế đồng bộ, và kết quả kiểm thử tự động.

> 💡 **Dành cho người chơi & người dùng cuối:** Vui lòng xem bản tóm tắt tính năng ngắn gọn, trực quan tại [`.doc/changelogs.md`](changelogs.md).

---

## 🚀 [v1.7.0] - 2026-11-17
### 🤖 Động Cơ Trợ Lý Bot Thông Minh, Tự Động Tiếp Quản & Đấu Trường 4 Bot (Smart AFK Bot, Autonomous Takeover & Tournament Engine)
- **Kiến Trúc Động Cơ Bot Heuristic Độc Lập 4 Cấp Độ (`SmartAfkBotEngine.java`):**
  - **Cấp độ 1 - Mua Thẻ Cây Tối Ưu (Buy Card Priority):** Quét toàn bộ thẻ cây khả dụng (bao gồm thẻ lộ diện trên bàn và kho bài giữ của bot). Đánh giá hàm tiện ích kết hợp giữa điểm Uy Tín ★, tier sinh thái (Tier 2 Sweet Spot), và giá trị thúc đẩy Khách Quý (+3★ ~ 38.0 utility). Tự động rước Khách Quý và khấu trừ tài nguyên chuẩn xác.
  - **Cấp độ 2 - Đặt Chỗ Thẻ Trọng Điểm & Tích Lũy Phân Bón Vàng (Reserve Key Card):** Khi không thể mua thẻ ngay lập tức nhưng kho bài giữ còn chỗ (< 3 thẻ), bot tự động đặt chỗ thẻ mục tiêu có tỷ lệ giá trị/khoảng cách cao nhất hoặc thẻ đối thủ đang nhắm tới, nhận ngay 1 token Phân Bón Vàng WILD ⭐.
  - **Cấp độ 3 - Bốc Token Chiến Thuật (Strategic Token Harvesting):** Phân tích thẻ mục tiêu dài hạn để ưu tiên bốc 2 token cùng loại (nếu bank $\ge 4$) hoặc bốc 3 token khác loại bù đắp trực tiếp các màu còn thiếu.
  - **Cấp độ 4 - Bảo Vệ Ngưỡng 10 Token & Lọc Trả Token Thừa (Hand Cap Guard & Smart Discard):** Thuật toán mô phỏng tay bài ảo để tự động giữ lại các token phục vụ thẻ mục tiêu và trả lại ngân hàng các token ít giá trị nhất, đảm bảo người chơi không bao giờ vượt trần 10 token.
- **Cơ Chế Tiếp Quản Ván Đấu Tức Thời Khi Người Chơi Rời Bàn / AFK Timeout (`GameEngine.java`, `GameService.java`):**
  - **Instant Bot Takeover (`handlePlayerLeave`):** Khi người chơi đột ngột mất kết nối hoặc rời phòng, thay vì kết thúc ván đấu hoặc làm gián đoạn bàn cờ, hệ thống gắn cờ `isBot = true`, cập nhật tên `[Tên] (🤖 Bot)`, và bàn giao quyền điều khiển cho Smart AFK Bot tiếp tục thi đấu.
  - **Auto-Turn Timer Integration:** Tích hợp bộ đếm giờ tự động nhận diện `player.isBot()` và kích hoạt `executeBotTurn()` sau độ trễ tự nhiên 300ms, đảm bảo nhịp độ ván đấu liền mạch không độ trễ.
  - **Bảo Vệ Walkover Chính Xác:** Duy trì kiểm tra nếu toàn bộ người thật đều rời bàn thì trận đấu mới kết thúc chiến thắng mặc định.
- **Trực Quan Hóa Huy Hiệu Bot & Phản Hồi Giao Diện Người Dùng (`client/`):**
  - **Huy Hiệu Trợ Lý Bot Bản Thân:** Thanh điều khiển hiển thị huy hiệu `🤖 TRỢ LÝ BOT` khi người chơi được bot tiếp quản hoặc đóng vai trò bot.
  - **Huy Hiệu Đối Thủ Bot:** Khung thẻ đối thủ gắn badge `.badge-bot` với biểu tượng `🤖 BOT`, phối hợp linh hoạt cùng vương miện Chủ Phòng 👑 và viền sáng Active Turn.
  - **Phân Biệt Trạng Thái Minh Bạch:** Tách biệt rõ ràng 3 trạng thái: Đang thi đấu bình thường, Bot tiếp quản (`🤖 BOT`), Rời bàn (`🍂 Đã Rời Ván`), và Bị truất quyền (`⏳ Truất Quyền AFK`).
  - **Thông Báo Tiếp Quản (Bot Takeover Toast & Chat):** Đẩy thông báo hổ phách và tin nhắn hệ thống vào khung Chat khi Bot tiếp quản người chơi rời phòng.
- **Đấu Trường 4 Bot Tự Động & Bộ Benchmark Siêu Tốc (`SmartAfkBotEngineTest.java`):**
  - **Flora Valley 4-Bot Tournament:** Ván đấu 4 Bot (`Bot-Gia Định`, `Bot-Thăng Long`, `Bot-Hoa Lư`, `Bot-Phú Xuân`) diễn ra tự động 100% từ đầu tới khi chạm ngưỡng 15★ và phân định Tiebreaker ít thẻ hơn thắng.
  - **Tốc Độ Tính Toán Kỷ Lục:** Trung bình chỉ **~0.15ms (150 µs)** cho một nước đi; toàn bộ một ván cờ 110-125 lượt của 4 Bot hoàn tất trong chưa đầy **0.05 giây** (40-55ms).
  - **Test Thực Nghiệm Tiếp Quản:** Mô phỏng thành công người chơi đột ngột disconnect giữa chừng, Bot lập tức tiếp quản nước đi và chuyển lượt hợp lệ.

### ⚙️ Hệ Thống Cài Đặt Toàn Cục & Tùy Chọn Trải Nghiệm Đa Phân Khu (Global Settings Button & Modular Preferences System)
- **Kiến Trúc Quản Lý Cấu Hình Tập Trung (`client/js/settings/SettingsManager.js`):**
  - Quản lý tập trung 3 nhóm cấu hình: `audio` (Master / BGM / SFX Volume & Mute), `display` (Eco Particles, Reduced Motion, Card Hover Zoom), và `gameplay` (Turn Alert Sound, Chat Message Sound, Colorblind Mode, Bot Strategy Hint).
  - Tự động lưu và khôi phục từ `localStorage` (`garden_empire_user_settings`), đồng bộ 2 chiều tương thích ngược với các khóa legacy (`garden_empire_sound_muted`, `garden_empire_bgm_volume`).
  - Tính toán ma trận âm lượng hiệu lực độc lập: Effective BGM = Master * BGM, Effective SFX = Master * SFX.
  - Cơ chế Event Bus nội bộ (`addListener`) phát sóng tức thì các thay đổi tới `BGMController`, `SoundFX` và giao diện người dùng.
- **Giao Diện Modal Kính Mờ 4 Phân Khu Ngữ Nghĩa (`client/css/settings.css`, `client/js/ui/SettingsUI.js`):**
  - Cấu trúc Deep Forest Glassmorphism sang trọng với 4 Tabs chuyển đổi mượt mà bằng cả chuột và phím mũi tên:
    * *Tab Âm Thanh (Audio):* 3 Sliders Master, BGM, SFX với nhãn phần trăm trực quan, 3 nút Mute độc lập, nút "Thử Âm" nghe thử xúc giác SFX.
    * *Tab Đồ Họa (Display):* 3 Toggle Switches kiểm soát hạt bào tử đom đóm (Eco Particles), giảm chuyển động (Reduced Motion), và phóng to thẻ bài khi hover (Card Hover Zoom).
    * *Tab Bàn Đấu (Gameplay):* Toggle chuông báo khi đến lượt (Turn Alert Sound), chuông tin nhắn chat (Chat Message Sound), chế độ hỗ trợ khiếm thị màu (Colorblind Mode), và hiển thị gợi ý Bot.
    * *Tab Hệ Thống (System):* Nút chuyển đổi toàn màn hình (Fullscreen), hiển thị số hiệu phiên bản v1.7.0, danh mục phím tắt hữu ích (`O`, `,`, `Esc`, `M`), ghi nhận tác quyền âm nhạc CC-BY 4.0.
  - Header với biểu tượng ⚙️ phát quang và nút đóng ✕, Footer trang bị nút "Khôi Phục Mặc Định" (Reset to Defaults) và nút "Xong" xác nhận.
- **Tích Hợp Đồng Bộ Trên Toàn Bộ 5 Màn Hình Trải Nghiệm:**
  - Nút Bánh Răng `#btn-open-settings` tích hợp nhất quán trên Header Cổng Chào (`welcome.html`), Sảnh Chờ (`lobby.html`), Phòng Chờ (`waiting-room.html`), Bảng Điều Khiển (`index.html`) và Bàn Cờ Thi Đấu Tabletop (`game.html`).
  - Hỗ trợ phím tắt toàn cục: Nhấn phím `O` hoặc `,` để bật/tắt nhanh modal ở bất kỳ trang nào, phím `Esc` để đóng nhanh.
  - Tự động đồng bộ biểu tượng loa `#sound-icon` trên navbar khi tắt/bật âm thanh từ modal hoặc phím tắt.
- **Tối Ưu Hiệu Năng & Tương Tác Xúc Giác:**
  - Khi tắt Eco Particles hoặc bật Reduced Motion, canvas đom đóm `#particles-canvas` tạm dừng vòng lặp render animation để tiết kiệm CPU/GPU.
  - Bàn cờ in-game tự động phát chuông hòa âm E5, A5, C6 (`SoundFX.playTurnAlert()`) khi bắt đầu lượt đi của mình.
  - Khung Chat in-game tự động phát tiếng pop (`SoundFX.playChatPop()`) khi nhận tin nhắn mới từ đối thủ.
  - Bảo vệ nguyên trạng bàn cờ in-game (`game.html`), không ảnh hưởng luồng thi đấu hay kết nối WebSocket.
- **Tái Cấu Trúc Module Hóa Thư Mục Kiểm Thử & Runner Đệ Quy (`tests/`):**
  - Gom nhóm toàn bộ 25 tệp test vào 6 module chuyên biệt chuẩn Domain-Driven: `welcome/` (2 suites), `ui/` (11 suites), `bot/` (3 suites), `audio/` (4 suites), `regression/` (3 suites), `e2e/` (4 suites).
  - Nâng cấp `run_all_tests.js` thành runner quét đệ quy tự động nhận diện bài test mới, hỗ trợ cờ `--e2e` cho bài test WebSocket Live.
  - Bổ sung bộ kiểm thử chuyên trách cho tính năng Cài đặt: `tests/ui/test_settings_manager.js` (52 assertions), `tests/ui/test_settings_ui.js` (30 test cases), `tests/regression/test_issue_57_settings_button.js` (13 cases), `tests/audio/test_settings_audio_integration.js` (6 cases).
- **Đồng Bộ Số Hiệu Phiên Bản Toàn Hệ Thống:**
  - Nâng cấp lên **v1.7.0** trên toàn bộ Client Badges (`index.html`, `lobby.html`, `waiting-room.html`, `welcome.html`), Server Maven (`pom.xml`), README và tài liệu quy chuẩn `.agents/AGENTS.md`.

---

## 🚀 [v1.6.0] - 2026-11-16
### 🎵 Hệ Thống Nhạc Nền Phục Hưng & Âm Thanh Không Gian Đa Giai Đoạn (Renaissance Botanical Soundtrack & Dynamic BGM System)
- **Thư Viện Âm Thanh Phục Hưng CC-BY 4.0 Chuẩn Mực & Ghi Nhận Tác Quyền In-Game (`client/assets/audio/`):**
  - Tuyển chọn 5 kiệt tác âm nhạc chuẩn mực thời kỳ Phục Hưng sáng tác bởi nhà soạn nhạc danh tiếng **Kevin MacLeod** (Incompetech), cấp phép theo chuẩn quốc tế **Creative Commons: By Attribution 4.0 (CC-BY 4.0)**, dung lượng tối ưu ~25MB:
    * *Welcome Portal (Cổng Chào Đón):* `welcome-bgm.mp3` (*Willow and the Light*, ISRC `USUAN1100591`) - Âm hưởng cổ tích huyền bí, tiếng sáo và đàn hạc phương Tây ngân vang.
    * *Lobby & Waiting Room (Sảnh & Phòng Chờ):* `lobby-bgm.mp3` (*Angevin B*, ISRC `USUAN1200111`) - Giai điệu lute và sáo rộn ràng, thư thái đậm chất hội quán thời trung cổ - Phục Hưng.
    * *Tabletop Normal Turn (Bàn Cờ Lượt Thường):* `game-normal-bgm.mp3` (*Suonatore di Liuto*, ISRC `USUAN1400023`) - Độc tấu đàn lute Phục Hưng kinh điển, kích thích tư duy chiến thuật sâu sắc.
    * *Final Round (Vòng Chung Kết):* `game-final-bgm.mp3` (*Master of the Feast*, ISRC `USUAN1400019`) - Nhịp điệu trống và kèn Phục Hưng dồn dập, đẩy kịch tính lên đỉnh điểm khi kích hoạt ngưỡng 15 điểm.
    * *Victory Podium (Bục Vinh Danh):* `victory-fanfare.mp3` (*The Curtain Rises*, ISRC `USUAN1100085`) - Khúc khải hoàn kèn đồng ăn mừng chiến thắng rực rỡ.
  - Ghi nhận đầy đủ nguồn gốc và bản quyền tại `client/assets/audio/ATTRIBUTION.md`, chân trang `welcome.html` và Cẩm nang luật chơi `RulesUI.js`.
- **Module Quản Lý Nhạc Nền Độc Lập (`client/js/ui/BGMController.js`):**
  - **Kiến Trúc Máy Trạng Thái (Phase State Machine):** Phân chia 5 trạng thái phase chuẩn xác `WELCOME`, `LOBBY`, `GAME_NORMAL`, `GAME_FINAL`, `SILENCE`.
  - **Chuyển Cảnh Âm Lượng Tuyến Tính (Linear Sequential Fade):** Tự động fade-out bài cũ trước khi nạp source mới và fade-in êm ái, loại bỏ hoàn toàn hiện tượng ngắt âm thô ráp.
  - **Cơ Chế Volume Ducking Tự Động:** Hạ âm lượng nền xuống `0.08` khi phát SFX và xuống `0.05` khi đồng hồ lượt đi vào trạng thái khẩn cấp $\le 10\text{s}$, tự động unduck phục hồi về `0.25` khi qua lượt.
  - **Kháng Rào Cản Autoplay Policy:** Bắt và xử lý an toàn lỗi `NotAllowedError` từ trình duyệt di động / desktop; tự động mở khóa phát nhạc sau cử chỉ chạm đầu tiên (`click`, `pointerdown`, `keydown`).
- **Tích Hợp Giao Diện & Điều Khiển Toàn Cục (`client/`):**
  - **Nút Bật/Tắt Âm Thanh Toàn Cục:** Bổ sung nút `#btn-toggle-sound` trên Navbar Cổng Chào Đón (`welcome.html`, `welcome.css`), Sảnh Chờ (`lobby.html`), Phòng Chờ (`waiting-room.html`) và Bàn Cờ (`game.html`).
  - **Đồng Bộ Hai Chiều Với SoundFX:** Đồng bộ trạng thái tắt/bật giữa SFX và BGM thông qua khóa `garden_empire_sound_muted` trong `localStorage`.
  - **Kèn Khải Hoàn Chiến Thắng:** `SoundFX.playVictorySound()` tích hợp phát song song tệp kèn fanfare và tổng hợp sóng âm Web Audio.
- **Bộ Kiểm Thử Tự Động Toàn Diện (Zero-Regression):**
  - **Unit Test Suite:** `tests/test_bgm_controller.js` đạt 50/50 assertions.
  - **Integration Test Suite:** `tests/test_music_integration.js` đạt 29/29 assertions.
  - **E2E Lifecycle QA Suite:** `tests/test_audio_lifecycle_e2e.js` đạt 24/24 assertions mô phỏng chính xác hành trình 10 bước của người chơi.
  - **Frontend Runner:** 17/17 test suites (100% PASS).

### ⏱️ Giới Hạn Thời Gian Mỗi Lượt, Tự Động Thu Hoạch & Xử Phạt AFK 2 Lần (Turn Timer & Two-Strike AFK Management System)
- **Cấu Hình Thời Gian Mỗi Lượt Tại Phòng Chờ (`client/waiting-room.html`, `client/css/waiting-room.css`, `client/js/ui/WaitingRoomUI.js`, `RoomService.java`):**
  - **3 Tùy Chọn Thời Gian Linh Hoạt:** Cho phép Chủ phòng (Host) cấu hình thời gian suy nghĩ mỗi lượt trước khi khai mạc trận đấu: `1 Phút (Tiêu chuẩn)`, `2 Phút (Chiến thuật)`, `5 Phút (Thư thái)`.
  - **Segmented Pill Controls:** Giao diện cụm nút chọn viên nang kính mờ Deep Forest Glassmorphism, tự động đồng bộ thời gian thực qua WebSocket (`ROOM_UPDATE`) cho toàn bộ thành viên trong phòng chờ.
  - **Bảo Mật Quyền Host:** Endpoint `PUT /api/rooms/{id}/settings` xác thực quyền Chủ phòng và từ chối các giá trị ngoài danh mục (fallback về 60s an toàn).
- **Bộ Đếm Thời Gian Thực & Cơ Chế Xử Phạt AFK Backend (`server/`):**
  - **Thread-safe Scheduled Timer:** `GameService` tích hợp `ScheduledExecutorService` và `ReentrantLock` tự động kích hoạt bộ đếm ngược theo thời lượng đã cấu hình, hủy bộ đếm khi người chơi thực hiện nước đi hợp lệ.
  - **Thu Hoạch Tài Nguyên Tự Động Hợp Lệ:** Khi hết giờ lần 1, hệ thống tự động bốc ngẫu nhiên 1-3 token thường từ Bank cho người chơi (bảo đảm không vượt trần 10 token, tuyệt đối không bốc token Phân Bón Vàng WILD ⭐).
  - **Cơ Chế Phạt 2 Gậy (Two-Strike Out Rule):**
    * *Strike 1 (AFK Warning):* Bị phạt cảnh báo 1 lần (`consecutiveAfkCount = 1`), tự động skip lượt. Nếu ở lượt tiếp theo người chơi thực hiện nước đi hợp lệ (bốc token, đặt chỗ, mua cây, trả token), số gậy phạt lập tức được xóa về 0.
    * *Strike 2 (AFK Kick):* Nếu bỏ lỡ 2 lượt liên tiếp, người chơi lập tức bị truất quyền thi đấu (`hasLeft = true`). Ván đấu tự động chuyển lượt hoặc kích hoạt Thắng Mặc Định (Walkover Victory) nếu chỉ còn 1 người duy nhất.
    * *Anti-Freeze Turn Rotation:* Vòng xoay lượt tiếp theo vĩnh viễn bỏ qua người chơi đã bị truất quyền.
  - **WebSocket Event Broadcasts:** Phát sóng `AFK_TIMEOUT_WARNING` (kèm số gậy phạt) và `PLAYER_KICKED_AFK` tới toàn bộ bàn đấu.
- **Trực Quan Hóa Bàn Đấu, Thanh Đếm Ngược & Trải Nghiệm Xúc Giác (`client/`):**
  - **Banner Đếm Ngược Co-Axial (`game.html`, `game.css`, `BoardUI.js`):** Tích hợp thanh tiến trình `#turn-timer-track` / `#turn-timer-fill` và huy hiệu số `#turn-timer-badge` với `font-variant-numeric: tabular-nums` chống xô lệch layout.
  - **Đổi Màu Động 3 Cấp Độ:** Xanh ngọc bích Emerald (`.timer-safe` > 20%), Vàng hổ phách Amber (`.timer-warning` <= 20%), và Đỏ Ruby khẩn cấp (`.timer-danger` <= 10s) kết hợp animation nhịp tim `@keyframes charles-pulse-urgent`.
  - **Âm Thanh Tương Tác Web Audio (`SoundFX.js`):** Tích hợp âm thanh tích tắc nhịp tim `playTickTock()` khi <= 10s, âm thanh lướt gió `playWhooshSkip()` khi skip lượt, và tiếng búa phán quyết `playGavelStrike()` khi bị truất quyền.
  - **Huy Hiệu Ghế Ngồi Tabletop (`PlayerUI.js`):** Hiển thị huy hiệu `⚠️ AFK (1/2)` trên ghế người bị cảnh báo và `⏳ Truất Quyền AFK` kèm hiệu ứng mờ `player-abandoned` khi bị kick.
  - **Modal Truất Quyền Thi Đấu (`#afk-kicked-modal`):** Thông báo rõ ràng lý do bị kick và nút "Quay Về Sảnh".
- **Kiểm Thử Tự Động Toàn Diện (Zero-Regression Testing Suite):**
  - **Backend JUnit 5:** 58/58 test cases PASS 100% (bao gồm 11 test cases chuyên biệt trong `GameEngineTurnTimerTest.java`, `GameServiceTurnTimerTest.java`, `RoomServiceTest.java`).
  - **Frontend DOM & E2E:** 14/14 test suites PASS 100% (262 assertions đạt yêu cầu), bổ sung 3 test suite mới `test_waiting_room_turn_duration_ui.js` (22 cases), `test_board_turn_timer_ui.js` (49 cases), và `test_afk_and_kick_flow.js` (34 cases).
- **Đồng Bộ Số Hiệu Phiên Bản Toàn Hệ Thống:**
  - Đồng bộ số hiệu phiên bản lên **v1.6.0** trên toàn bộ Client Badges (`index.html`, `lobby.html`, `waiting-room.html`, `welcome.html`), Server Maven (`pom.xml`) và tài liệu quy chuẩn (`AGENTS.md`, `README.md`).

---

## 🚀 [v1.5.1] - 2026-11-15
### 🌿 Tinh Chỉnh Cổng Chào Tân Binh & Bảng Điều Khiển Nghệ Nhân (Welcome & Main Dashboard Index Refinements)
- **Cổng Chào & Trang Đích Tân Binh (`client/welcome.html`, `client/css/welcome.css`):**
  - **Tinh Gọn Header Navbar:** Loại bỏ tagline rườm rà "Flora Valley Codex", rút gọn danh sách menu xuống còn 3 phân khu cốt lõi (*Thung Lũng Flora*, *Hệ Sinh Thái*, *Quy Tắc*).
  - **Tối Giản Hero Section:** Loại bỏ 2 nút CTA trùng lặp ở khu vực Hero để tập trung thị giác vào tiêu đề H1 và bộ 3 thẻ cây trồng mẫu.
  - **Tối Giản Thẻ Bài Mẫu (Showcase Cards):** Chỉ giữ lại tên cây trồng (*Cỏ Ba Lá*, *Cự Sam Sequoia*, *Hoa Tulip*), loại bỏ phân hạng Tier và điểm sao thừa thãi.
  - **Chuẩn Hóa Footer & Danh Xưng Thương Hiệu:** Bỏ chú thích trong ngoặc đơn `( )`, thống nhất danh xưng thương hiệu `Garden Empire Game`, loại bỏ hậu tố "Project".
- **Bảng Điều Khiển Đăng Ký Vào Vườn Đấu (`client/index.html`, `client/css/index.css`):**
  - **Floating Glass Pill Topbar:** Nâng cấp thanh header thành khối viên nang kính mờ viền ngọc bích phát quang, kết hợp font chữ Phục Hưng `'Playfair Display', serif` sang trọng.
  - **Chuẩn Hóa Danh Xưng "Luật Chơi":** Thống nhất thay thế cụm từ "Cẩm nang..." thành "Luật chơi" trên toàn bộ giao diện (`index.html`, `RulesUI.js`, `lobby.html`, `welcome.html`).
  - **Fit Hoàn Hảo 5 Tabs Luật Chơi (Zero Scrollbar):** Tái cấu trúc `.codex-tabs-bar` dạng Grid 5 cột (`repeat(5, minmax(0, 1fr))`), rút gọn nhãn nút tab (*Giới Thiệu*, *Năng Lượng*, *Hành Động*, *Chợ Cây*, *Khách Quý*), triệt tiêu hoàn toàn thanh cuộn ngang khó nhìn.
  - **Tối Ưu Xúc Giác Nút CTA:** Loại bỏ emoji ở nút "Vào Sảnh Chờ" để giao diện trang nhã, tương phản cao trên nền gradient hoàng gia.
- **Nâng Cấp Phiên Bản Hệ Thống & Tự Động Hóa CI:**
  - Đồng bộ số hiệu phiên bản lên **v1.5.1** trên toàn bộ Client Badges (`index.html`, `lobby.html`, `waiting-room.html`, `welcome.html`), Server Maven (`pom.xml`) và tài liệu quy chuẩn (`AGENTS.md`, `README.md`).
  - **Thiết Lập GitHub Actions CI (`.github/workflows/ci.yml`):** Tự động chạy toàn bộ 11 bộ test Frontend (Node.js 22) và 41 bộ test Backend (Java 21 / Maven) khi có Push hoặc Pull Request vào `main`.
  - Bổ sung huy hiệu trạng thái CI Pipeline động trên `README.md`.

---

## 🚀 [v1.5.0] - 2026-11-14
### 🏛️ Cổng Chào Tân Binh, Cốt Truyện Đại Ngàn Flora Valley & Hệ Thống Chuyển Động Mượt Mà (Welcome Dashboard, Botanical Lore & Motion System)
- **Cổng Chào & Bảng Điều Khiển Khởi Động Tân Binh (Welcome Dashboard UI & Grand Portal):**
  - **Trang Đích Độc Bản (`client/welcome.html`, `client/css/welcome.css`, `client/js/welcome.js`):** Xây dựng trang chủ chào đón người chơi theo phong cách Deep Forest Glassmorphism & Renaissance Botanical Aesthetics, tuân thủ nguyên tắc chống rập khuôn từ các skill `design-taste-frontend`, `gpt-taste`, `charles-unslop`, `charles-polish`.
  - **Cấu Trúc Tiếp Thị Chuẩn AIDA:**
    * *Attention (Hero Section):* Tiêu đề rộng `hero-headline-wide` co giãn linh hoạt bằng `clamp()` chống gãy dòng, nút CTA chính `#hero-btn-start` mạ vàng hoàng gia đưa trực tiếp vào sảnh ván cờ.
    * *Interest (Resource Bento Grid):* Hiển thị trực quan 6 dòng tinh hoa năng lượng (Đất, Nước, Ánh Sáng, Hạt Giống, Dinh Dưỡng, Phân Bón Vàng WILD) trên lưới Gapless Bento Grid không ô chết.
    * *Desire (Ecosystem Showcase & Royal Visitors):* Trình diễn 3 cấp bậc thẻ thực vật học tiêu biểu với ảnh chụp thiên nhiên thực tế (Mầm non, Hoa quả, Đại thụ) và dải avatar của 10 Vị Khách Hoàng Gia quý phái.
    * *Action (Grand Portal Footer):* Cổng kết nối `#footer-btn-enter` thúc đẩy người chơi lập tức bước vào hành trình kiến tạo đế chế.
  - **Hiệu Ứng Bào Tử Đom Đóm Sinh Thái (`#particles-canvas`):** Render các hạt sáng lơ lửng tự nhiên trên nền canvas nhẹ nhàng, tự động ngắt animation khi thiết bị kích hoạt `prefers-reduced-motion`.
  - **Tối Ưu Zero-Latency Prefetch:** Ứng dụng `requestIdleCallback` tải ngầm trước tài nguyên `index.html` và gọi pre-warm danh sách phòng `/api/rooms` giúp việc mở game diễn ra trong tích tắc.
- **Kịch Bản & Cốt Truyện Thánh Địa Thực Vật Học Flora Valley (`.doc/storyline.md`):**
  - **Xây Dựng Cốt Truyện Sử Thi (Lore & World-Building):** Thiết lập bối cảnh Fantasy - Strategy - Nature - Renaissance tại Thung lũng Flora Valley, nơi các Master Gardener cạnh tranh giành sự công nhận tối cao từ Viện Hàn Lâm Thảo Mộc Hoàng Gia.
  - **Hệ Thống Phân Hạng Nghệ Nhân:** Lộ trình tiến hóa danh hiệu thực vật học rõ rệt: *Tập Sự (Apprentice) $\rightarrow$ Nghệ Nhân Ươm Mầm (Botanist) $\rightarrow$ Bậc Thầy Kiến Tạo (Master Gardener) $\rightarrow$ Đại Bậc Thầy Đế Chế (Grand Master of Flora Valley)* gắn liền với các mốc điểm Uy Tín ★ trong luật chơi.
- **Hệ Thống Chuyển Động & Chuyển Cảnh Toàn Diện (Full Page Motion & Transitions System):**
  - **Ứng dụng trọn bộ kỹ năng `charles-*`:** Tích hợp `charles-ux-animation`, `charles-polish`, `charles-unslop`, `charles-accent-heroes` cho toàn bộ các trang ngoại trừ bàn cờ in-game (`client/game.html` được bảo vệ nguyên trạng).
  - **Native View Transitions API:** Kích hoạt `@view-transition { navigation: auto; }` chuyển trang mềm mại giữa Welcome $\leftrightarrow$ Index $\leftrightarrow$ Lobby $\leftrightarrow$ Waiting Room.
  - **Tactile Button Press:** Phản hồi cơ học tức thì `:active { transform: scale(0.97); transition-duration: 80ms; }` và viền sáng ngọc bích trợ năng `:focus-visible` cho mọi nút bấm.
  - **Hiệu Ứng Chuyển Động Tinh Tế Từng Màn Hình:**
    * *Trang Đăng Ký (`index.html`):* Staggered entrance cascade, avatar picker nảy lò xo ngọc bích `scale(1.14)`, input glow lift, dải sáng quét qua nút Vào Sảnh.
    * *Sảnh Chờ (`lobby.html`):* Thẻ phòng rơi phân tầng bậc thang (`:nth-child(1..6)`), hover physics nâng nhẹ `translateY(-4px) scale(1.01)` cùng viền phát quang.
    * *Phòng Chờ (`waiting-room.html`):* Container cascade, thẻ người chơi bay vào với `@keyframes cardIn`, nhịp thở hoàng gia cho Chủ phòng (`hostBadgeGlow`), nút bắt đầu sẵn sàng (`startBtnPulse`), và thông báo Toast nảy lò xo (`toastPopIn`).
    * *Cẩm Nang Luật (`rules.css`):* Chuyển tab mượt mà bằng `codexFadeIn`, hover elevation cho thẻ năng lượng và hành động, bảo đảm 0 ký tự em-dash.
- **Đồng Bộ Routing Toàn Hệ Thống (Universal Routing & Rewrites):**
  - Cập nhật `vercel.json` định tuyến root `/` trỏ về `/client/welcome`.
  - Cập nhật `client/serve.json` định tuyến root `/` trỏ về `/welcome.html`.
  - Bổ sung nút quay lại trang Welcome từ thanh Top Bar của `client/index.html`.
- **Kiểm Thử Tự Động Giao Diện Mới (Welcome Verification Suite):**
  - Xây dựng tệp test suite chuyên trách `tests/test_welcome_dashboard_ui.js` gồm 21 test cases phủ trọn vẹn: tính toàn vẹn file, tiêu chuẩn AIDA, dữ liệu 6 tinh hoa/3 tier/10 khách quý, tối ưu giảm chuyển động và cấu hình routing -> Đạt **21/21 PASS 100%**.
  - Toàn bộ 111 test cases trên hệ thống kiểm thử tự động đều vượt qua tuyệt đối (**0 fail**).

---

## 🚀 [v1.4.1] - 2026-11-12
### 🍂 Thông Báo Người Chơi Rời Phòng, Chống Đóng Băng Lượt Đi & Chiến Thắng Mặc Định (Player Leave System & Walkover Victory)
- **Xử Lý Rời Phòng Tại Phòng Chờ (Waiting Room):**
  - **Broadcast Sự Kiện `ROOM_UPDATE` Mở Rộng:** Server gửi kèm thông tin người vừa rời (`leftPlayer = { id, name, avatar }`) và ID chủ phòng mới (`newHostId`).
  - **Toast Thông Báo Sinh Thái & Âm Thanh Pop:** Hiển thị Toast màu hổ phách `🍂 [Avatar] [Tên] đã rời phòng chờ.` kèm âm thanh chuông pop nhẹ nhàng qua Web Audio API.
  - **Tự Động Chuyển Giao Quyền Chủ Phòng:** Khi Host rời đi, người kế tiếp tự động trở thành Chủ phòng mới, nhận Toast chúc mừng mạ vàng `👑 Bạn đã trở thành Chủ Phòng mới! Hãy bắt đầu khi sẵn sàng.` và mở ngay bộ điều khiển Host.
  - **Tự Động Khóa Nút Bắt Đầu:** Vô hiệu hóa nút "Bắt Đầu" và cập nhật dòng nhắc nhở nếu số thành viên trong phòng giảm xuống dưới 2 người.
- **Xử Lý Rời Ván Đấu & Chống Đóng Băng (In-Game Match & Anti-Freeze Turn Engine):**
  - **Broadcast `PLAYER_LEFT_GAME`:** Bắn sự kiện thời gian thực tới toàn bàn cờ, hiển thị Toast cảnh báo và đẩy 1 tin nhắn hệ thống vào khung Chat trực tuyến (`ChatUI`).
  - **Đánh Dấu Ghế Tabletop 3D:** Ghế ngồi của đối thủ đã thoát tự động áp dụng class `.player-abandoned`, giảm opacity (0.55), chuyển tông màu xám và gắn huy hiệu `<span class="badge-player-left">🍂 Đã Rời Ván</span>`.
  - **Chống Đóng Băng Lượt Đi (Anti-Freeze Turn):** Nếu người chơi rời đi khi đang nắm giữ lượt đi (`currentTurnPlayerId`), `GameEngine` tự động chuyển giao lượt đi cho nghệ nhân kế tiếp còn active mà không làm gián đoạn ván cờ.
  - **Bỏ Qua Lượt (Turn-Skipping):** Chu trình xoay vòng lượt chơi tự động bỏ qua toàn bộ người chơi đã rời ván.
  - **Chặn Hành Động:** Chặn mọi hành động (lấy token, mua thẻ, đặt chỗ) từ những người chơi đã rời bàn cờ.
- **Luật Chiến Thắng Mặc Định (Walkover Victory):**
  - Khi tất cả đối thủ đều đã rời đi và chỉ còn duy nhất 1 người chơi ở lại, ván đấu lập tức chuyển sang trạng thái `FINISHED`.
  - Người chơi duy nhất còn lại lập tức được tôn vinh là Quán Quân với banner: `🏆 TẤT CẢ ĐỐI THỦ ĐÃ RỜI BÀN - BẠN LÀ QUÁN QUÂN DUY NHẤT!`, mở Pop-up vinh danh và đếm ngược 20s quay về sảnh.
  - Người đã rời ván bị loại khỏi danh sách xét giải Quán quân kể cả khi trước đó sở hữu điểm số cao.
- **Bộ Kiểm Thử Tự Động Toàn Diện (AAA Testing Suites):**
  - `server/src/test/java/com/gardenempire/game/GameEnginePlayerLeaveTest.java`: 5 test cases JUnit 5 kiểm tra logic chuyển lượt, walkover 2 người, skip lượt, và chặn hành động.
  - `tests/test_player_leave_notification_ui.js`: 22 test cases Node.js kiểm tra hiển thị ghế mờ, badge đã rời ván, Toast phòng chờ, Toast phong host, System chat, và Walkover modal.
  - `tests/test_multi_tab_player_leave_e2e.js`: 8 test cases kiểm tra kịch bản đồng bộ 3 Tab WebSocket.

---

## 🚀 [v1.4.0] - 2026-11-11
### 🌿 Nâng Cấp Trọn Bộ 90 Ảnh Cây Chụp Thực Tế & Chuẩn Hóa Sinh Thái Học (100% Real Botanical Plant Photos & Nomenclature)
- **Độ Phủ Tuyệt Đối 100% Ảnh Chụp Thực Tế (90/90 Thẻ Bài - 0% Ảnh AI):**
  - **Ứng dụng Skill `agent-reach` truy xuất kho dữ liệu mở:** Tải về và biên tập toàn bộ 90 ảnh chụp thực tế sinh thái ngoài tự nhiên từ Wikimedia Commons / Wikipedia cho trọn vẹn 3 cấp thẻ bài:
    * **Tier 1 (40 thẻ mầm non & rau củ):** Cỏ Ba Lá, Cây Trầu Không, Mầm Hướng Dương, Cây Đậu Phộng, Rau Xà Lách, Nấm Rơm, Cà Chua Bi, Cây Kim Tiền, Cây Nha Đam...
    * **Tier 2 (30 thẻ cây hoa & cây ăn trái):** Hoa Hồng Nhung, Hoa Mai Vàng, Hoa Đào, Hoa Phượng Vĩ, Cây Cam Sành, Cây Bưởi Da Xanh, Cây Xoài Cát, Cây Trầm Hương...
    * **Tier 3 (20 thẻ danh mộc & đại thụ cổ kính):** Cây Baobab, Cây Đa Cổ Thụ, Cây Thông Longaeva, Cây Cự Sam Sequoia, Cây Bạch Quả, Cây Bụt Mọc, Sen Vua, Cây Sưa Đỏ...
  - **Tối ưu hóa tài nguyên siêu nhẹ (Ultra-Fast Asset Loading):** Cắt cúp tỉ lệ vuông 1:1 (256x256), nén kép định dạng `.webp` chất lượng 85 (dung lượng chỉ ~15-25KB mỗi ảnh) kèm file fallback `.png`, bảo đảm ván đấu đa người chơi tải mượt mà dưới 100ms.
- **Chuẩn Hóa Danh Pháp Thực Vật Học & Tên Gọi Tiếng Việt (`CardCatalog.java`):**
  - **Loại bỏ hoàn toàn danh xưng hư cấu:** Thay thế các tên cũ phi logic (*Thủy Mộc Thần Bí $\rightarrow$ Cây Bụt Mọc, Dương Quang Đại Thụ $\rightarrow$ Cây Bạch Quả, Bách Tùng Ngàn Năm $\rightarrow$ Cây Thông Longaeva, Mộc Miên Linh Ứng $\rightarrow$ Cây Hoa Gạo, Linh Chi Cổ Thụ $\rightarrow$ Nấm Linh Chi, Hoa Tulip Nước $\rightarrow$ Hoa Tulip*).
  - **Đồng bộ tiền tố thực vật học (Cây / Hoa / Rau):** Gia tăng tính thẩm mỹ, nhất quán và giá trị giáo dục sinh thái Á Đông xuyên suốt toàn bộ ván đấu.
- **Nâng Cấp Giao Diện Thẻ Cây Deep Forest Glassmorphism (`PlantCardUI.js`, `game.css`):**
  - Bổ sung danh mục định danh `TIER_1_CARD_IDS`, `TIER_2_CARD_IDS`, `TIER_3_CARD_IDS` và `REAL_PHOTO_CARD_IDS` (90 thẻ).
  - Tích hợp khung ảnh nhỏ `.card-art-thumb` bo góc mềm mại, nổi khối bóng đổ và hiệu ứng phóng to mượt mà (`transform: scale(1.08)`) khi di chuột vào thẻ.
  - Tích hợp ảnh mẫu đại diện 3 cấp thẻ bài (`tier1_sprout`, `tier2_flower`, `tier3_tree`) cho 3 chồng bài rút giữa bàn đấu với hiệu ứng `background-blend-mode: overlay`.
- **Kiểm Thử Tự Động & Hồi Quy (Testing & Verification):**
  - `tests/test_plant_card_ui.js`: 22 test cases phủ 100% 90 file ảnh trên đĩa, kiểm tra quy tắc CSS, phương thức logic `getTierImage()` / `getCardImage()` và mô phỏng render DOM -> Đạt **22/22 PASS 100%**.
  - Bảo toàn toàn diện 35/35 Maven backend tests, 46/46 Player Box UI tests, 10/10 Chat Toggle tests, 15/15 Endgame Announcement tests.

---

## 🚀 [v1.3.6] - 2026-11-10
### 💬 Tối Ưu Nút Thu Gọn Khung Chat & Loại Bỏ Icon Trùng Lặp (In-Game Chat Toggle & Collapse Streamlining - Issue #25)
- **Sửa Lỗi Nút Thu Gọn Khung Chat (`#btn-toggle-chat-collapse`):**
  - Khắc phục lỗi không phản hồi trong `client/js/ui/ChatUI.js`, bảo đảm việc nhấp vào nút mũi tên thu gọn hoạt động tức thì trên mọi trình duyệt.
  - Đồng bộ hóa 3 điểm chạm: Bấm nút mũi tên `#btn-toggle-chat-collapse`, bấm thanh tiêu đề `#chat-header`, hoặc bấm Mini Ticker Bar / nút `#btn-toggle-chat` trên Top Bar.
- **Loại Bỏ Icon Mũi Tên Trùng Lặp (De-duplicate Collapse Arrow):**
  - Dọn dẹp `client/game.html`: Loại bỏ phần tử `.chat-ticker-expand-icon` bị thừa lặp bên trong thanh mini ticker `#chat-mini-ticker`.
  - Bổ sung chuẩn trợ năng WCAG: Thêm thuộc tính `aria-label="Thu gọn khung trò chuyện"` và `aria-expanded`.
- **Quy Tắc CSS Ẩn/Hiện Chặt Chẽ (`.hidden` & `.is-collapsed`):**
  - Khai báo chuẩn `.hidden { display: none !important; }` trong `client/css/common.css`.
  - Animation trượt và mờ dần khi ẩn `.chat-body` chuyển sang `.chat-mini-ticker` trong `client/css/game.css`.
- **Kiểm Thử Tự Động (`tests/test_chat_toggle_ui.js`):** 10 test cases chuẩn AAA phủ quy tắc CSS, loại bỏ nút trùng lặp và mô phỏng click đóng/mở -> **10/10 PASS 100%**.

---

## 🚀 [v1.3.5] - 2026-11-06
### ⚡ Tối Ưu Tốc Độ Khởi Động Server In-Memory, Caching Sảnh Chờ & Keep-Alive 24/7 (Fast Boot & Keep-Alive Server)
- **Tăng Tốc Khởi Động Spring Boot Gấp 3 Lần (Fast In-Memory Startup):**
  - Loại trừ `DataSourceAutoConfiguration`, `HibernateJpaAutoConfiguration` và `JpaRepositoriesAutoConfiguration` trong `application.properties` vì game vận hành 100% In-Memory (`ConcurrentHashMap`).
  - Cắt giảm thời gian boot của Spring Boot từ **~18.5s xuống ~6.2s** và tiết kiệm ~80MB RAM container Render.
- **Endpoint Siêu Nhẹ & Cơ Chế Keep-Alive Chống Ngủ Đông 24/7:**
  - Thêm endpoint `GET /api/rooms/ping` (`RoomController.java`) trả về `{"status": "UP"}` với độ trễ `< 2ms`.
  - Tích hợp Cron-job định kỳ mỗi 10-14 phút giữ máy chủ Render luôn ấm 24/7.
- **Tải Trước Danh Sách Phòng & Bộ Nhớ Đệm Sảnh Chờ Tức Thời:**
  - Pre-fetch danh sách phòng từ `index.html` vào `sessionStorage` (`garden_empire_cached_rooms`).
  - Hiển thị danh sách phòng tại `lobby.html` trong `0ms` (Stale-While-Revalidate).
  - Thông báo trạng thái `🌱 Đang đánh thức máy chủ (~20s)...` khi máy chủ đang khởi động lại.

---

## 🚀 [v1.3.4] - 2026-11-04
### ✨ Pop-up Thông Báo Kết Thúc Ván Đấu & Đếm Ngược Đóng Phòng Tự Động (Endgame Announcement & Countdown Timer - Issue #18)
- **Pop-up Vinh Danh & Thông Báo Kết Thúc Game (Victory Announcement Modal):**
  - Broadcast sự kiện kết thúc ván đồng bộ tới mọi người chơi khi `isGameOver = true`.
  - Thông điệp cá nhân hóa: Chúc mừng Quán quân với danh hiệu Tân Vương Đế Chế 👑 hoặc hiển thị thứ hạng Á quân / Hạng #{rank}.
  - Bảng xếp hạng Podium 4 vị trí kèm luật Tiebreaker (bằng điểm thì người sở hữu ít thẻ cây hơn thắng).
- **Đồng Hồ Đếm Ngược Đóng Phòng & Thoát Sảnh Tự Động:**
  - Thanh đếm ngược 20 giây chuyển màu trực quan: `⏱️ Tự động đóng phòng và về sảnh sau: {countdown}s`.
  - Nút `🔍 Xem Lại Bàn Cờ` thu nhỏ modal thành thanh thông báo nổi **Endgame Floating Bar** (`#endgame-floating-bar`) ở đáy màn hình.
  - Tự động gọi API đóng phòng `POST /api/rooms/{roomId}/close` (`RoomController.java`, `RoomService.java`), broadcast `ROOM_CLOSED` và điều hướng về sảnh.
- **Kiểm Thử Tự Động:** `tests/test_endgame_announcement_ui.js` đạt 15/15 test cases PASS 100%, đối soát chụp màn hình OCR WinRT 100% khớp dữ liệu.

---

## 🚀 [v1.3.3] - 2026-11-01
### ✨ Tái Thiết Kế Hộp Thông Tin Người Chơi & Hiển Thị Chi Tiết Token Cầm Tay (Players' Box & Opponents' Tokens Visibility)
- **Bóc Tách 6 Loại Token Cầm Tay Của Đối Thủ (`.mini-token-chip`):**
  - Hiển thị chi tiết từng loại token đối thủ đang giữ: Đất 🟫, Nước 💧, Ánh Sáng ☀️, Hạt Giống 🌰, Dinh Dưỡng 🧪, Phân Bón Vàng ⭐.
  - Token $> 0$ hiển thị màu ngọc nổi khối 3D; token $= 0$ làm mờ (`opacity: 0.28`). Cảnh báo đỏ khi vượt quá 10 token.
- **Khắc Phục Lỗi Rớt Dòng Chữ/Số & Đè Khung:**
  - Cố định `white-space: nowrap; flex-shrink: 0;` cho tất cả các hàng thông số.
  - Mở rộng chiều rộng ghế `.seat-left`, `.seat-right`, `.seat-top` lên chuẩn `215px`.
- **Chuẩn Hóa Khung Players' Box Theo Wireframe 5 Phân Khu:**
  - 1. Header (Tên & Vương miện Host & Điểm uy tín ★).
  - 2. Cây trồng & Bonus vĩnh viễn (5 ô).
  - 3. Tài nguyên ngân hàng cầm tay (6 chip token).
  - 4. Thẻ bài giữ sẵn (1-3 thẻ).
  - 5. Khách thăm vườn đã đón.
- **Kiểm Thử:** `tests/test_player_box_ui.js` đạt 46/46 test cases PASS 100%, chụp màn hình OCR đối soát pixel 100% chính xác.

---

## 🚀 [v1.3.2] - 2026-10-23
### ✨ Nâng Cấp Giao Diện Bàn Đấu & Tính Năng Phóng To (Fullscreen & UI Enhancements)
- **Nút Phóng To Toàn Màn Hình (`TabletopFit.js`):**
  - Bổ sung nút `⛶ Phóng to` phong cách sapphire glassmorphism ở góc trên bên trái bàn cờ.
  - Chuẩn Fullscreen API đa nền tảng, mở rộng trần co giãn `maxScale` từ `1.0x` lên `1.55x` vừa khít màn hình.
- **Tinh Chỉnh Hiển Thị Thẻ Khách Thăm Vườn:**
  - Loại bỏ khung đen chắn ngang thẻ, chip tài nguyên nổi sắc nét ở góc dưới bên trái ảnh linh vật.
- **Tối Ưu & Chống Cắt Chữ Widget Game Logs:**
  - Mở rộng trần chiều cao `.game-log-feed` từ `220px` lên `320px`, tăng chiều rộng lên `305px`, loại bỏ tình trạng cắt mép dưới dòng log thứ 3.
- **Tối Ưu Bố Cục Thẻ Cây Chợ Cây:**
  - Tăng chiều cao thẻ bài từ `92px` lên `104px`, căn giữa tên cây linh hoạt, giữ dải chi phí trên 1 hàng ngang duy nhất (`flex-wrap: nowrap`).
- **Sửa Lỗi Kết Nối Local Development:**
  - Khắc phục routing `serve.json` cho clean URLs và cấu hình `config.js` kết nối `localhost:8080`.

---

## 🚀 [v1.3.1] - 2026-10-16
### ✨ Nâng Cấp Giao Diện & Nhật Ký Ván Đấu (Action Logs & UI)
- **Widget Nhật Ký Bàn Đấu 3 Dòng Gần Nhất:**
  - Thu gọn Action Logs chỉ hiển thị 3 hành động gần nhất trên bàn cờ, đánh số thứ tự toàn cục 1-based (`#1, #2...`).
- **Hộp Thoại Xem Toàn Bộ Lịch Sử Ván Đấu (Full Game Logs Modal):**
  - Modal khung gỗ thiên nhiên xem toàn bộ nhật ký từ đầu ván, nút cuộn nhanh xuống đáy `⬇ Mới nhất`.
- **Chuẩn Hóa Câu Từ Thông Báo & Highlight Điểm Số:**
  - Làm mượt câu từ (Lấy token, Trồng cây, Giữ thẻ, Đón khách, Vòng cuối, Chiến thắng), highlight vàng kim `+\d+★`.
- **Chống Spam Tạo Phòng & Trùng Lặp (Concurrency Safety):**
  - Khóa Mutex frontend `isCreatingRoom`, cooldown backend 2.5s (`ROOM_CREATION_COOLDOWN_MS = 2500`), đồng bộ `hostId.intern()` trong `RoomService.java`.
  - Tự động dọn phòng chờ cũ mồ côi bằng `cleanupService.deleteRoomCompletely()`.
- **Kiểm Thử:** `tests/test_game_log_toggle_3_recent.js` (100% PASS) và `RoomServiceTest.java` (32/32 tests PASS).

---

## 🚀 [v1.3.0] - 2026-10-14
### ✨ Nâng Cấp Giao Diện & Trải Nghiệm (UI/UX)
- **Đại Tu Toàn Diện Hộp Thoại Luật Chơi (5 Tabs Codex):**
  - Chuyển đổi thành Bách Khoa Toàn Thư 5 Tabs: Mục tiêu & Tổng quan, 3 Hành động lượt đi, Khách & Giảm giá vĩnh viễn, Thiết lập & Thắng bại (Luật Tiebreaker ít thẻ hơn thắng), Cẩm nang chiến thuật.
- **Tương Thích Java 21 / 25 & Lombok 1.18.38:**
  - Chuyển sang Explicit Constructor Injection thay cho `@RequiredArgsConstructor` tương thích Eclipse JDT / ECJ và Maven Compiler.

---

## 🚀 [v1.2.0] - 2026-10-14
### ✨ Khung Trò Chuyện Trực Tuyến & Bảo Mật XSS (In-Game Chat Box)
- **Khung Chat In-Game Góc Dưới Bên Trái:**
  - WebSocket Native `CHAT_MESSAGE_RECEIVED`, phím tắt `Enter` mở nhanh ô chat, nút thu gọn mini ticker bar.
  - Huy hiệu tin chưa đọc (Unread badge), âm thanh pop nhẹ nhàng `SoundFX.playChatSound()`.
- **Bảo Mật & Khử Độc XSS:**
  - Tự động mã hóa thẻ HTML nguy hiểm, chống spam cooldown 600ms, giới hạn 120 ký tự/tin, lưu 50 tin gần nhất trong RAM.
- **Cân Chỉnh Bố Cục Động (`TabletopFit.js`):**
  - Tự động tính biến CSS `--panel-bottom-offset` theo zoom trình duyệt (50% - 100%), không che khuất bảng điều khiển người chơi.
- **Kiểm Thử:** 5 Unit Tests trong `GameEngineTest.java` và kịch bản `tests/test_in_game_chat_e2e.js`.

---

## 📜 [v1.1.0] - 2026-10-09
### ✨ Nhật Ký Hành Động Thời Gian Thực (Game Action Logs)
- Ghi nhận chi tiết từng nước đi của người chơi (bốc token, giữ thẻ, trồng cây, đón khách, chung kết 15★).
- Widget Top-Right thu gọn 1 dòng Mini Ticker, badge tài nguyên sinh động, tự động cuộn theo log mới nhất.
- Kiểm thử trong `GameEngineTest.java` và `tests/test_game_action_logs_e2e.js`.

---

## 🌳 [v1.0.4] - 2026-10-08
### ✨ Bàn Cờ 3D Tabletop Arena & Phân Bón Vàng WILD Token
- Tái cấu trúc bàn đấu 3D: Thảm đấu trung tâm, khay 3 tier thẻ bài, khay khách thăm vườn, hiệu ứng phát sáng `aura pulse`.
- Tích hợp tài nguyên Phân Bón Vàng WILD Token, đổi tên gọi tài nguyên từ "Earth" sang "Dirt" (Đất).
- Bộ co giãn bàn cờ `TabletopFit.js` và cấu hình Clean URLs trên Vercel.

---

## 🎨 [v1.0.3] - 2026-10-07
### ✨ Cải Tiến Giao Diện & Hình Ảnh (UI & Assets)
- Bộ icon tài nguyên trực quan: Đất 🟫, Nước 💧, Ánh Sáng ☀️, Hạt Giống 🌰, Dinh Dưỡng 🧪, Phân Bón ⭐.
- Khởi tạo tài liệu cẩm nang cách chơi `how_to_play.md`.

---

## 🛡️ [v1.0.2] - 2026-10-07
### 🛡️ Bảo Mật & Quản Lý Phiên (SessionGuard)
- Ngắt kết nối phiên cũ và cảnh báo xung đột tài khoản khi phát hiện đăng nhập trùng lặp từ tab khác.
- Làm ấm máy chủ (pre-warming), cache SWR và Skeleton loading cho danh sách phòng sảnh chờ.

---

## 👥 [v1.0.1] - 2026-10-06
### ✨ Phòng Chờ Đa Người Chơi & Quản Trị Chủ Phòng
- Màn hình phòng chờ hiển thị danh sách người chơi, avatar và trạng thái sẵn sàng.
- Tính năng kick người chơi kèm lệnh cấm vào lại 2 phút (2-minute cooldown ban), kiểm soát 2-4 người chơi.
- Meta tags Open Graph `graden_empire.png` chuẩn Facebook / Zalo và Giấy phép MIT License.

---

## 🌿 [v1.0.0] - 2026-10-04
### 🚀 Bản Phát Hành Khởi Đầu (Initial Production Release)
- Chuyển thể luật chơi Splendor sang chủ đề kiến tạo vườn thực vật hoàng gia với 6 loại tài nguyên.
- Guồng máy tích lũy (Engine Building): 3 cấp độ thẻ cây (Tier 1 🌱, Tier 2 🌿, Tier 3 🌳) và 10 Thẻ Khách Quý (+3★).
- Tích hợp CSDL Clever Cloud PostgreSQL qua Spring Data JPA và Hibernate ORM.
- Triển khai Backend Java 21 Spring Boot trên Render Cloud và Frontend trên Vercel CDN.

---

## 🏗️ [v0.0.0] - 2026-09-27 đến 2026-10-02
### 🧪 Giai Đoạn Nguyên Mẫu & Xây Dựng Nền Tảng Cốt Lõi (Prototype & Foundation)
- **Khởi tạo kho mã nguồn & Kiến trúc ban đầu (2026-09-27 & 2026-09-28):** Docker Compose, HTML/CSS/JS frontend, Spring Boot domain models, WebSocket handlers.
- **Game Engine & Quy tắc cốt lõi (2026-09-29):** 3 hành động chính (Lấy token, Trồng cây, Đặt chỗ) và 2 hành động phụ (Trả token dư quá 10, Tự động rước khách).
- **Thiết kế giao diện bàn cờ (2026-09-29 & 2026-09-30):** Bảng màu Botanical Theme, banner lượt đi, khay tài nguyên, bảng chọn token dạng hộp ngang.
- **Đồng bộ thời gian thực & Âm thanh Web Audio (2026-09-30 & 2026-10-01):** API tạo phòng mã 6 ký tự, WebSocket Native, Room Concurrency Lock, âm thanh tổng hợp nhặt token/mua cây/chiến thắng.
- **Tự động thu dọn phòng & Đóng gói Docker (2026-10-01 & 2026-10-02):** `RoomCleanupService` dọn phòng rác, Dockerfile đa tầng tối ưu JVM, Nginx reverse proxy.

