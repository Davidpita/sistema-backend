class Consulta {
  constructor({ id, utenteId, profissionalId, tipo, data, resumo, prescricaoId, realizada }) {
    if (!id) throw new Error('ID da consulta é obrigatório');
    if (!utenteId) throw new Error('ID do utente é obrigatório');
    if (!tipo) throw new Error('Tipo da consulta é obrigatório');
    if (!['triagem', 'teleconsulta', 'presencial'].includes(tipo)) {
      throw new Error('Tipo de consulta inválido');
    }
    if (!data) throw new Error('Data da consulta é obrigatória');

    this.id = id;
    this.utenteId = utenteId;
    this.profissionalId = profissionalId || null;
    this.tipo = tipo;
    this.data = new Date(data);
    this.resumo = resumo || null;
    this.prescricaoId = prescricaoId || null;
    this.realizada = realizada ?? false; // ⬅ NOVO
  }
}

module.exports = Consulta;
