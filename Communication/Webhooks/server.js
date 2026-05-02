const express = require('express');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// In a real application, this secret would be stored in environment variables.
const WEBHOOK_SECRET = 'super-secret-key';

// Middleware to parse JSON bodies
app.use(express.json());

// A simple in-memory store to demonstrate idempotency
const processedEvents = new Set();

/**
 * Webhook Consumer Endpoint
 * This endpoint simulates how a service receives and processes a webhook.
 */
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const payload = req.body;
  const eventId = payload.id;

  console.log(`\n--- Received Webhook Event: ${payload.type} ---`);

  // 1. Security: Verify Signature
  if (!signature) {
    console.error('Error: No signature provided.');
    return res.status(401).send('No signature');
  }

  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');

  if (signature !== digest) {
    console.error('Error: Invalid signature. Potential spoofing attempt!');
    return res.status(403).send('Invalid signature');
  }

  // 2. Idempotency: Check if we have already processed this event
  if (processedEvents.has(eventId)) {
    console.log(`Event ${eventId} already processed. Skipping...`);
    return res.status(200).send('Duplicate event acknowledged');
  }

  // 3. Acknowledge Receipt Quickly
  // We send a 200 OK immediately so the provider doesn't timeout.
  res.status(200).send('Webhook received');

  // 4. Asynchronous Processing
  // We simulate heavy processing (like updating a database or sending an email)
  // after the response has been sent.
  processWebhookAsync(payload);
});

function processWebhookAsync(payload) {
  console.log(`Processing event ${payload.id} asynchronously...`);

  // Simulate some work
  setTimeout(() => {
    processedEvents.add(payload.id);
    console.log(`Successfully processed ${payload.type} for ID: ${payload.id}`);
    console.log('Current Processed Events:', Array.from(processedEvents));
  }, 2000);
}

app.listen(PORT, () => {
  console.log(`Webhook Consumer Server is running on http://localhost:${PORT}`);
  console.log(`POST to http://localhost:${PORT}/webhook to test.`);
});

/**
 * INSTRUCTIONS TO TEST:
 *
 * 1. Run the server: `node server.js`
 * 2. In another terminal, send a mock webhook using curl:
 *
 * curl -X POST http://localhost:3000/webhook \
 *   -H "Content-Type: application/json" \
 *   -H "x-hub-signature-256: sha256=49658e37604a3765e10086c07d394747c355f3e9894e45d1600c3c869f0464f1" \
 *   -d '{
 *     "id": "evt_001",
 *     "type": "payment.succeeded",
 *     "data": { "amount": 2000, "currency": "usd" }
 *   }'
 *
 * Note: The signature above is pre-calculated for the payload '{"id":"evt_001","type":"payment.succeeded","data":{"amount":2000,"currency":"usd"}}'
 * and the secret 'super-secret-key'.
 */
