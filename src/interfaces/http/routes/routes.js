// src/interfaces/http/routes/routes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const authMiddlewareUtente = require('../middlewares/authMiddlewareUtente');
const { login, eliminarUsuario, criarUsuario, listarUsuarios, listarMedicos} = require('../controllers/usuarioController');
const { criarUtente, loginUtente, listarUtentes, listarPerfil, eliminarUtente, editarUtente } = require('../controllers/utenteController');
const { processarTriagem, listarTriagens  } = require('../controllers/triagemController');
const triagemController = require('../controllers/triagemController');
const { agendarTeleconsulta, listarConsultas, marcarConsultaRealizada } = require('../controllers/consultaController');
const consultaController = require('../controllers/consultaController');
const { gerarPrescricao, listarPrescricoes, obterPrescricaoPorConsulta, gerarPdfPrescricao} = require('../controllers/prescricaoController');
const { monitorarLeituraClinica, listarLeiturasClinicas, listarLeiturasPorUtente } = require('../controllers/leituraClinicaController');
const { gerarRelatorioVigilancia } = require('../controllers/relatorioVigilanciaController');
const { listarZonas } = require("../controllers/zonaController");
const { route } = require("./dashboardRoutes");
const utenteController = require('../controllers/utenteController');


// Rotas de Usuário
router.post('/usuarios',authMiddleware(['gestor']), criarUsuario); // Apenas gestores criam usuários

//Listar Usuario
router.get('/usuarios', authMiddleware(['gestor']),listarUsuarios);

//Gestor eliminar usuarios
router.delete('/usuarios/:id', authMiddleware(['gestor']), eliminarUsuario);

router.post('/usuarios/login', login); // Login aberto

//listar os medicos
router.get('/usuarios/medico', authMiddleware(['gestor','medico']), listarMedicos);

// Rotas de Utente
router.post('/cadUtente', authMiddleware(['agente', 'enfermeiro', 'medico', 'gestor']), criarUtente);

// Rotas de Triagem
router.post('/triagens', processarTriagem);

//Listar triagens
router.get(
  '/triagens',
  authMiddleware(['agente', 'enfermeiro', 'medico', 'gestor']),
  listarTriagens
);

//Listar triagem por utente
router.get('/triagens/utente/:utenteId', authMiddleware(['gestor','medico','enfermeiro']), triagemController.listarPorUtente);

// Rotas de Consulta
router.post('/consultas', authMiddleware(['agente', 'enfermeiro', 'medico', 'gestor']), agendarTeleconsulta);

//listar consultas
router.get(
  '/consultas',
  authMiddleware(['agente', 'enfermeiro', 'medico', 'gestor']),
  listarConsultas
);

//Eliminar consulta
router.delete('/consultas/:id', consultaController.deletarConsulta);

//marcar consulta como realizada
router.put("/consultas/:id/realizada", marcarConsultaRealizada);

// Rotas de Prescrição
router.post('/prescricoes', authMiddleware(['medico']), gerarPrescricao); // Apenas médicos criam prescrições

//listar prescricoes
router.get(
  '/prescricoes',
  authMiddleware(['medico', 'gestor']),
  listarPrescricoes
);

//gerar pdf prescricao
router.get('/prescricoes/:id/pdf', gerarPdfPrescricao);

// Rotas de Leitura Clínica
router.post('/leituras-clinicas', authMiddleware(['agente', 'enfermeiro', 'medico']), monitorarLeituraClinica);

// Gestor visualiza todas as leituras
router.get('/leituras', authMiddleware(['gestor','agente']), listarLeiturasClinicas);

// Utente visualiza as próprias leituras
router.get('/utentes/leituras', authMiddlewareUtente, listarLeiturasPorUtente);

// Rotas de Vigilância Epidemiológica
router.post('/relatorios/vigilancia', authMiddleware(['gestor']), gerarRelatorioVigilancia); // Apenas gestores geram relatórios


/*UTENTES*/
//Cadastro de um utente ao sistema
router.post('/utentes', criarUtente);

/*Eliminar utente rota disponivel para o gestor*/
router.delete('/utentes/:id', authMiddleware(['gestor']), eliminarUtente);
//login do utente
router.post('/utentes/login', loginUtente);

/*Editar utente */
router.put('/utentes/:id', authMiddleware(['gestor']), editarUtente);

/*Utente listar suas consultas*/
router.get('/utentes/:id/consultas',authMiddlewareUtente, utenteController.listarConsultasDoUtente);

// Utente visualiza prescrição de sua consulta
router.get('/prescricoes/:consultaId', authMiddlewareUtente, obterPrescricaoPorConsulta);

//Usuario listar utentes
/*Essa rota permite que apenas medicos e gestor liste todos os Utentes*/
router.get('/utentes', authMiddleware(['gestor','medico','enfermeiro']),listarUtentes);

/*Essa rota permite que um utente veja os seus proprios dados*/
router.get('/utentes/me', authMiddlewareUtente, listarPerfil);

/*ZONAS */
router.get("/zonas", listarZonas);


// Rota raiz
router.get('/', (req, res) => {
  res.json({ message: 'API eSaúde Local' });
});

module.exports = router;
