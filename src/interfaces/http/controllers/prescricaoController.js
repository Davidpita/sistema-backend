/*Controllers/prescricaoController.js */
import PDFDocument from 'pdfkit';
import GerarPrescricao from '../../../domain/use-cases/gerarPrescricao.js';
import PrescricaoRepository from '../../../infrastructure/repositories/prescricaoRepository.js';
import ConsultaRepository from '../../../infrastructure/repositories/consultaRepository.js';
import AuditoriaRepository from '../../../infrastructure/repositories/auditoriaRepository.js';
import ListarPrescricoes from '../../../domain/use-cases/listarPrescricoes.js';
import { prisma } from '../../../config/database.js';

// Instâncias dos repositórios e casos de uso
const prescricaoRepository = new PrescricaoRepository();
const consultaRepository = new ConsultaRepository();
const auditoriaRepository = new AuditoriaRepository();
const gerarPrescricaoUseCase = new GerarPrescricao({
  prescricaoRepository,
  consultaRepository,
  auditoriaRepository
});
const listarPrescricoesUseCase = new ListarPrescricoes({ prescricaoRepository });

// 🧾 Criar prescrição (Médico)
export async function gerarPrescricao(req, res) {
  try {
    const { consultaId, medicamento, dosagem, duracao, observacoes } = req.body;
    const prescricao = await gerarPrescricaoUseCase.execute(
      { consultaId, medicamento, dosagem, duracao, observacoes },
      req.usuario ? req.usuario.id : null
    );
    res.status(201).json(prescricao);
  } catch (error) {
    console.error('Erro ao criar prescrição:', error);
    res.status(400).json({ error: error.message });
  }
}

// 📋 Listar todas as prescrições (admin ou médico)
export async function listarPrescricoes(req, res) {
  try {
    const prescricoes = await listarPrescricoesUseCase.execute();
    res.status(200).json(prescricoes);
  } catch (error) {
    console.error('Erro ao listar prescrições:', error);
    res.status(500).json({ error: 'Erro ao listar prescrições' });
  }
}

// 👁️ Obter prescrição de uma consulta (Utente autenticado)
export async function obterPrescricaoPorConsulta(req, res) {
  try {
    const { consultaId } = req.params;
    const utenteId = req.usuario.id; // vem do token JWT

    // 1️⃣ Verifica se a consulta pertence ao utente
    const consulta = await prisma.consulta.findUnique({
      where: { id: consultaId },
      select: { utenteId: true },
    });

    if (!consulta) {
      return res.status(404).json({ message: 'Consulta não encontrada.' });
    }

    if (consulta.utenteId !== utenteId) {
      return res.status(403).json({ message: 'Acesso negado a esta consulta.' });
    }

    // 2️⃣ Busca a prescrição associada
    const prescricao = await prisma.prescricao.findUnique({
      where: { consultaId },
    });

    if (!prescricao) {
      return res.status(404).json({ message: 'Nenhuma prescrição disponível para esta consulta.' });
    }

    // 3️⃣ Retorna o resultado
    res.status(200).json({ prescricao });
  } catch (error) {
    console.error('Erro ao obter prescrição:', error);
    res.status(500).json({ message: 'Erro ao buscar a prescrição.' });
  }
}

//gerar prescricao
export async function gerarPdfPrescricao(req, res) {
  try {
    const { id } = req.params;

    // Busca prescrição e inclui apenas a consulta + utente
    const prescricao = await prisma.prescricao.findUnique({
      where: { id },
      include: {
        consulta: {
          include: {
            utente: true
            // não incluir 'profissional' — não existe relação no schema
          }
        }
      }
    });

    if (!prescricao) {
      return res.status(404).json({ error: "Prescrição não encontrada" });
    }

    // Se a consulta tiver um profissionalId, buscar o usuário manualmente
    let profissional = null;
    const profId = prescricao.consulta?.profissionalId;
    if (profId) {
      profissional = await prisma.usuario.findUnique({
        where: { id: profId },
        select: { id: true, nome: true, email: true, papel: true }
      });
      // profissional pode ser null (id órfão) — tratamos abaixo
    }

    // Criar PDF e fazer stream para resposta
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescricao_${id}.pdf`);

    doc.pipe(res);

    // Conteúdo do PDF
    doc.fontSize(18).text('Prescrição Médica', { align: 'center' });
    doc.moveDown();

    const consulta = prescricao.consulta;
    if (consulta && consulta.utente) {
      doc.fontSize(12).text(`Utente: ${consulta.utente.nome || '—'}`);
      doc.text(`Contacto: ${consulta.utente.contacto || '—'}`);
    } else {
      doc.fontSize(12).text('Utente: —');
    }

    doc.moveDown();

    doc.text(`Profissional: ${profissional?.nome || 'N/A'}`);
    doc.text(`Medicamento: ${prescricao.medicamento}`);
    doc.text(`Dosagem: ${prescricao.dosagem}`);
    doc.text(`Duração: ${prescricao.duracao || '—'}`);
    doc.moveDown();
    doc.text('Observações:');
    doc.fontSize(11).text(prescricao.observacoes || 'Nenhuma', { indent: 10 });

    doc.moveDown(2);
    doc.text('__________________________________', { align: 'center' });
    doc.text('Assinatura do Profissional', { align: 'center' });

    doc.end();

  } catch (error) {
    console.error('Erro gerarPdfPrescricao:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro ao gerar PDF da prescrição' });
    } else {
      res.end();
    }
  }
}