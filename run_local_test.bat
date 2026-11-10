@echo off
chcp 65001 >nul
title Garden Empire - Local Dev & 2-Player Test Environment

echo ===============================================================================
echo                🌱 GARDEN EMPIRE - KHỞI CHẠY TEST LOCAL ĐA TRÌNH DUYỆT 🌱
echo ===============================================================================
echo.

:: 1. Khởi động Backend Spring Boot trên port 8080
echo  [1/4] Khởi động Backend (Spring Boot trên cổng 8080)...
start "Garden Empire - Backend Server (Port 8080)" cmd /k "title Garden Empire - Backend (Port 8080) && cd /d ""%~dp0server"" && echo Dang chay Backend Spring Boot tai http://localhost:8080 ... && mvn spring-boot:run"

:: 2. Khởi động Frontend Static Server trên port 3000
echo  [2/4] Khởi động Frontend (trên cổng 3000)...
where python >nul 2>nul
if %errorlevel% equ 0 (
    start "Garden Empire - Frontend Server (Port 3000)" cmd /k "title Garden Empire - Frontend (Port 3000) && cd /d ""%~dp0client"" && echo Dang chay Frontend bang Python tai http://localhost:3000 ... && python -m http.server 3000"
) else (
    start "Garden Empire - Frontend Server (Port 3000)" cmd /k "title Garden Empire - Frontend (Port 3000) && cd /d ""%~dp0client"" && echo Dang chay Frontend bang npx serve tai http://localhost:3000 ... && npx --yes serve -l 3000"
)

echo.
echo  [3/4] Đang đợi Backend và Frontend sẵn sàng...
set /a attempts=0

:WAIT_SERVERS
timeout /t 2 /nobreak >nul
set /a attempts+=1

:: Kiểm tra Backend (8080) qua curl
curl.exe -s -o nul http://localhost:8080/api/rooms 2>nul
if errorlevel 1 (
    if %attempts% geq 15 (
        echo  [!] Backend khởi động hơi lâu hoặc đang nạp dependencies, tiến hành mở trình duyệt...
        goto OPEN_BROWSERS
    )
    echo      ...Đang chờ Backend khởi chạy (%attempts%/15)...
    goto WAIT_SERVERS
)

echo  [✓] Backend và Frontend đã sẵn sàng hoạt động!
echo.

:OPEN_BROWSERS
echo  [4/4] Đang mở 2 trình duyệt độc lập để mô phỏng 2 người chơi...

:: -------------------------------------------------------------
:: TRÌNH DUYỆT 1: GOOGLE CHROME (Người chơi 1 - Host)
:: -------------------------------------------------------------
echo      - Mở Trình duyệt 1 (Google Chrome - Người chơi 1 / Chủ phòng)...
if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    start "" "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" "http://localhost:3000"
) else if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" "http://localhost:3000"
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" "http://localhost:3000"
) else (
    start chrome "http://localhost:3000" 2>nul || start "http://localhost:3000"
)

:: Nghỉ 1 giây để tránh xung đột focus cửa sổ
timeout /t 1 /nobreak >nul

:: -------------------------------------------------------------
:: TRÌNH DUYỆT 2: MICROSOFT EDGE (Người chơi 2 - Guest)
:: -------------------------------------------------------------
echo      - Mở Trình duyệt 2 (Microsoft Edge - Người chơi 2 / Khách)...
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" "http://localhost:3000"
) else if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" "http://localhost:3000"
) else (
    start msedge "http://localhost:3000" 2>nul || start "http://localhost:3000"
)

echo.
echo ===============================================================================
echo                           ✨ HƯỚNG DẪN TEST 2 NGƯỜI CHƠI ✨
echo ===============================================================================
echo  1. Tab Google Chrome (Player 1):
echo     - Đặt tên ví dụ: "Chủ Vườn" -> Nhấn "TẠO PHÒNG".
echo     - Sao chép Mã Phòng (ví dụ: ABCD).
echo.
echo  2. Tab Microsoft Edge (Player 2):
echo     - Đặt tên ví dụ: "Khách Thăm" -> Nhập Mã Phòng -> Nhấn "VÀO PHÒNG".
echo.
echo  3. Bắt đầu trận đấu:
echo     - Bên Chrome (Chủ phòng) nhấn "BẮT ĐẦU TRẬN ĐẤU".
echo     - Cả 2 trình duyệt sẽ tự động đồng bộ vào bàn cờ thời gian thực!
echo.
echo  * Để dừng các server khi test xong:
echo    - Chạy file: stop_local_test.bat (hoặc đóng 2 cửa sổ terminal đã mở).
echo ===============================================================================
echo.
echo Cửa sổ này có thể đóng lại an toàn (Nhấn phím bất kỳ để thoát)...
pause >nul
