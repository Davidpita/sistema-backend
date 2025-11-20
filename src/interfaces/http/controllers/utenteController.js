const CriarUtente = require('../../../domain/use-cases/criarUtente');
const EditarUtente = require('../../../domain/use-cases/editarUtente');
const UtenteRepository = require('../../../infrastructure/repositories/utenteRepository');
const AuditoriaRepository = require('../../../infrastructure/repositories/auditoriaRepository');

const AtualizarUtente = require('../../../domain/use-cases/atualizarUtente');
const ExcluirUtente = require('../../../domain/use-cases/excluirUtente');

// const Utente = require('../../../domain/entities/Utente');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 


const utenteRepository = new UtenteRepository();
const auditoriaRepository = new AuditoriaRepository();
const criarUtenteUseCase = new CriarUtente({ utenteRepository, auditoriaRepository });
const editarUtenteUseCase = new EditarUtente({ utenteRepository, auditoriaRepository });


//Cadastro de um Utente
async function criarUtente(req, res) {
  try {
    const { nome, dataNascimento, sexo, contacto, localizacao, idLocal, senha } = req.body;
    const utente = await criarUtenteUseCase.execute(
      { nome, dataNascimento, sexo, contacto, localizacao, idLocal, senha },
      req.usuario ? req.usuario.id : null
    );
    res.status(201).json(utente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
//Permite que os Utente facam login no sistema
async function loginUtente(req, res) {
  try {
    const { contacto, senha } = req.body;

    const utente = await utenteRepository.findByContacto(contacto);
    if (!utente) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const senhaValida = await bcrypt.compare(senha, utente.senha); // <-- corrigido
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: utente.id }, // <-- corrigido
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    res.json({ token, utente: { id: utente.id, nome: utente.nome, contacto: utente.contacto } }); // <-- corrigido
  } catch (error) {
    console.error('Erro no loginUtente:', error);
    res.status(500).json({ error: "Qualquer coisa..." });
  }
}

//Funcao para o Usuario listar os dados dos utentes
async function listarUtentes(req, res) {
  try {
    const utentes = await utenteRepository.findAll();
    res.json(utentes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar utentes' });
  }
}

//Funcao para o Utente listar o seu proprio perfil
async function listarPerfil(req, res) {
  try {
    const utente = await utenteRepository.findById(req.usuario.id);

    if (!utente) {
      return res.status(404).json({ error: 'Utente não encontrado' });
    }

    res.json({
      id: utente.id,
      nome: utente.nome,
      dataNascimento: utente.dataNascimento,
      sexo: utente.sexo,
      contacto: utente.contacto,
      localizacao: utente.localizacao,
      idLocal: utente.idLocal,
      zona: utente.zona,
    });
  } catch (error) {
    console.error('Erro ao buscar perfil do utente:', error);
    res.status(500).json({ error: 'Erro ao buscar perfil do utente' });
  }
}

async function eliminarUtente(req, res) {
  try {
    const { id } = req.params;

    // Verifica se o utente existe
    const utente = await utenteRepository.findById(id);
    if (!utente) {
      return res.status(404).json({ error: 'Utente não encontrado' });
    }

    // Elimina o utente
    await utenteRepository.delete(id);

    // Registra na auditoria
    await auditoriaRepository.create({
      id: require('crypto').randomUUID(),
      entidade: 'Utente',
      entidadeId: id,
      acao: 'delete',
      userId: req.usuario.id,
      detalhe: `Utente ${utente.nome} eliminado pelo gestor ${req.usuario.nome}`
    });

    res.json({ message: 'Utente eliminado com sucesso' });
  } catch (error) {
    console.error('Erro ao eliminar utente:', error);
    res.status(500).json({ error: 'Erro ao eliminar utente' });
  }
}

async function editarUtente(req, res) {
  try {
    const { id } = req.params;
    const dados = req.body;

    const utenteAtualizado = await editarUtenteUseCase.execute(
      id,
      dados,
      req.usuario ? req.usuario.id : null
    );

    res.status(200).json(utenteAtualizado);
  } catch (error) {
    console.error('Erro ao editar utente:', error);
    res.status(400).json({ error: error.message });
  }
}

// === LISTAR CONSULTAS DO UTENTE ===
async function listarConsultasDoUtente(req, res) {
  try {
    const { id } = req.params; // ID do utente passado na URL

    // Verifica se o utente existe
    const utente = await utenteRepository.findById(id);
    if (!utente) {
      return res.status(404).json({ error: 'Utente não encontrado' });
    }

    const consultas = await utenteRepository.findConsultasByUtenteId(id);
    res.json({
      utente: { id: utente.id, nome: utente.nome, contacto: utente.contacto },
      totalConsultas: consultas.length,
      consultas,
    });
  } catch (error) {
    console.error('Erro ao listar consultas do utente:', error);
    res.status(500).json({ error: 'Erro ao listar consultas do utente' });
  }
}



module.exports = { criarUtente, loginUtente, listarUtentes,listarPerfil, eliminarUtente, editarUtente, listarConsultasDoUtente };

