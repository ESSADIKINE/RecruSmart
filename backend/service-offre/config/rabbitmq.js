const amqp = require('amqplib');

let channel;

async function connectRabbitMQ() {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await conn.createChannel();
    await channel.assertExchange('recrusmart.events', 'topic', { durable: true });
    console.log('RabbitMQ connected (offre service)');
  } catch (err) {
    console.error('RabbitMQ connection error:', err);
  }
}

connectRabbitMQ();

exports.publishOffreEvent = async (event, data) => {
  if (!channel) return;
  channel.publish(
    'recrusmart.events',
    event,
    Buffer.from(JSON.stringify(data)),
    { persistent: true }
  );
}; 