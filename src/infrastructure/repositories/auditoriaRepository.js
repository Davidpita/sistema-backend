const IAuditoriaRepository = require('../../interfaces/repositories/iAuditoriaRepository');
const { prisma } = require('../../config/database');

class AuditoriaRepository extends IAuditoriaRepository {
  async create(auditoria) {
    return await prisma.auditoria.create({
      data: {
        id: auditoria.id,
        entidade: auditoria.entidade,
        entidadeId: String(auditoria.entidadeId),
        acao: auditoria.acao,
        userId: auditoria.userId,
        timestamp: auditoria.timestamp,
        detalhe: auditoria.detalhe
      }
    });
  }
}

module.exports = AuditoriaRepository;