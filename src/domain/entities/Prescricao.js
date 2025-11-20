/*entities/Prescricao.js */
class Prescricao {
  constructor({ id, consultaId, medicamento, dosagem, duracao, observacoes }) {
    if (!id) throw new Error('ID da prescrição é obrigatório');
    if (!consultaId) throw new Error('ID da consulta é obrigatório');
    if (!medicamento) throw new Error('Medicamento é obrigatório');
    if (!dosagem) throw new Error('Dosagem é obrigatória');

    this.id = id;
    this.consultaId = consultaId;
    this.medicamento = medicamento;
    this.dosagem = dosagem;
    this.duracao = duracao || null;
    this.observacoes = observacoes || null;
  }
}

module.exports = Prescricao;