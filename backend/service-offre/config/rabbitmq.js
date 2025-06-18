const amqp = require('amqplib');

let channel = null;
let connection = null;
let isConnecting = false;

const waitForRabbitMQ = async () => {
    const maxRetries = 30;
    const retryDelay = 3000; // 3 secondes

    for (let i = 0; i < maxRetries; i++) {
        try {
            console.log('Tentative de connexion à RabbitMQ...');
            connection = await amqp.connect(process.env.RABBITMQ_URL);
            channel = await connection.createChannel();
            
            // Déclarer l'exchange
            await channel.assertExchange('recrusmart.events', 'topic', {
                durable: true
            });
            
            console.log('Connecté à RabbitMQ avec succès');
            return true;
        } catch (error) {
            console.log(`RabbitMQ n'est pas prêt. Attente de ${retryDelay/1000}s...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
    throw new Error('Impossible de se connecter à RabbitMQ après plusieurs tentatives');
};

const connect = async () => {
    if (isConnecting) {
        console.log('Une connexion est déjà en cours...');
        return;
    }

    try {
        isConnecting = true;
        await waitForRabbitMQ();
        isConnecting = false;
    } catch (error) {
        isConnecting = false;
        console.error('Erreur de connexion à RabbitMQ:', error);
        throw error;
    }
};

const ensureConnection = async () => {
    if (!channel || !connection) {
        await connect();
    }
};

const publishOffreEvent = async (routingKey, data) => {
    try {
        await ensureConnection();
        
        // Convertir les ObjectId en string pour la sérialisation JSON
        const serializedData = JSON.parse(JSON.stringify(data, (key, value) => {
            if (value && typeof value === 'object' && value._bsontype === 'ObjectID') {
                return value.toString();
            }
            return value;
        }));
        
        await channel.publish(
            'recrusmart.events',
            routingKey,
            Buffer.from(JSON.stringify(serializedData)),
            {
                persistent: true
            }
        );
        console.log(`Événement publié sur ${routingKey}:`, serializedData);
    } catch (error) {
        console.error('Erreur lors de la publication de l\'événement:', error);
        // Tenter de se reconnecter
        channel = null;
        connection = null;
        throw error;
    }
};

// Gestion de la fermeture propre
process.on('SIGINT', async () => {
    if (channel) {
        await channel.close();
    }
    if (connection) {
        await connection.close();
    }
    process.exit(0);
});

module.exports = {
    connect,
    publishOffreEvent
}; 