// controllers/consultaController.js
const { prisma } = require('../../../config/database'); // ← IMPORTA PRISMA

const AgendarTeleconsulta = require('../../../domain/use-cases/agendarTeleconsulta');
const ConsultaRepository = require('../../../infrastructure/repositories/consultaRepository');
const AuditoriaRepository = require('../../../infrastructure/repositories/auditoriaRepository');
const ListarConsultas = require('../../../domain/use-cases/listarConsultas');

// Instâncias únicas
const consultaRepository = new ConsultaRepository();
const auditoriaRepository = new AuditoriaRepository();
const agendarTeleconsultaUseCase = new AgendarTeleconsulta({ consultaRepository, auditoriaRepository });
const listarConsultasUseCase = new ListarConsultas({ consultaRepository });

// === FUNÇÕES DO DASHBOARD ===
async function listarConsultasHoje(req, res) {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    const consultas = await consultaRepository.findByDate(hoje);
    
    res.json({ consultas }); // ← Array direto
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar consultas' });
  }
}

// === FUNÇÃO PRINCIPAL ===
async function agendarTeleconsulta(req, res) {
  try {
    const { utenteId, profissionalId, tipo, data } = req.body;
    const consulta = await agendarTeleconsultaUseCase.execute(
      { utenteId, profissionalId, tipo, data },
      req.usuario ? req.usuario.id : null
    );
    res.status(201).json(consulta);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listarConsultas(req, res) {
  try {
    const consultas = await listarConsultasUseCase.execute();
    res.json(consultas);
  } catch (error) {
    console.error('Erro ao listar consultas:', error);
    res.status(500).json({ error: error.message });
  }
}

async function estatisticasConsultasPorData(req, res) {
  try {
    const resultado = [];

    for (let i = 6; i >= 0; i--) {
      const data = new Date();
      data.setDate(data.getDate() - i);

      // Formata para 'YYYY-MM-DD' para buscar no banco
      const dataStr = data.toISOString().split('T')[0];

      // Consulta todas as consultas daquele dia
      const consultas = await consultaRepository.findByDate(dataStr);

      resultado.push({
        data: dataStr,           // data do dia
        total: consultas.length, // total de consultas naquele dia
      });
    }

    res.json(resultado);
  } catch (error) {
    console.error("Erro em estatisticasConsultasPorData:", error);
    res.status(500).json({ error: "Erro ao gerar estatísticas por data" });
  }
}

/*Eliminar uma consulta */
async function deletarConsulta(req, res) {
  try {
    const { id } = req.params;

    const consulta = await consultaRepository.findById(id);
    if (!consulta) {
      return res.status(404).json({ error: 'Consulta não encontrada' });
    }

    await consultaRepository.delete(id);

    res.status(200).json({ message: 'Consulta excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir consulta:', error);
    res.status(500).json({ error: 'Erro ao excluir consulta' });
  }


  

}

async function marcarConsultaRealizada(req, res) {
  try {
    const { id } = req.params;

    const consulta = await consultaRepository.findById(id);
    if (!consulta) {
      return res.status(404).json({ error: "Consulta não encontrada" });
    }

    const atualizada = await consultaRepository.update(id, {
      realizada: true
    });

    res.json({ message: "Consulta marcada como realizada", consulta: atualizada });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao marcar consulta como realizada" });
    }
  }



module.exports = { agendarTeleconsulta, listarConsultas, estatisticasConsultasPorData, deletarConsulta, marcarConsultaRealizada};
