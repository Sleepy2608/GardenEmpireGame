# GardenEmpire Game

GardenEmpire là một trò chơi chiến thuật xây dựng khu vườn lấy cảm hứng từ trò chơi bàn cờ nổi tiếng **Splendor**.

## Cốt truyện & Chủ đề
Người chơi vào vai các nghệ nhân làm vườn cạnh tranh nhau tạo dựng khu vườn đế chế tráng lệ nhất:
- **Tài nguyên (Resources)**: Đất (Earth), Nước (Water), Ánh sáng (Sunlight), Hạt giống (Seeds), Dinh dưỡng (Nutrients) và Phân bón vàng (Wild/Golden Fertilizer).
- **Thẻ Cây (Plant Cards)**: Mua các loại hoa, cây bụi và đại thụ để nhận điểm danh tiếng vĩnh viễn và giảm chi phí mua cây sau này.
- **Thẻ Khách ghé thăm (Visitor Cards)**: Thu hút các vị khách quý tộc, ong bướm, nhà thực vật học ghé thăm khi đạt đủ tiêu chuẩn hoa lá.

## Cấu trúc dự án
- `/client`: Frontend giao diện người dùng (HTML5, Vanilla CSS, Vanilla JS ES6 Modules, WebSocket).
- `/server`: Backend Java (Spring Boot, WebSocket STOMP/Raw WebSocket, REST API).

## Hướng dẫn chạy

### Frontend
Mở thư mục `client/` với một HTTP server tĩnh (như Live Server trong VS Code hoặc `npx serve client`).

### Backend
Yêu cầu Java 17+ và Maven:
```bash
cd server
mvn spring-boot:run
```