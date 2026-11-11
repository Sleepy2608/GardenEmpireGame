---
name: commit-agent
description: Quy chuẩn tạo và đề xuất lệnh Git commit (Conventional Commits) dành riêng cho dự án GardenEmpireGame. Định nghĩa các scopes chuẩn, quy tắc nâng phiên bản (Semantic Versioning x.x.x+1 và x.x+1.0), nguyên tắc chỉ đề xuất lệnh (không tự ý commit ngầm), atomic commits, và quy trình đối soát trước khi commit.
---

# COMMIT_AGENTS.md — Quy Chuẩn Commit Git (Commit Agent Protocol)

Tài liệu này định nghĩa toàn bộ quy chuẩn bắt buộc khi Agent tạo hoặc đề xuất các lệnh `git add` và `git commit` trong dự án **GardenEmpireGame**.
> **Mục tiêu cốt lõi:** Lịch sử Git sạch sẽ, mang tính kỹ thuật vĩnh viễn, chia tách atomic rõ ràng và tuyệt đối không có hành động tự ý commit ngầm ngoài tầm kiểm soát của lập trình viên.

---

## 1. Nguyên Tắc Cốt Lõi (Core Principles)

### 🔒 1.1. CHỈ GỬI LỆNH: TUYỆT ĐỐI KHÔNG TỰ Ý COMMIT / PUSH NGẦM
- **Quy tắc bắt buộc:** Mặc định sau khi hoàn thành công việc, Agent **chỉ được viết ra khối lệnh `git add` và `git commit` trong nội dung chat** để người dùng tự kiểm tra và quyết định thực thi.
- **Cấm:** Tuyệt đối **KHÔNG** tự ý chạy lệnh `git commit` hoặc `git push` trong terminal ngầm.
- **Ngoại lệ duy nhất:** Agent CHỈ ĐƯỢC PHÉP chạy lệnh commit/push khi và chỉ khi **người dùng có yêu cầu rõ ràng**, ví dụ:
  - *"Hãy commit giúp tôi"* / *"Commit hộ tôi"*
  - *"Hãy push lên hộ tôi"* / *"Push code giúp tôi"*
  - Các câu mang ngữ nghĩa tương đương yêu cầu Agent thực thi trực tiếp.

---

### 🚫 1.2. TUYỆT ĐỐI KHÔNG chứa số Phase / Phrase / Sprint trong commit
- **BỊ CẤM:** Không ghi `phase 1`, `phase 4`, `phrase 13`, `giai đoạn 2`, `sprint 3`... trong commit message.
- **Lý do:** Commit message phải mô tả **bản chất kỹ thuật** của thay đổi (tính năng gì, sửa gì, refactor gì). Số thứ tự phase chỉ là kế hoạch quản lý tạm thời, trong khi Git log là lịch sử vĩnh viễn của codebase.
- **Ví dụ:**
  - ❌ `feat(chat): implement in-game chat for phase 13`
  - ✅ `feat(chat): implement in-game chat box with enter shortcut and unread badge (#13)`

---

### 🧩 1.3. Chia commit theo nhóm file liên quan (Atomic Commits)
- **Không commit hỗn tạp:** Không dùng `git add .` bừa bãi hoặc gom những file không liên quan vào một commit khổng lồ.
- **Nhóm file cùng nhiệm vụ logic:**
  - **Backend Server:** Đi chung các file `server/src/main/java/...` và các test unit JUnit `server/src/test/...`.
  - **Client UI & Logic:** Gom các file HTML, CSS và JavaScript đi kèm tính năng giao diện tương ứng (`client/`).
  - **Test Suites:** Gom các bài test kiểm thử tự động tương ứng (`tests/test_*.js`).
  - **Tài liệu:** Gom các file Markdown tài liệu (`.doc/`, `README.md`, `.agents/`).
- **Được phép gộp chung khi phụ thuộc chặt chẽ:** Khi một tính năng client đi kèm trực tiếp với bài test kiểm thử của nó (ví dụ: sửa nút chat kèm file test UI), có thể gộp chung thành một commit hoàn chỉnh.

---

### 📝 1.4. Tuân thủ chuẩn Conventional Commits
Định dạng bắt buộc:
```text
<type>(<scope>): <mô tả ngắn gọn, súc tích bằng tiếng Anh hoặc tiếng Việt chuẩn kỹ thuật>
```
Hoặc dạng ngắn gọn khi thay đổi mang tính toàn cục:
```text
<type>: <mô tả ngắn gọn, súc tích>
```

#### Các `type` được phép:
* **`feat`**: Tính năng mới (endpoints, game engine logic, UI components, modals...).
* **`fix`**: Sửa lỗi bug (logic tính điểm, lỗi giao diện, lệch WebSocket event, tràn layout...).
* **`refactor`**: Tái cấu trúc code (dọn dẹp logic, tách hàm, đổi tên biến mà không thay đổi hành vi nghiệp vụ).
* **`docs`**: Cập nhật tài liệu (README.md, how_to_play.md, changelogs.md, luật game Splendor...).
* **`test`**: Thêm mới hoặc chỉnh sửa file test (JUnit 5 backend, Node.js test scripts).
* **`style`**: Format code, CSS/styling thuần túy không ảnh hưởng logic.
* **`chore`**: Cấu hình build tool, Maven `pom.xml`, `.gitignore`, Docker, Vercel, bump version...
* **`perf`**: Cải thiện hiệu năng xử lý (tối ưu hóa payload WebSocket, giảm overhead khởi động Spring Boot...).

---

## 2. Quy Chuẩn Nâng Cấp Phiên Bản (Semantic Versioning & Release Bumping Rules)

Mọi commit hoặc tác vụ liên quan đến việc nâng cấp / chỉnh sửa số phiên bản của dự án **GardenEmpireGame** đều phải tuân thủ nghiêm ngặt các nguyên tắc sau:

### 🔍 2.1. Bắt buộc kiểm tra lại các commit cũ (`git log`)
- Trước khi nâng số phiên bản, Agent bắt buộc phải chạy `git log` hoặc khảo sát các commit kỹ thuật kể từ lần bump version gần nhất:
  ```bash
  git log --oneline -n 20
  ```
- **Mục đích:** Rà soát đầy đủ mọi thay đổi mã nguồn đã xảy ra để xác định chính xác cấp độ thay đổi (sửa lỗi hay tính năng lớn) và tổng hợp nội dung chi tiết cho tài liệu Changelog.

### 🔢 2.2. Quy tắc tăng số phiên bản (Semantic Versioning: MAJOR.MINOR.PATCH)
Tuân thủ chuẩn Semantic Versioning (`vX.Y.Z`):

| Cấp độ thay đổi | Quy tắc tăng số phiên bản | Ví dụ minh họa | Trường hợp áp dụng cụ thể |
| :--- | :---: | :---: | :--- |
| **Fix lỗi / Đổi giao diện / Tối ưu nhỏ** | **Tăng PATCH**<br/>`x.x.x+1` | `v1.3.5` $\rightarrow$ `v1.3.6` | - Sửa bug (logic game, sự kiện WebSocket, lệch thẻ).<br/>- Đổi giao diện, CSS/HTML nhỏ (sửa nút toggle chat, loại bỏ icon thừa, căn chỉnh font chữ).<br/>- Tối ưu hóa nhỏ, sửa lỗi chính tả. |
| **Thêm feature / Thay đổi lớn** | **Tăng MINOR**<br/>`x.x+1.0` | `v1.3.6` $\rightarrow$ `v1.4.0` | - Bổ sung tính năng mới hoàn chỉnh (in-game chat, fullscreen toggle, endgame podium modal).<br/>- Cập nhật bộ tài nguyên diện rộng (nạp 90 ảnh chụp thực tế cho cả 3 Tier, chuẩn hóa danh pháp sinh thái học).<br/>- Thay đổi lớn về kiến trúc hoặc mở rộng luồng nghiệp vụ. |
| **Phá vỡ tương thích (Breaking Changes)** | **Tăng MAJOR**<br/>`x+1.0.0` | `v1.4.0` $\rightarrow$ `v2.0.0` | - Thay đổi hoàn toàn luật chơi Splendor hoặc giao thức WebSocket không tương thích ngược.<br/>- Tái thiết kế toàn diện kiến trúc công nghệ (Rewrite). |

### 📂 2.3. Danh sách 6 file bắt buộc phải đồng bộ phiên bản
Khi thực hiện nâng phiên bản (Version Bump), Agent bắt buộc phải cập nhật đồng bộ số phiên bản tại **tất cả 6 vị trí sau**:
1. **[.doc/changelogs.md](file:///c:/University%20Coding%20Project/GardenEmpireGame/.doc/changelogs.md):** Thêm block phiên bản mới ở đầu mục `## 🚀 [vX.Y.Z] — YYYY-MM-DD` theo chuẩn *Keep a Changelog*, tổng kết rõ ràng các thay đổi từ `git log`.
2. **[README.md](file:///c:/University%20Coding%20Project/GardenEmpireGame/README.md):** Cập nhật badge `[![Version](https://img.shields.io/badge/Version-vX.Y.Z-10B981?...)]`.
3. **[server/pom.xml](file:///c:/University%20Coding%20Project/GardenEmpireGame/server/pom.xml):** Cập nhật thẻ `<version>X.Y.Z-SNAPSHOT</version>`.
4. **[client/index.html](file:///c:/University%20Coding%20Project/GardenEmpireGame/client/index.html):** Cập nhật `.app-version-badge` và `title="Garden Empire vX.Y.Z"`.
5. **[client/lobby.html](file:///c:/University%20Coding%20Project/GardenEmpireGame/client/lobby.html):** Cập nhật `.app-version-badge` và `title="Garden Empire vX.Y.Z"`.
6. **[client/waiting-room.html](file:///c:/University%20Coding%20Project/GardenEmpireGame/client/waiting-room.html):** Cập nhật `.app-version-badge` và `title="Garden Empire vX.Y.Z"`.

### 📦 2.4. Quy chuẩn commit cho Version Bump
- Sử dụng commit type `chore(release)`:
  ```bash
  git add .doc/changelogs.md README.md client/index.html client/lobby.html client/waiting-room.html server/pom.xml
  git commit -m "chore(release): bump project version to vX.Y.Z and <tóm tắt ngắn nội dung>"
  ```
- Tách riêng thành commit độc lập sau khi các commit tính năng hoặc fix lỗi liên quan đã hoàn tất và vượt qua 100% bài kiểm thử.

---

## 3. Bảng Scope Chuẩn Dành Riêng Cho Dự Án GardenEmpireGame

Mọi commit message nên gắn scope chính xác theo danh mục phân hệ dưới đây:

| Scope | Phân hệ / Trách nhiệm trong GardenEmpireGame | Ví dụ vị trí mã nguồn |
| :--- | :--- | :--- |
| **`engine`** | Lõi GameEngine, tính điểm Uy Tín (15★), luật Splendor, tiebreaker | `server/.../engine/GameEngine.java` |
| **`room`** | Quản lý phòng, vòng đời trận đấu, Sảnh Chờ (Lobby), RoomService | `server/.../service/RoomService.java` |
| **`websocket`** | Giao thức đồng bộ thời gian thực, STOMP endpoint, handler | `server/.../websocket/GameWebSocketHandler.java` |
| **`client`** | Khung tương tác và điều phối chung phía Frontend | `client/js/ui/BoardUI.js`, `client/js/main.js` |
| **`ui`** | Giao diện chung, CSS Glassmorphism, Deep Forest layout, Tabletop 3D | `client/css/common.css`, `client/css/game.css` |
| **`chat`** | Khung chat trực tuyến, ChatUI, rate-limit, sanitize XSS, thu gọn/mở rộng | `client/js/ui/ChatUI.js`, `#chat-widget` |
| **`log`** | Nhật ký hành động ván đấu, 3 recent action logs, modal lịch sử | `client/js/ui/GameLogUI.js`, `#game-log-widget` |
| **`card`** | Chợ cây trồng 3 tier, thẻ giữ chỗ, chi phí thanh toán | `client/js/ui/PlantCardUI.js`, `#plant-market` |
| **`token`** | Ngân hàng 6 loại năng lượng thực vật, chọn/trả token | `client/js/ui/ResourceUI.js`, `#resource-bank` |
| **`visitor`** | Quý tộc khách thăm vườn, điều kiện rước khách danh dự | `client/js/ui/VisitorUI.js`, `#visitors-container` |
| **`endgame`** | Pop-up vinh danh Quán quân, đếm ngược tự động 20s, floating bar | `client/js/ui/VictoryUI.js`, `#victory-modal` |
| **`test`** | Toàn bộ các bài test tự động Backend (JUnit 5) và Frontend (Node.js) | `server/src/test/...`, `tests/*.js` |
| **`docs`** | Toàn bộ tài liệu hướng dẫn chơi, luật board game, changelogs | `.doc/how_to_play.md`, `README.md` |
| **`config`** | Cấu hình dự án, biến môi trường, Docker, Maven dependency | `server/pom.xml`, `docker-compose.yml` |
| **`release`** | Nâng cấp phiên bản, đồng bộ badge, release changelogs | `server/pom.xml`, `.doc/changelogs.md` |

---

## 4. Quy Trình 3 Bước Trước Khi Đưa Lệnh Commit

Mỗi khi Agent hoàn thành một tác vụ, bắt buộc thực hiện đủ 3 bước sau:

1. **Bước 1: Kiểm tra thay đổi thực tế (`git status` & `git diff`)**
   - Xác định danh sách file vừa được thêm/sửa.
   - Đảm bảo không còn file rác, dữ liệu nhạy cảm hoặc console debug tạm thời.
2. **Bước 2: Xác thực kiểm thử (Testing Verification)**
   - Đảm bảo toàn bộ test liên quan đã chạy thật và PASS 100% theo đúng quy chuẩn [.agents/test/test_agents.md](file:///c:/University%20Coding%20Project/GardenEmpireGame/.agents/test/test_agents.md).
3. **Bước 3: Xuất khối lệnh đề xuất rõ ràng**
   - Định dạng lệnh tách biệt trong code block bash để lập trình viên dễ dàng copy và chạy:

```bash
git add <danh_sách_file_liên_quan>
git commit -m "<type>(<scope>): <mô tả ngắn gọn>"
```

---

## 5. Các Ví Dụ Commit Thực Tế Mẫu Trong GardenEmpireGame

- `feat(chat): implement in-game chat box with enter shortcut and unread badge (#13)`
- `fix(client): fix in-game chat toggle collapse button and remove duplicate arrow (#25)`
- `feat(ui): add 40 real photographic plant images for all tier 1 cards via agent-reach`
- `feat(endgame): implement victory announcement popup, podium rankings and auto-exit countdown (#18)`
- `perf(server): skip unused JPA boot overhead and prefetch lobby rooms (#34)`
- `test(ui): add automated unit test suite for player box 5 zones and tokens`
- `refactor(game): standardize taxonomic prefixes and plant card names across catalog`
- `chore(release): bump project version to v1.3.6 and update changelogs for chat toggle fix`
- `chore(release): bump project version to v1.4.0 and document 90 real plant photos update`
