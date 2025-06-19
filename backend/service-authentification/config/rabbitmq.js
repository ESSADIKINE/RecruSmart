const amqp = require('amqplib');

let channel;
async function connectRabbit() {
  if (!channel) {
    const conn = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await conn.createChannel();
    await channel.assertExchange('recrusmart.events', 'topic', { durable: true });
  }
  return channel;
}

async function publishEvent(type, data) {
  const ch = await connectRabbit();
  ch.publish('recrusmart.events', '', Buffer.from(JSON.stringify({ type, data })));
}

module.exports = { publishEvent }; 