# LoRaWAN Fire Alarm Platform (Clean Architecture)

Nền tảng giám sát và báo cháy thông minh dựa trên công nghệ LoRaWAN, sử dụng ChirpStack và NestJS với kiến trúc Clean Architecture.

## 🚀 Tính năng chính
- **Giám sát thời gian thực**: Nhiệt độ, Độ ẩm, Khói, CO2, Bụi mịn.
- **Báo cháy thông minh**: Tự động phân loại cảnh báo FIRE/SMOKE/HEAT dựa trên logic domain.
- **Kiến trúc bền vững**: Tách biệt hoàn toàn Business Logic khỏi Database (Postgres) và Framework (NestJS).
- **Bảo mật**: API được bảo vệ bằng JWT (Passport).
- **Điều khiển Downlink**: Gửi lệnh điều khiển thiết bị (Bật bơm, Reset alarm) từ Dashboard.

## 🛠️ Yêu cầu hệ thống
- **Docker & Docker Compose** (Chạy ChirpStack Stack).
- **Node.js v18+**.
- **PostgreSQL** (Được đi kèm trong Docker).

## 📂 Tài liệu hướng dẫn (Docs)
1.  [Các câu lệnh vận hành](docs/01_commands.md)
2.  [Cấu trúc thư mục dự án](docs/02_folder_structure.md)
3.  [Đặc tả Logic chương trình](docs/03_code_logic.md)
4.  [Quy trình Workflow (Mermaid)](docs/04_system_workflow.md)
5.  [Kịch bản Thử nghiệm](docs/05_test_scenarios.md)
6.  [Hướng dẫn Setup Gateway vật lý](docs/06_gateway_setup.md)

## 🔧 Cấu trúc Test nhanh
Để kiểm tra logic báo cháy mà không cần sensor thật:
```bash
cd backend/nestjscourse
npx ts-node scripts/mock-uplink.ts
```

## 📮 API Testing
Dùng Postman import file: `docs/LoRaWAN_Platform.postman_collection.json`.

---
*Phát triển bởi Đội ngũ kỹ thuật LoRaWAN Platform.*
