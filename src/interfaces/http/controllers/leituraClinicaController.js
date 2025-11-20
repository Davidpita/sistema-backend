const MonitorarLeituraClinica = require('../../../domain/use-cases/monitorarLeituraClinica');
const LeituraClinicaRepository = require('../../../infrastructure/repositories/leituraClinicaRepository');
const NotificacaoRepository = require('../../../infrastructure/repositories/notificacaoRepository');
const AuditoriaRepository = require('../../../infrastructure/repositories/auditoriaRepository');

const leituraClinicaRepository = new LeituraClinicaRepository();
const notificacaoRepository = new NotificacaoRepository();
const auditoriaRepository = new AuditoriaRepository();
const monitorarLeituraClinicaUseCase = new MonitorarLeituraClinica({
  leituraClinicaRepository,
  notificacaoRepository,
  auditoriaRepository
});

// 🩺 Criar nova leitura clínica
async function monitorarLeituraClinica(req, res) {
  try {
    const { utenteId, tipo, valor, inseridoPor } = req.body;
    const result = await monitorarLeituraClinicaUseCase.execute(
      { utenteId, tipo, valor, inseridoPor },
      req.usuario ? req.usuario.id : null
    );
    res.status(201).json(result);
  } catch (error) {
    console.error('Erro ao monitorar leitura clínica:', error);
    res.status(400).json({ error: error.message });
  }
}

//  Listar todas as leituras (Gestor / Médico)
async function listarLeiturasClinicas(req, res) {
  try {
    const leituras = await leituraClinicaRepository.findAll();
    res.status(200).json(leituras);
  } catch (error) {
    console.error('Erro ao listar leituras clínicas:', error);
    res.status(500).json({ error: 'Erro ao listar leituras clínicas' });
  }
}

//  Listar leituras do próprio utente autenticado
async function listarLeiturasPorUtente(req, res) {
  try {
    const utenteId = req.usuario.id; // vem do token JWT
    const leituras = await leituraClinicaRepository.findByUtenteId(utenteId);
    res.status(200).json(leituras);
  } catch (error) {
    console.error('Erro ao listar leituras do utente:', error);
    res.status(500).json({ error: 'Erro ao listar leituras do utente' });
  }
}

module.exports = {
  monitorarLeituraClinica,
  listarLeiturasClinicas,
  listarLeiturasPorUtente
};
