const mqtt = require('mqtt');

console.log('Connecting to MQTT...');
const client = mqtt.connect('mqtt://localhost:1883');

client.on('connect', () => {
    console.log('Connected! Publishing test message...');
    client.publish('test/topic', 'ASSISTANT TEST');
    client.publish('application/1/device/1122334455667788/event/up', JSON.stringify({
        deviceInfo: { devEui: '1122334455667788' },
        data: Buffer.from('TESTING').toString('base64')
    }));
    console.log('Published! Waiting a moment before disconnect...');
    setTimeout(() => {
        client.end();
        console.log('Done.');
    }, 1000);
});

client.on('error', (err) => {
    console.error('MQTT Error:', err);
});
