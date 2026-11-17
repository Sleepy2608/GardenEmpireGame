# 📜 NHẬT KÝ THAY ĐỔI & LỊCH SỬ PHIÊN BẢN (CHANGELOG)

Tài liệu này ghi nhận tổng hợp các tính năng mới, cải tiến trải nghiệm và sửa đổi quan trọng của **Garden Empire Game** qua từng phiên bản, được trình bày ngắn gọn và dễ hiểu cho người chơi và người dùng cuối.

> 🛠️ **Dành cho Lập trình viên & Kiến trúc sư:** Để xem chi tiết kỹ thuật chuyên sâu (tệp mã nguồn, lớp đối tượng, phương thức, bài test tự động và cơ chế đồng bộ), vui lòng xem tại [`.doc/detailed_changelogs.md`](detailed_changelogs.md).

---

## 🚀 [v1.7.0] - 2026-11-17
### 🤖 Trợ Lý Bot Thông Minh, Tự Động Tiếp Quản & Bảng Cài Đặt Toàn Cục
- **Trợ lý Bot Heuristic thông minh:** Tự động tính toán nước đi tối ưu (mua thẻ cây, đặt chỗ giữ bài, thu thập năng lượng), hỗ trợ người chơi luyện tập và cho phép tổ chức giải đấu 4 Bot tự động siêu tốc.
- **Tự động tiếp quản ván cờ:** Khi người chơi mất kết nối hoặc rời phòng, Bot thông minh tự động tiếp quản ván đấu với huy hiệu `🤖 BOT`, đảm bảo trận đấu diễn ra liền mạch không bị gián đoạn.
- **Nút Cài Đặt ⚙️ toàn cục:** Tích hợp nút bánh răng Cài Đặt trên thanh điều hướng của cả 5 màn hình (Cổng chào đón, Bảng điều khiển, Sảnh chờ, Phòng chờ, Bàn cờ thi đấu) cùng phím tắt `O` và `,`.
- **Bảng tùy chỉnh trải nghiệm 4 phân khu:**
  - *Âm thanh:* 3 thanh trượt điều chỉnh âm lượng riêng biệt cho Âm Lượng Tổng (Master), Nhạc Nền (BGM), Hiệu Ứng (SFX) kèm nút "Thử Âm" nghe thử xúc giác.
  - *Đồ họa:* Bật/tắt đom đóm sinh thái, chế độ giảm chuyển động (Reduced Motion) giúp tiết kiệm pin, và tắt hiệu ứng phóng to thẻ bài khi rê chuột.
  - *Bàn đấu:* Chuông hòa âm E5-A5-C6 báo khi đến lượt đi của mình, chuông báo tin nhắn chat mới, chế độ hỗ trợ khiếm thị màu và gợi ý chiến thuật Bot.
  - *Hệ thống:* Bật/tắt chế độ toàn màn hình và nút khôi phục cài đặt gốc 1 chạm.

---

## 🚀 [v1.6.0] - 2026-11-16
### 🎵 Nhạc Nền Phục Hưng Đa Giai Đoạn, Đếm Giờ Lượt Đấu & Quản Lý Vắng Mặt (AFK)
- **Nhạc nền thời kỳ Phục Hưng:** 5 bản nhạc cổ điển phong cách Phục Hưng độc quyền của nhà soạn nhạc Kevin MacLeod (Willow and the Light, Angevin B, Suonatore di Liuto, Master of the Feast, The Curtain Rises) tương ứng với từng giai đoạn ván cờ.
- **Tự động điều chỉnh âm lượng:** Nhạc nền tự động giảm nhỏ âm lượng khi phát hiệu ứng âm thanh hoặc khi đồng hồ lượt đi đếm ngược dưới 10 giây.
- **Giới hạn thời gian mỗi lượt:** Chủ phòng có thể cấu hình thời gian suy nghĩ mỗi lượt trước khi bắt đầu (1 phút Tiêu chuẩn, 2 phút Chiến thuật, hoặc 5 phút Thư thái).
- **Đồng hồ đếm ngược sinh động:** Thanh thời gian đổi màu 3 cấp độ (Xanh ngọc $\rightarrow$ Vàng hổ phách $\rightarrow$ Đỏ khẩn cấp) kèm âm thanh tích tắc nhịp tim khi sắp hết giờ.
- **Xử lý người chơi vắng mặt (AFK):** Tự động thu thập tài nguyên khi hết giờ lần 1; cảnh báo và truất quyền thi đấu nếu bỏ lỡ 2 lượt liên tiếp để giữ nhịp độ bàn cờ.

---

## 🚀 [v1.5.1] - 2026-11-15
### 🌿 Tinh Chỉnh Cổng Chào Tân Binh & Bảng Điều Khiển Nghệ Nhân
- **Tinh gọn giao diện Cổng chào & Đăng ký:** Thanh menu thanh lịch, tập trung vào tiêu đề chính và bộ 3 thẻ cây trồng mẫu đại diện.
- **Cẩm nang luật chơi 5 Tab không thanh cuộn:** Dàn trang dạng lưới 5 cột hoàn hảo, loại bỏ thanh cuộn ngang gây vướng víu.
- **Tự động hóa kiểm thử CI:** Tích hợp kiểm thử tự động trên GitHub Actions bảo đảm chất lượng toàn diện trước khi phát hành.

---

## 🚀 [v1.5.0] - 2026-11-14
### 🏛️ Cổng Chào Tân Binh, Cốt Truyện Đại Ngàn Flora Valley & Hệ Thống Chuyển Động
- **Cổng chào đón tân binh (Welcome Dashboard):** Trang đích lộng lẫy theo phong cách Deep Forest Glassmorphism & Renaissance Botanical Aesthetics; hiển thị 6 tinh hoa năng lượng, 3 cấp thẻ bài và 10 Vị Khách Hoàng Gia.
- **Cốt truyện Thánh địa Flora Valley:** Bối cảnh sử thi về cuộc tranh tài giữa các Master Gardener giành sự công nhận của Viện Hàn Lâm Thảo Mộc Hoàng Gia.
- **Hiệu ứng chuyển động mượt mà:** Chuyển cảnh mềm mại giữa các trang, hiệu ứng nảy lò xo khi chọn avatar và nhấp nút bấm xúc giác.

---

## 🚀 [v1.4.1] - 2026-11-12
### 🍂 Thông Báo Người Chơi Rời Phòng, Chống Đóng Băng & Chiến Thắng Mặc Định
- **Thông báo người chơi rời phòng:** Hiển thị thông báo Toast màu hổ phách kèm âm thanh nhẹ khi có thành viên rời phòng chờ hoặc bàn đấu.
- **Tự động chuyển giao Chủ phòng:** Khi Host rời đi, người kế tiếp tự động trở thành Chủ phòng mới.
- **Chống đóng băng ván cờ:** Tự động chuyển giao lượt đi cho người kế tiếp khi người đang giữ lượt thoát ra; làm mờ ghế đối thủ đã rời bàn.
- **Chiến thắng mặc định:** Vinh danh người duy nhất kiên trì ở lại khi toàn bộ đối thủ bỏ cuộc.

---

## 🚀 [v1.4.0] - 2026-11-11
### 🌿 Trọn Bộ 90 Ảnh Cây Chụp Thực Tế & Chuẩn Hóa Sinh Thái Học
- **Trọn bộ 90 ảnh cây chụp thực tế ngoài đời:** Toàn bộ 90 thẻ bài sở hữu ảnh chụp thực tế chất lượng cao, tối ưu tải siêu nhanh dưới 100ms.
- **Chuẩn hóa tên gọi thực vật học:** Áp dụng tên gọi thực tế thuần Việt (Cỏ Ba Lá, Hoa Hồng Nhung, Cây Baobab, Cây Bạch Quả...) thay thế các danh xưng hư cấu.
- **Hiệu ứng thẻ bài kính mờ:** Nổi bật khung ảnh nhỏ bo góc mềm mại và phóng to nhẹ khi rê chuột.

---

## 🚀 [v1.3.6] - 2026-11-10
### 💬 Tối Ưu Nút Thu Gọn Khung Trò Chuyện & Tinh Gọn Giao Diện
- **Tối ưu nút thu gọn khung trò chuyện:** Hỗ trợ thu gọn/mở rộng khung chat qua 3 cách tiện lợi (nút mũi tên, nhấp thanh tiêu đề, hoặc nút trên Top Bar).
- **Giao diện tinh gọn:** Loại bỏ các biểu tượng thừa, chuyển đổi mượt mà giữa khung chat và thanh mini ticker.

---

## 🚀 [v1.3.5] - 2026-11-06
### ⚡ Tối Ưu Tốc Độ Khởi Động & Giữ Ấm Máy Chủ 24/7
- **Tăng tốc khởi động:** Máy chủ khởi động nhanh gấp 3 lần, mở sảnh chờ tức thì trong tích tắc.
- **Giữ ấm máy chủ 24/7:** Triệt tiêu hoàn toàn thời gian chờ đợi khi người chơi đầu tiên tạo phòng trong ngày.

---

## 🚀 [v1.3.4] - 2026-11-04
### ✨ Pop-up Vinh Danh Kết Thúc Ván & Đếm Ngược Về Sảnh
- **Pop-up vinh danh kết thúc ván:** Tự động hiển thị bảng xếp hạng Podium 4 vị trí kèm vương miện Quán quân khi có người chạm ngưỡng 15 điểm.
- **Đồng hồ đếm ngược 20s:** Tự động đếm ngược 20 giây đưa người chơi về lại sảnh chờ.
- **Tính năng xem lại bàn cờ:** Cho phép thu nhỏ kết quả thành thanh nổi ở đáy màn hình để quan sát lại toàn bộ khu vườn trước khi rời đi.

---

## 🚀 [v1.3.3] - 2026-11-01
### ✨ Tái Thiết Kế Hộp Thông Tin Người Chơi & Bóc Tách Tài Nguyên Đối Thủ
- **Hiển thị chi tiết tài nguyên đối thủ:** Bóc tách trực quan 6 loại token đối thủ đang cầm trên tay giúp người chơi dễ dàng tính toán chiến thuật.
- **Khắc phục tràn chữ:** Cố định hàng ngang và căn chỉnh linh hoạt trên mọi kích cỡ màn hình.

---

## 🚀 [v1.3.2] - 2026-10-23
### ✨ Nâng Cấp Bàn Đấu Toàn Màn Hình & Tinh Chỉnh Thẻ Bài
- **Nút phóng to toàn màn hình:** Nút `⛶ Phóng to` ở góc trên bên trái bàn cờ, tự động co giãn bàn cờ vừa vặn toàn bộ diện tích màn hình.
- **Tinh chỉnh thẻ Khách Quý & Chợ cây:** Loại bỏ thanh đen chắn ngang ảnh khách, tăng chiều cao thẻ cây giúp dải chi phí thoáng mắt, dễ nhìn.

---

## 🚀 [v1.3.1] - 2026-10-16
### ✨ Nhật Ký Bàn Đấu 3 Dòng Gần Nhất & Hộp Thoại Toàn Bộ Lịch Sử
- **Nhật ký bàn đấu 3 dòng gần nhất:** Thu gọn nhật ký chỉ hiển thị 3 hành động mới nhất để không che khuất bàn cờ.
- **Hộp thoại xem toàn bộ lịch sử:** Bổ sung modal xem lại toàn bộ các nước đi từ đầu ván đấu.
- **Chống nhấp đúp tạo phòng:** Ngăn chặn việc bấm liên tục tạo ra nhiều phòng trùng lặp.

---

## 🚀 [v1.3.0] - 2026-10-14
### ✨ Bách Khoa Toàn Thư Luật Chơi 5 Tab
- **Đại tu cẩm nang luật chơi:** Trình bày 5 Tab trực quan gồm mục tiêu, 3 hành động lượt đi, khách quý & giảm giá, thiết lập bàn cờ (Luật Tiebreaker ít thẻ hơn thắng) và cẩm nang chiến thuật.

---

## 🚀 [v1.2.0] - 2026-10-14
### ✨ Khung Trò Chuyện Trực Tuyến & Bảo Mật Khử Độc
- **Khung trò chuyện trực tuyến:** Trò chuyện thời gian thực tại góc dưới bên trái bàn đấu, hỗ trợ phím tắt `Enter` mở nhanh ô chat và âm thanh pop thông báo.
- **Bảo mật & chống spam:** Tự động lọc mã độc và giới hạn tần suất gửi tin.

---

## 📜 [v1.1.0] - 2026-10-09
### ✨ Nhật Ký Hành Động Thời Gian Thực
- Ghi nhận chi tiết từng nước đi của người chơi (bốc token, giữ thẻ, trồng cây, đón khách, chung kết 15★) với màu sắc tài nguyên sinh động.

---

## 🌳 [v1.0.4] - 2026-10-08
### ✨ Bàn Cờ 3D Tabletop Arena & Phân Bón Vàng WILD Token
- Tái cấu trúc bàn đấu 3D: Thảm đấu trung tâm, khay 3 tầng bài rút, hiệu ứng hào quang phát sáng khi đến lượt.
- Bổ sung tài nguyên Phân Bón Vàng WILD Token và chuẩn hóa tên gọi tài nguyên Đất (Dirt).

---

## 🎨 [v1.0.3] - 2026-10-07
### ✨ Cải Tiến Giao Diện & Hình Ảnh
- Bộ icon tài nguyên trực quan: Đất 🟫, Nước 💧, Ánh Sáng ☀️, Hạt Giống 🌰, Dinh Dưỡng 🧪, Phân Bón ⭐.
- Khởi tạo tài liệu cẩm nang cách chơi căn bản.

---

## 🛡️ [v1.0.2] - 2026-10-07
### 🛡️ Bảo Mật Phiên Đăng Nhập (SessionGuard)
- Chống đăng nhập trùng lặp từ nhiều tab hoặc thiết bị, hiển thị cảnh báo xung đột tài khoản.
- Tối ưu tải sảnh chờ mượt mà với bộ nhớ đệm và hiệu ứng khung xương.

---

## 👥 [v1.0.1] - 2026-10-06
### ✨ Phòng Chờ Đa Người Chơi & Quản Trị Chủ Phòng
- Màn hình phòng chờ hiển thị danh sách người chơi, avatar và trạng thái sẵn sàng.
- Tính năng kick người chơi kèm lệnh cấm vào lại 2 phút và giới hạn 2-4 người chơi.

---

## 🌿 [v1.0.0] - 2026-10-04
### 🚀 Bản Phát Hành Chính Thức Khởi Đầu
- Chuyển thể luật chơi Splendor sang chủ đề kiến tạo khu vườn thực vật hoàng gia với 6 loại tài nguyên năng lượng.
- Guồng máy tích lũy: 3 cấp độ thẻ cây (Tier 1 🌱, Tier 2 🌿, Tier 3 🌳) và 10 Vị Khách Hoàng Gia (+3★).
- Tích hợp cơ sở dữ liệu Clever Cloud PostgreSQL và triển khai đám mây Render / Vercel.

---

## 🏗️ [v0.0.0] - 2026-09-27 đến 2026-10-02
### 🧪 Giai Đoạn Nguyên Mẫu & Xây Dựng Nền Tảng Cốt Lõi
- Xây dựng cỗ máy trò chơi cốt lõi, đồng bộ thời gian thực qua WebSocket Native.
- Dựng giao diện bàn cờ ban đầu, hệ thống âm thanh Web Audio và đóng gói Docker điều phối toàn bộ hệ thống.
