@echo off
chcp 65001 >nul
title Garden Empire - Dừng Local Servers

echo ===============================================================================
echo                🛑 DỪNG TẤT CẢ SERVER LOCAL GARDEN EMPIRE 🛑
echo ===============================================================================
echo.
echo [*] Đang tìm kiếm và đóng các tiến trình chiếm dụng cổng 8080 và 3000...

:: Dừng tiến trình chạy cổng 8080 (Backend Spring Boot)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING 2^>nul') do (
    echo     - Đang tắt tiến trình Backend PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

:: Dừng tiến trình chạy cổng 3000 (Frontend Python / Node)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING 2^>nul') do (
    echo     - Đang tắt tiến trình Frontend PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [✓] Đã giải phóng hoàn tất cổng 8080 và 3000!
echo Hệ thống đã trở về trạng thái sạch.
echo.
pause

