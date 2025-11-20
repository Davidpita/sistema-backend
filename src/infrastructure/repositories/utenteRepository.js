// src/infrastructure/repositories/utenteRepository.js
const IUtenteRepository = require("../../interfaces/repositories/iUtenteRepository");
const { prisma } = require("../../config/database");

class UtenteRepository extends IUtenteRepository {
  
  async create(utente) {
    // Cria utente e já inclui a zona
    return await prisma.utente.create({
      data: {
        id: utente.id,
        nome: utente.nome,
        dataNascimento: utente.dataNascimento,
        sexo: utente.sexo,
        contacto: utente.contacto,
        localizacao: utente.localizacao,
        idLocal: utente.idLocal,
        senha: utente.senha,
      },
      include: {
        zona: true, // Inclui a zona relacionada
      },
    });
  }

  async findZonaById(id) {
    return await prisma.zona.findUnique({ where: { id } });
  }

  async findById(id) {
    return await prisma.utente.findUnique({ where: { id }, include: { zona: true } });
  }

  async findByContacto(contacto) {
    return await prisma.utente.findUnique({ where: { contacto }, include: { zona: true } });
  }

  async findAll() {
    return await prisma.utente.findMany({
      include: {
        zona: true,
      },
    });
  }

  async delete(id) {
    return await prisma.utente.delete({ where: { id } });
  }

  async update(id, data) {
    return await prisma.utente.update({
      where: { id },
      data: {
        nome: data.nome,
        dataNascimento: data.dataNascimento,
        sexo: data.sexo,
        contacto: data.contacto,
        localizacao: data.localizacao,
        idLocal: data.idLocal,
      },
      include: {
        zona: true,
      },
    });
  }

  async findConsultasByUtenteId(utenteId) {
  return await prisma.consulta.findMany({
    where: { utenteId },
    include: {
      prescricao: true,
      utente: {
        select: { nome: true, contacto: true },
      },
    },
    orderBy: { data: 'desc' },
  });
}

  async count() {
  return await prisma.utente.count();
}

}

module.exports = UtenteRepository;
