const amqp = require('amqplib');

async function connectRabbit() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertExchange('recrusmart.events', 'fanout', { durable: true });
  await channel.assertQueue('notification-email-queue', { durable: true });
  await channel.bindQueue('notification-email-queue', 'recrusmart.events', '');
  return channel;
}

module.exports = { connectRabbit }; 