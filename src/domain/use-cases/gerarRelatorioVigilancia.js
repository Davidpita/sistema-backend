const Auditoria = require('../entities/Auditoria');

class GerarRelatorioVigilancia {
  constructor({ triagemRepository, leituraClinicaRepository, auditoriaRepository }) {
    this.triagemRepository = triagemRepository;
    this.leituraClinicaRepository = leituraClinicaRepository;
    this.auditoriaRepository = auditoriaRepository;
  }

  async execute({ zonaId, periodoInicio, periodoFim }, userId) {
    // Buscar triagens e leituras no período
    const triagens = await this.triagemRepository.findByZonaAndPeriodo(zonaId, periodoInicio, periodoFim);
    const leituras = await this.leituraClinicaRepository.findByZonaAndPeriodo(zonaId, periodoInicio, periodoFim);

    // Agregar dados por sintoma / condição
    const resumoSintomas = this.agruparSintomas(triagens);

    // Gerar alertas detalhados
    const alertas = this.gerarAlertasEpidemiologicos(resumoSintomas, leituras);

    const relatorio = {
      zonaId,
      periodo: { inicio: periodoInicio, fim: periodoFim },
      totalTriagens: triagens.length,
      totalLeituras: leituras.length,
      resumoSintomas,
      alertas
    };

    // Registrar auditoria
    const auditoria = new Auditoria({
      id: require('crypto').randomUUID(),
      entidade: 'RelatorioVigilancia',
      entidadeId: String(zonaId),
      acao: 'generate',
      userId,
      detalhe: `Relatório de vigilância gerado para zona ${zonaId}`
    });
    await this.auditoriaRepository.create(auditoria);

    return relatorio;
  }

  // Agrupa respostas das triagens por sintoma e conta casos
  agruparSintomas(triagens) {
    const resumo = {};
    triagens.forEach(t => {
      let respostas = {};
      try {
        respostas = JSON.parse(t.respostasJson);
      } catch (e) {
        respostas = {};
      }

      Object.keys(respostas).forEach(sintoma => {
        const valor = respostas[sintoma];
        if (!resumo[sintoma]) resumo[sintoma] = {};
        if (!resumo[sintoma][valor]) resumo[sintoma][valor] = 0;
        resumo[sintoma][valor]++;
      });
    });
    return resumo;
  }

  // Gera alertas com base em regras simples
  gerarAlertasEpidemiologicos(resumoSintomas, leituras) {
    const alertas = [];

    // Exemplo: surto de febre
    if (resumoSintomas.febre && resumoSintomas.febre.alta >= 5) {
      alertas.push({ tipo: 'surto', mensagem: 'Possível surto de febre detectado' });
    }

    // Exemplo: alerta de diarreia
    if (resumoSintomas.diarreia && resumoSintomas.diarreia.sim >= 3) {
      alertas.push({ tipo: 'alerta', mensagem: 'Casos de diarreia acima do esperado' });
    }

    // Leitura clínica (ex.: temperatura corporal > 39)
    const tempAlta = leituras.filter(l => l.tipo === 'temperatura' && Number(l.valor) >= 39).length;
    if (tempAlta >= 5) {
      alertas.push({ tipo: 'alerta', mensagem: 'Vários casos de febre alta detectados nas leituras clínicas' });
    }

    return alertas;
  }
}

module.exports = GerarRelatorioVigilancia;
