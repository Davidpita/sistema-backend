const ILeituraClinicaRepository = require('../../interfaces/repositories/iLeituraClinicaRepository');
const { prisma } = require('../../config/database');

class LeituraClinicaRepository extends ILeituraClinicaRepository {
  async create(leitura) {
    return await prisma.leituraClinica.create({
      data: {
        id: leitura.id,
        utenteId: leitura.utenteId,
        tipo: leitura.tipo,
        valor: leitura.valor,
        dataHora: leitura.dataHora,
        inseridoPor: leitura.inseridoPor
      }
    });
  }

  async findAll() {
  return await prisma.leituraClinica.findMany({
    include: {
      utente: { select: { id: true, nome: true, contacto: true } }
    },
    orderBy: { dataHora: 'desc' }
  });
}

  async findByUtenteId(utenteId) {
    return await prisma.leituraClinica.findMany({
      where: { utenteId },
      orderBy: { dataHora: 'desc' }
    });
  }


  async findUtenteById(utenteId) {
    return await prisma.utente.findUnique({ where: { id: utenteId } });
  }

  async findByZonaAndPeriodo(zonaId, periodoInicio, periodoFim) {
    return await prisma.leituraClinica.findMany({
      where: {
        utente: { idLocal: String(zonaId) },
        dataHora: {
          gte: periodoInicio,
          lte: periodoFim
        }
      }
    });
  }
}

module.exports = LeituraClinicaRepository;