const amqp = require('amqplib');
let channel = null;

async function getRabbitChannel() {
  if (channel) return channel;
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertExchange('recrusmart.events', 'topic', { durable: true });
  return channel;
}

module.exports = { getRabbitChannel }; 