const amqp = require('amqplib');

let channel;
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

async function connectRabbitMQ(retries = 0) {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await conn.createChannel();
    await channel.assertExchange('recrusmart.events', 'topic', { durable: true });
    console.log('RabbitMQ connected (offre service)');
  } catch (err) {
    console.error('RabbitMQ connection error:', err);
    if (retries < MAX_RETRIES) {
      console.log(`Retrying connection in ${RETRY_DELAY/1000} seconds... (Attempt ${retries + 1}/${MAX_RETRIES})`);
      setTimeout(() => connectRabbitMQ(retries + 1), RETRY_DELAY);
    } else {
      console.error('Max retries reached. Could not connect to RabbitMQ');
    }
  }
}

connectRabbitMQ();

exports.publishOffreEvent = async (event, data) => {
  if (!channel) {
    console.warn('RabbitMQ channel not available. Message not published.');
    return;
  }
  channel.publish(
    'recrusmart.events',
    event,
    Buffer.from(JSON.stringify(data)),
    { persistent: true }
  );
}; 