# Hướng dẫn Kiểm tra sau khi Hardening (Phase 1 & 2)

Sau khi bạn chạy xong lệnh `docker exec...` và `docker restart...` cho Mosquitto, hãy thực hiện các bước sau để đảm bảo hệ thống chạy mượt mà:

## 1. Khởi động lại Backend
Vì chúng ta đã thay đổi toàn bộ Secret trong `.env`, bạn cần khởi động lại Backend để nó nhận cấu hình mới:
```bash
# Nếu chạy qua NPM (Local)
npm run start:dev

# Nếu chạy qua Docker
docker-compose -f docker-compose.prod.yml up -d --build backend
```

## 2. Kiểm tra Kết nối (Verification)
- **Log MQTT**: Xem log của backend để chắc chắn nó đã `Connected to MQTT Broker`. Nếu log báo `Connection Refused` hoặc `unauthorized`, hãy kiểm tra lại username/password trong `.env` có khớp với lệnh `mosquitto_passwd` hay không.
- **Health Check**: Truy cập `http://localhost:3000/health` trên trình duyệt. 
    - Kết quả mong đợi: `{"status": "ok", "info": {"database": {"status": "up"}, "redis": {"status": "up"}}}`.

## 3. Kiểm tra Luồng dữ liệu (End-to-End)
- Trigger một gói tin Uplink bất kỳ.
- Kiểm tra log của `UplinkProcessor`: 
    - `Queued uplink for ...` (Log từ UseCase)
    - `Worker processed ... [fCnt=...]` (Log từ Processor)
- Kiểm tra dữ liệu có vào InfluxDB và Postgres không.

## 4. Kiểm tra Chống trùng lặp (Idempotency)
- Thử gửi lại đúng gói tin vừa gửi (trùng `fCnt`).
- Log sẽ báo: `Skipping duplicate uplink for ... | fCnt: ...`. Điều này xác nhận Phase 2 đã hoạt động.

---
Nếu mọi thứ đều "Green", Platform của bạn đã chính thức đạt chuẩn **Dự án Công nghiệp** về cả Bảo mật và Ổn định.
