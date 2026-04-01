# 04. Quy trình Hệ thống (Workflows) - Updated Phase 2

Tài liệu này mô tả các workflow chính của nền tảng LoRaWAN Báo Cháy sau khi áp dụng hàng đợi xử lý.

## 1. Workflow xử lý sự kiện Uplink (Sensor -> Backend)

```mermaid
sequenceDiagram
    participant Sensor
    participant ChirpStack
    participant MQTT_Adapter
    participant UseCase
    participant Queue (BullMQ)
    participant Worker (Processor)
    participant Cache (Redis)
    participant TSDB (InfluxDB)
    participant RDBMS (Postgres)

    Sensor->>ChirpStack: Gửi gói tin LoRaWAN (Radio)
    ChirpStack->>MQTT_Adapter: Publish JSON Event (Topic: up)
    MQTT_Adapter->>UseCase: ProcessUplinkUseCase.execute()
    
    UseCase->>Queue (BullMQ): Add Job ('handleUplink')
    UseCase-->>MQTT_Adapter: Return Success (ACK MQTT nhanh)

    Note over Queue (BullMQ), Worker (Processor): Xử lý bất đồng bộ (Asynchronous)

    Queue (BullMQ)->>Worker (Processor): Nhận Job
    Worker (Processor)->>Cache (Redis): Kiểm tra fCnt (Idempotency)
    
    alt is Duplicate
        Worker (Processor)-->>Queue (BullMQ): Bỏ qua
    else is New Packet
        par Multi-storage
            Worker (Processor)->>Cache (Redis): upsert (Real-time state)
            Worker (Processor)->>TSDB (InfluxDB): savePoint (Analytics)
            Worker (Processor)->>RDBMS (Postgres): save (Audit/Alerts)
        end
        
        alt is Fire Alarm
            Worker (Processor)->>RDBMS (Postgres): Lưu cảnh báo & Gửi thông báo
        end
    end
```

## 2. Workflow Điều khiển Thiết bị (API -> Sensor)

```mermaid
sequenceDiagram
    participant WebAdmin
    participant API_Controller
    participant UseCase
    participant DownlinkPort
    participant MQTT_Broker
    participant ChirpStack
    participant Sensor

    WebAdmin->>API_Controller: POST /devices/:id/control (JWT Token)
    API_Controller->>UseCase: SendCommandUseCase.execute(cmd)
    UseCase->>DownlinkPort: send(payload) - Port Interface
    DownlinkPort->>MQTT_Broker: Publish Downlink Topic
    MQTT_Broker->>ChirpStack: Nhận lệnh Command
    ChirpStack->>Sensor: Gửi lệnh xuống Thiết bị (Downlink Radio)
```

## 3. Workflow Kiểm tra Sức khỏe (Monitoring)

1. **Monitor/Admin**: Truy cập `GET /health`.
2. **HealthController**: 
   - Gọi `TypeOrmHealthIndicator` kiểm tra Postgres.
   - PING Redis qua `RedisService`.
3. **Response**: Trả về trạng thái `up/down` của từng dịch vụ kèm chi tiết (Payload chuẩn Terminus).
