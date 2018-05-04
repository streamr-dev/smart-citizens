const StreamrClient = require('streamr-client');

// Ahoy Hacker, fill in these!
const STREAM_NAME = 'INSERT_STREAM_NAME_HERE';
const API_KEY = 'INSERT_USER_API_KEY_HERE';

main().catch(console.error);

async function main() {
    // Initialize Streamr client
    const client = new StreamrClient({
        apiKey: API_KEY
    });

    // Get a Stream (creates one 1st time)
    const stream = await client.getOrCreateStream({
        name: STREAM_NAME
    });
    console.info("Initialized stream:", stream.id);

    // Generate and produce randomized data
    await generateEventAndSend(stream, 0);
}

async function generateEventAndSend(stream, i) {
    const msg = {
        messageNo: i,
        someString: randomAlphanumericString(256),
        temperature: Math.random() * 100 - 50,
        hypeLevel: Math.random() * 100 - 50,
        moonLevel: Math.random() * 100000 - 50,
        isMoon: Math.random() > 0.5
    };

    await stream.produce(msg);
    console.info('Event sent:', msg);

    // Send next package in 3 seconds
    setTimeout(generateEventAndSend.bind(null, stream, i + 1), 3 * 1000);
}

function randomAlphanumericString(len) {
    let charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < len; i++) {
        let randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}