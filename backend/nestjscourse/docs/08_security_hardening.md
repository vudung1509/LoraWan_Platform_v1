# 08. Chính sách Bảo mật (Security Hardening) - Updated

Tài liệu này tổng hợp các biện pháp bảo mật đã được áp dụng để đưa dự án lên tiêu chuẩn Production.

## 1. Bảo mật MQTT (Mosquitto)
- **Tắt Anonymous**: `allow_anonymous false`.
- **Xác thực**: Sử dụng file `passwd` lưu tại `/mosquitto/config/passwd`.
- **Backend Code**: `MqttService` hiện lấy URL, Username, và Password từ `ConfigService` (biến môi trường), không còn hardcode IP hay cổng.
- **Lệnh tạo User**: 
  ```bash
  docker exec -it chirpstack-docker-mosquitto-1 mosquitto_passwd -b /mosquitto/config/passwd <username> <password>
  ```

## 2. Quản lý Secret & Hardening Container
- **Rotate Secrets**: Toàn bộ mật khẩu mặc định (`chirpstack`, `adminpassword`, `mySuperSecretKey`) đã được thay thế bằng các chuỗi ngẫu nhiên mạnh trong `.env`.
- **Docker Compose**: Các DB mật khẩu được truyền qua biến môi trường.
- **Network Security**: Đã đóng các cổng 5433 (Postgres) và 6379 (Redis) ra bên ngoài host để tránh bị scan từ internet. Chỉ các container nội bộ mới có thể kết nối với nhau.

## 3. Bảo vệ API & Ràng buộc Dữ liệu (100% Coverage)
- **Global Validation**: `ValidationPipe` được cấu hình `whitelist: true` và `forbidNonWhitelisted: true`.
- **DTO Validation**:
    - **Auth/Users**: Kiểm tra định dạng Email, độ dài Password/Username.
    - **Sensor/Alert**: Kiểm tra `limit` (Int), `range` (Regex thời gian), và đặc biệt là `devEui` (phải là 16 ký tự Hex).
    - **Device**: Kiểm tra lệnh (Command) dựa trên `Enum` hợp lệ.
- **Flux Sanitization**: Toàn bộ truy vấn InfluxDB đều được kiểm tra input đầu vào để chặn Flux Injection.

## 4. Cơ sở dữ liệu
- **Sync Disabled**: `synchronize: false` giúp bảo vệ cấu trúc dữ liệu thực tế.

## 5. Chiến lược Môi trường (Development vs Production)
Chúng ta duy trì 2 cấu hình song song để tối ưu hóa việc phát triển:

### Môi trường Development (Mặc định)
- **Tệp tin**: `docker-compose.dev.yml`.
- **Đặc điểm**: Mở cổng 5432 (DB), 6379 (Redis), và MQTT cho phép Anonymous để test nhanh logic.
- **Sử dụng**: Dùng cho lập trình viên code hàng ngày.

### Môi trường Production (Hardened)
- **Tệp tin**: `docker-compose.prod.yml`.
- **Đặc điểm**: Khóa toàn bộ cổng nội bộ, yêu cầu xác thực MQTT nghiêm ngặt, mật khẩu dài và xoay vòng.
- **Sử dụng**: Dùng để triển khai thực tế.
