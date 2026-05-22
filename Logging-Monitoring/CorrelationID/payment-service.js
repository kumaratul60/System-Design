const express = require('express');

const app = express();
const PORT = 3001;

// Middleware to handle Correlation ID
app.use((req, res, next) => {
    // Payment service expects the Correlation ID from the caller (Order Service)
    const correlationId = req.headers['x-correlation-id'];
    
    req.correlationId = correlationId;
    res.setHeader('x-correlation-id', correlationId);
    
    console.log(`[Payment Service] [${correlationId}] Received payment request`);
    next();
});

app.get('/pay', (req, res) => {
    // Simulate payment processing
    console.log(`[Payment Service] [${req.correlationId}] Processing payment...`);
    
    // Simulate a random failure for debugging demonstration
    if (Math.random() > 0.8) {
        console.error(`[Payment Service] [${req.correlationId}] Payment gateway timeout!`);
        return res.status(503).json({ status: 'failed', error: 'Gateway Timeout' });
    }

    res.json({ status: 'success' });
});

app.listen(PORT, () => {
    console.log(`Payment Service running on port ${PORT}`);
});
