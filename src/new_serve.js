require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;

app.use(express.json());

// HABILITAR CORS PARA TODOS OS DOMÍNIOS
app.use(cors({
  origin: true, // Permite qualquer origem (http://localhost:5173, etc.)
  credentials: true,
}));

const dashboardRoutes = require('./interfaces/http/routes/dashboardRoutes');
const routes = require('./interfaces/http/routes/routes');


app.use(dashboardRoutes);
app.use(routes);

//app.use(rotas);


app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

module.exports = app;