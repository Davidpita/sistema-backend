const ITriagemRepository = require("../../interfaces/repositories/iTriagemRepository");
const { prisma } = require("../../config/database");

class TriagemRepository extends ITriagemRepository {
  async create(triagem) {
    return await prisma.triagem.create({
      data: {
        id: triagem.id,
        utenteId: triagem.utenteId,
        respostasJson: triagem.respostasJson,
        resultado: triagem.resultado,
        recomendacao: triagem.recomendacao,
        data: new Date()
      }
    });
  }

  async findUtenteById(utenteId) {
    return await prisma.utente.findUnique({ where: { id: utenteId } });
  }

  async findByZonaAndPeriodo(zonaId, periodoInicio, periodoFim) {
    return await prisma.triagem.findMany({
      where: {
        utente: { idLocal: String(zonaId) },
        data: {
          gte: periodoInicio,
          lte: periodoFim,
        },
      },
    });
  }

  // Adicione
  async findAll() {
    return await prisma.triagem.findMany({
      include: {
        utente: {
          select: { zona: true },
        },
      },
    });
  }

  async findByDate(data) {
    const startOfDay = new Date(data);
    const endOfDay = new Date(data);
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.triagem.findMany({
      where: {
        data: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
  }

  async findAll() {
    return await prisma.triagem.findMany({
      include: {
        utente: {
          select: {
            id: true,
            nome: true,
            dataNascimento: true,
            sexo: true,
            contacto: true
          }
        }
      },
      orderBy: {
        data: 'desc' 
      }
    });
  }

  async groupByZona() {
  return await prisma.triagem.groupBy({
    by: ['zona'],
    _count: { zona: true },
    orderBy: { _count: { zona: 'desc' } }
  });
}

// src/infrastructure/repositories/triagemRepository.js

async findByUtenteId(utenteId) {
  return await prisma.triagem.findMany({
    where: { utenteId },
    include: {
      utente: {
        select: {
          id: true,
          nome: true,
          contacto: true,
          sexo: true,
          dataNascimento: true
        }
      }
    },
    orderBy: { data: 'desc' }
  });
}


}

module.exports = TriagemRepository;
