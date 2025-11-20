const GerarRelatorioVigilancia = require('../../../domain/use-cases/gerarRelatorioVigilancia');
const TriagemRepository = require('../../../infrastructure/repositories/triagemRepository');
const LeituraClinicaRepository = require('../../../infrastructure/repositories/leituraClinicaRepository');
const AuditoriaRepository = require('../../../infrastructure/repositories/auditoriaRepository');

const triagemRepository = new TriagemRepository();
const leituraClinicaRepository = new LeituraClinicaRepository();
const auditoriaRepository = new AuditoriaRepository();
const gerarRelatorioVigilanciaUseCase = new GerarRelatorioVigilancia({
  triagemRepository,
  leituraClinicaRepository,
  auditoriaRepository
});

async function gerarRelatorioVigilancia(req, res) {
  try {
    let { zonaId, periodoInicio, periodoFim } = req.body;

    if (!zonaId || !periodoInicio || !periodoFim) {
      return res.status(400).json({ error: "Campos zonaId, periodoInicio e periodoFim são obrigatórios." });
    }

    // Converter datas para ISO e validar
    const inicio = new Date(periodoInicio);
    const fim = new Date(periodoFim);

    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      return res.status(400).json({
        error: "Datas inválidas. Use o formato: YYYY-MM-DD (ex: 2024-02-01)"
      });
    }

    const relatorio = await gerarRelatorioVigilanciaUseCase.execute(
      { zonaId: Number(zonaId), periodoInicio: inicio, periodoFim: fim },
      req.usuario ? req.usuario.id : null
    );

    res.status(200).json(relatorio);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = { gerarRelatorioVigilancia };