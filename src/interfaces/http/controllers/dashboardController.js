const { prisma } = require('../../../config/database');

module.exports = {
  async getTotalUtentes(req, res) {
    try {
      const total = await prisma.utente.count();
      return res.json({ totalUtentes: total });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao obter total de utentes' });
    }
  },

  async getConsultasHoje(req, res) {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const consultasHoje = await prisma.consulta.findMany({
      where: {
        data: { gte: hoje },
      },
      include: {
        utente: true,
      },
      orderBy: { data: 'asc' },
    });

    return res.json({ consultas: consultasHoje });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao obter consultas de hoje' });
  }
},


 async getTriagensHoje(req, res) {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const triagens = await prisma.triagem.findMany({
      where: {
        data: { gte: hoje },
        resultado: { equals: "risco alto", mode: "insensitive" }
      },
      orderBy: { data: "desc" },
      take: 5,
      include: {
        utente: true
      }
    });

    return res.json(triagens);
  } catch (error) {
    console.error("Erro ao obter triagens de hoje:", error);
    return res.status(500).json({ error: "Erro ao obter triagens" });
  }
},


  async getTotalMedicos(req, res) {
    try {
      const totalMedicos = await prisma.usuario.count({
        where: { papel: 'medico' }
      });
      return res.json({ totalMedicos });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao obter total de médicos' });
    }
  },

  async getConsultasEstatisticas(req, res) {
    try {
      const estatisticas = await prisma.consulta.groupBy({
        by: ['tipo'],
        _count: { tipo: true }
      });
      return res.json(estatisticas);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao obter estatísticas' });
    }
  },

  async getTriagensPorZona(req, res) {
    try {
      const triagensPorZona = await prisma.zona.findMany({
        include: {
          utentes: {
            include: { triagens: true }
          }
        }
      });
      return res.json(triagensPorZona);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao obter triagens por zona' });
    }
  }
};
