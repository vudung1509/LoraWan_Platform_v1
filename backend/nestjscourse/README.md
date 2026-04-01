# LoRaWAN Backend Integration Platform

Dự án Backend đóng vai trò trung gian giao tiếp giữa ChirpStack LoRaWAN Network Server và hệ thống Frontend/Mobile App. Hệ thống được xây dựng trên nền tảng NestJS, tích hợp giao thức MQTT, cơ sở dữ liệu PostgreSQL và xác thực JWT.

## Kiến trúc hệ thống
- **MqttModule:** Quản lý kết nối MQTT Native và giao tiếp với ChirpStack broker.
- **LorawanModule:** Xử lý và giải mã dữ liệu Uplink từ thiết bị LoRaWAN.
- **DeviceModule:** Cung cấp RESTful API quản lý thiết bị và thực thi lệnh Downlink.
- **UsersModule & AuthModule:** Quản lý định danh người dùng và xác thực bảo mật JWT.
- **DatabaseModule:** Tích hợp TypeORM để làm việc với PostgreSQL.

## Cấu trúc tài liệu dự án
Thư mục `docs/` cung cấp tài liệu kỹ thuật chi tiết của dự án:
- [01_commands.md](docs/01_commands.md): Tổng hợp các lệnh quản trị và triển khai.
- [02_folder_structure.md](docs/02_folder_structure.md): Chi tiết cấu trúc thư mục source code.
- [03_code_logic.md](docs/03_code_logic.md): Phân tích thuật toán và logic của các thành phần chính.
- [04_system_workflow.md](docs/04_system_workflow.md): Luồng xử lý dữ liệu của toàn bộ hệ thống.
