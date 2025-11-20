// src/domain/use-cases/listarTriagensPorUtente.js
class ListarTriagensPorUtente {
  constructor({ triagemRepository }) {
    this.triagemRepository = triagemRepository;
  }

  async execute(utenteId) {
    if (!utenteId) {
      throw new Error("O ID do utente é obrigatório");
    }

    return await this.triagemRepository.findByUtenteId(utenteId);
  }
}

module.exports = ListarTriagensPorUtente;
