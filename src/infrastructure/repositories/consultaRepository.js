/*infrastruture/repositories/consultaRepository.js */
const IConsultaRepository = require("../../interfaces/repositories/iConsultaRepository");
const { prisma } = require("../../config/database");

class ConsultaRepository extends IConsultaRepository {
  async create(consulta) {
    return await prisma.consulta.create({
      data: {
        id: consulta.id,
        utenteId: consulta.utenteId,
        profissionalId: consulta.profissionalId,
        tipo: consulta.tipo,
        data: consulta.data,
        resumo: consulta.resumo,
        prescricaoId: consulta.prescricaoId,
        realizada: consulta.realizada,
      },
    });
  }

  async findById(id) {
    return await prisma.consulta.findUnique({ where: { id } });
  }

  async update(id, data) {
    return await prisma.consulta.update({
      where: { id },
      data,
    });
  }

  async verificarDisponibilidade(profissionalId, data) {
    if (!profissionalId) return true; // Se não tem médico, permite (alocação automática)

    const consultaExistente = await prisma.consulta.findFirst({
      where: {
        profissionalId,
        data: {
          gte: new Date(data),
          lt: new Date(new Date(data).getTime() + 1000), // mesma segunda
        },
      },
    });
    return !consultaExistente;
  }

  async findUtenteById(utenteId) {
    return await prisma.utente.findUnique({ where: { id: utenteId } });
  }

   async findAll() {
    return await prisma.consulta.findMany({
      include: {
        utente: { select: { id: true, nome: true, contacto: true } },
        // Inclua profissional se tiver modelo Usuario/Profissional
      },
      orderBy: { data: 'desc' }
    });
  }

  async countByDate(date) {
  const start = new Date(date.setHours(0, 0, 0, 0));
  const end = new Date(date.setHours(23, 59, 59, 999));

  return await prisma.consulta.count({
    where: {
      dataConsulta: {
        gte: start,
        lte: end
      }
    }
  });
}

  async findByDate(dataStr) {
    // dataStr deve estar no formato 'YYYY-MM-DD'
    return await prisma.consulta.findMany({
      where: {
        data: {
          gte: new Date(`${dataStr}T00:00:00.000Z`),
          lte: new Date(`${dataStr}T23:59:59.999Z`),
        },
      },
    });
  }

  async delete(id) {
  return await prisma.consulta.delete({
    where: { id },
  });
}


}

module.exports = ConsultaRepository;
