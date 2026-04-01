# 01. Các Câu lệnh Hữu ích

Tài liệu này tổng hợp các câu lệnh cần thiết để vận hành và kiểm thử hệ thống.

## 1. Vận hành Backend (NestJS)

- **Cài đặt thư viện:**
  `npm install`

- **Chạy chế độ Phát triển (Watch mode):**
  `npm run start:dev`

- **Kiểm tra lỗi Syntax/Type (TypeScript):**
  `npx tsc --noEmit`

## 2. Kiểm thử Hệ thống (Testing)

- **Giả lập dữ liệu ChirpStack (Uplink):**
  `npx ts-node scripts/mock-uplink.ts`
  *(Dùng để kích hoạt logic báo cháy và đẩy dữ liệu vào database mà không cần sensor thật)*

- **Kiểm tra log MQTT thực tế:**
  *(Yêu cầu cài đặt Mosquitto)*
  `mosquitto_sub -h 127.0.0.1 -p 1883 -t "#" -v`

## 3. Quản lý Docker (ChirpStack)

- **Di chuyển vào thư mục Docker:**
  `cd chirpstack-docker`

- **Khởi động toàn bộ hệ thống (Broker, Network Server, App Server, DB):**
  `docker-compose up -d`

- **Kiểm tra trạng thái Platform:**
  *   **Kiểm tra Redis (Cache)**: `docker exec -it chirpstack-docker-redis-1 redis-cli get sensor:latest:1122334455667788`
  *   **Kiểm tra InfluxDB**: Mở trình duyệt tại `http://localhost:8086` (User/Pass: admin/adminpassword).

- **Dừng hệ thống:**
  `docker-compose down`

- **Xem log của ChirpStack:**
  `docker-compose logs -f chirpstack`

## 4. Kiểm tra Database (Postgres)

- **Đăng nhập vào DB từ CLI:**
  `psql -h localhost -p 5433 -U chirpstack -d lorawan_db`
  *(Password mặc định là `chirpstack` nếu cấu hình trong .env)*

- **Xem các bảng của ứng dụng:**
  `\dt app_*`
