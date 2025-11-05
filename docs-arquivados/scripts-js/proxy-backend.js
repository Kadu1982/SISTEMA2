const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Configurar CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-skip-auth']
}));

// Proxy para o backend
app.use('/api', createProxyMiddleware({
    target: 'http://localhost:8080',
    changeOrigin: true,
    secure: false,
    logLevel: 'debug',
    onError: (err, req, res) => {
        console.log('Erro no proxy:', err.message);
        res.status(500).json({ error: 'Erro no proxy para backend' });
    }
}));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Proxy funcionando' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Proxy rodando em http://localhost:${PORT}`);
    console.log(`📡 Redirecionando /api/* para http://localhost:8080`);
    console.log(`🌐 Acesse: http://localhost:${PORT}/api/auth/login`);
});

