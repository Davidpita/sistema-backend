require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// === Middlewares globais ===
app.use(express.json());

// Configuração de CORS para múltiplos frontends
const allowedOrigins = [
  'http://localhost:5173', // Frontend Admin
  'http://localhost:3001', // Frontend Utente
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem origin (como Postman) e as que estiverem na lista
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware de fallback para pré-requisições OPTIONS
//app.options('/*', cors());


// === Rotas ===
const dashboardRoutes = require('./interfaces/http/routes/dashboardRoutes');
const routes = require('./interfaces/http/routes/routes');

app.use('/', dashboardRoutes);  // rotas do administrador
app.use('/', routes);                    // rotas do utente

// === Rota base de teste ===
app.get('/', (req, res) => {
  res.json({ message: 'API eSaúde Local - Backend funcionando corretamente!' });
});

// === Inicialização do servidor ===
app.listen(port, () => {
  console.log(` Servidor rodando na porta ${port}`);
});

module.exports = app;
