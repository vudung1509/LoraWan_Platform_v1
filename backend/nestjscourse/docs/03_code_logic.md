# 03. Đặc tả Logic và Lưu trữ Đa tầng

Dự án sử dụng chiến lược **Multi-storage Orchestration** để tối ưu hóa tốc độ làm việc và khả năng quản lý số lượng lớn dữ liệu.

## 1. Các lớp lưu trữ (Storage Layers)

1.  **Lớp Caching (Redis)**:
    - **Nhiệm vụ**: Lưu trạng thái mới nhất của sensor.
    - **Mục tiêu**: Tốc độ phản hồi cực nhanh cho Dashboard (< 5ms).
    - **Endpoint**: `GET /sensors/:devEui/latest`.

2.  **Lớp Time-series (InfluxDB)**:
    - **Nhiệm vụ**: Lưu trữ toàn bộ lịch sử sensor (Big Data).
    - **Mục tiêu**: Truy vấn hàng triệu bản ghi theo mốc thời gian để vẽ biểu đồ history.
    - **Endpoint**: `GET /sensors/:devEui/analytics`.

3.  **Lớp Relational (PostgreSQL)**:
    - **Nhiệm vụ**: Lưu trữ dữ liệu có cấu trúc và quan hệ.
    - **Mục tiêu**: Đảm bảo tính toàn vẹn dữ liệu cho thông tin thiết bị và các cảnh báo (Alerts).
    - **Endpoint**: `GET /sensors/:devEui/history`.

## 2. Luồng xử lý dữ liệu Uplink (ChirpStack -> Multi-storage)

Khi một bản tin Uplink được gửi từ `MqttService` vào `ProcessUplinkUseCase`:
1.  **Giải mã**: `decodeUplinkPayload` chuyển Base64/Object thành các chỉ số sensor.
2.  **Domain Model**: Khởi tạo `SensorReading` và kiểm tra logic báo cháy (`isFireAlarm`).
3.  **Điều phối lưu trữ (Orchestration)**:
    - `cacheRepo.upsert()` -> Đẩy lên **Redis**.
    - `timeSeriesRepo.savePoint()` -> Đẩy lên **InfluxDB**.
    - `sensorRepo.save()` -> Đẩy lên **Postgres**.
4.  **Cảnh báo**: Nếu phát hiện cháy, gọi `TriggerAlertUseCase` để lưu cảnh báo vào Postgres và (tương lai) gửi Notify.

## 3. Logic Báo Cháy (Fire Alarm Algorithm)

Logic nằm hoàn toàn trong tầng Domain (`sensor-reading.model.ts`):
- **Khói (Smoke)**: > 400 ppm.
- **Nhiệt độ (Heat)**: > 60°C.
- **CO2**: > 1000 ppm.
Hệ thống sẽ gán nhãn `FIRE`, `SMOKE`, hoặc `HEAT` tùy theo các ngưỡng bị vượt qua.

## 4. Bảo mật cơ bản
- **JWT**: Mọi truy cập vào dữ liệu sensor đều yêu cầu Token hợp lệ.
- **Hashing**: Mật khẩu người dùng được băm bằng Bcrypt.
