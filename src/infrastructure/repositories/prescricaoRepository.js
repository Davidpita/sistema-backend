/*infrastructure/repositories/prescricaoRepository.js */
const IPrescricaoRepository = require('../../interfaces/repositories/iPrescricaoRepository');
const { prisma } = require('../../config/database');

class PrescricaoRepository extends IPrescricaoRepository {
  async create(prescricao) {
    return await prisma.prescricao.create({
      data: {
        id: prescricao.id,
        consultaId: prescricao.consultaId,
        medicamento: prescricao.medicamento,
        dosagem: prescricao.dosagem,
        duracao: prescricao.duracao,
        observacoes: prescricao.observacoes
      }
    });
  }

  async findAll() {
  return await prisma.prescricao.findMany({
    include: {
      consulta: {
        include: {
          utente: { select: { id: true, nome: true } }
        }
      }
    },
    orderBy: { dataCriacao: 'desc' }
  });
}


}


  
module.exports = PrescricaoRepository;