const express = require('express');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const app = express();
const PORT = 3000;
const PAYMENT_SERVICE_URL = 'http://localhost:3001/pay';

// Middleware to handle Correlation ID
app.use((req, res, next) => {
    // 1. Check if Correlation ID exists in incoming request (passed from Gateway)
    // 2. If not, generate a new one (as the entry point)
    const correlationId = req.headers['x-correlation-id'] || uuidv4();
    
    // Store it in the request object for easy access
    req.correlationId = correlationId;
    
    // Set it in the response header so the client knows the ID for debugging
    res.setHeader('x-correlation-id', correlationId);
    
    console.log(`[Order Service] [${correlationId}] Received request for: ${req.url}`);
    next();
});

app.get('/create-order', async (req, res) => {
    const orderId = Math.floor(Math.random() * 1000);
    console.log(`[Order Service] [${req.correlationId}] Creating order #${orderId}`);

    try {
        // PROPAGATION: Pass the Correlation ID to the downstream service
        const response = await axios.get(PAYMENT_SERVICE_URL, {
            headers: {
                'x-correlation-id': req.correlationId
            }
        });

        res.json({
            message: 'Order created and paid successfully',
            orderId,
            paymentStatus: response.data.status,
            correlationId: req.correlationId
        });
    } catch (error) {
        console.error(`[Order Service] [${req.correlationId}] Payment failed: ${error.message}`);
        res.status(500).json({ error: 'Order processing failed', correlationId: req.correlationId });
    }
});

app.listen(PORT, () => {
    console.log(`Order Service running on port ${PORT}`);
});
