import * as mqtt from 'mqtt';

const client = mqtt.connect('mqtt://127.0.0.1:1883');

const devEui = '1122334455667788';
const topic = `application/1/device/${devEui}/event/up`;

const payload = {
  deviceInfo: {
    applicationId: '1',
    devEui: devEui,
    deviceName: 'Mock-Sensor-01',
  },
  object: {
    temperature: 75.5, // High temp!
    smoke: 600,       // High smoke!
    humidity: 45.0,
  },
};

client.on('connect', () => {
  console.log(`📡 Sending mock ChirpStack Uplink to: ${topic}`);
  client.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
    if (err) {
      console.error(' Failed to publish:', err);
    } else {
      console.log(' Mock payload sent successfully!');
      console.log('Payload:', JSON.stringify(payload, null, 2));
    }
    client.end();
  });
});

client.on('error', (err) => {
  console.error('❌ MQTT Error:', err);
  process.exit(1);
});
