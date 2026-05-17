const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Helper to set policy based on type
const setPolicy = (res, type) => {
    let policy = '';
    let description = '';
    
    switch (type) {
        case 'all':
            policy = 'geolocation=*';
            description = 'Feature allowed for all origins (*)';
            break;
        case 'some':
            policy = 'geolocation=(self "https://pp-demo-trusted-site.glitch.me")';
            description = 'Feature allowed for specific origins';
            break;
        case 'self':
            policy = 'geolocation=(self)';
            description = 'Feature allowed for same-origin only (self)';
            break;
        case 'none':
            policy = 'geolocation=()';
            description = 'Feature disabled for all origins (none)';
            break;
        case 'iframe':
            policy = 'geolocation=(self)';
            description = 'Iframe behavior demo';
            break;
        default:
            policy = 'geolocation=(self)';
            description = 'Default Policy (Same-Origin)';
    }
    
    res.setHeader('Permissions-Policy', policy);
    return { policy, description };
};

app.get('/', (req, res) => {
    setPolicy(res, 'default');
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/all-allowed', (req, res) => {
    setPolicy(res, 'all');
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/some-allowed', (req, res) => {
    setPolicy(res, 'some');
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/same-origin-allowed', (req, res) => {
    setPolicy(res, 'self');
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/none-allowed', (req, res) => {
    setPolicy(res, 'none');
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/iframe-demo', (req, res) => {
    setPolicy(res, 'iframe');
    res.sendFile(path.join(__dirname, 'index.html'));
});

// A child page for iframe testing
app.get('/child', (req, res) => {
    // Child has no policy, but parent's policy should apply if it's in an iframe
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><style>body { font-family: sans-serif; background: #eee; padding: 10px; border: 2px dashed #999; }</style></head>
        <body>
            <h4>Iframe Content</h4>
            <button onclick="testGeo()">Test Geolocation in Iframe</button>
            <p id="status"></p>
            <script>
                function testGeo() {
                    const status = document.getElementById('status');
                    status.innerText = 'Requesting...';
                    navigator.geolocation.getCurrentPosition(
                        (p) => status.innerText = '✅ Allowed: ' + p.coords.latitude.toFixed(2),
                        (e) => status.innerText = '❌ Blocked: ' + e.message
                    );
                }
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Demo running at http://localhost:${PORT}`);
});
