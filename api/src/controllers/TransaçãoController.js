import Transacao from '../models/Transacao.js';  // Importa o modelo de transação
import Produto from '../models/Produto.js';      // Importa o modelo de produto
import Usuario from '../models/Usuario.js';      // Importa o modelo de usuário
import Empresario from '../models/Empresario.js'; // Importa o modelo de empresário

class TransacaoController {
  
  // Método para criar uma nova transação
  static async criarTransacao(req, res) {
    try {
      const { produtoId, usuarioId, empresarioId, valorCompra } = req.body;

      // Verifica se o produto existe
      const produto = await Produto.findById(produtoId);
      if (!produto) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      // Verifica se o usuário existe
      const usuario = await Usuario.findById(usuarioId);
      if (!usuario) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // Verifica se o empresário existe
      const empresario = await Empresario.findById(empresarioId);
      if (!empresario) {
        return res.status(404).json({ message: "Empresário não encontrado" });
      }

      // Calcula o valor do cashback (por exemplo, 5% do valor da compra)
      const valorCashback = valorCompra * 0.05;

      // Cria a nova transação
      const novaTransacao = await Transacao.create({
        produto: produtoId,
        usuario: usuarioId,
        empresario: empresarioId,
        valorCompra,
        valorCashback,
        status: 'pendente',
      });

      res.status(201).json({
        message: "Transação criada com sucesso",
        transacao: novaTransacao,
      });
    } catch (erro) {
      res.status(500).json({ message: `${erro.message} - Falha ao criar transação` });
    }
  }

  // Método para listar todas as transações
  static async listarTransacoes(req, res) {
    try {
      const transacoes = await Transacao.find()
        .populate('produto', 'nome')    // Popula o nome do produto
        .populate('usuario', 'nome')    // Popula o nome do usuário
        .populate('empresario', 'nome') // Popula o nome do empresário
        .sort({ dataCompra: -1 });      // Ordena por data de compra (mais recente primeiro)

      if (!transacoes || transacoes.length === 0) {
        return res.status(404).json({ message: "Nenhuma transação encontrada" });
      }

      res.status(200).json(transacoes);
    } catch (erro) {
      res.status(500).json({ message: `${erro.message} - Falha ao listar transações` });
    }
  }

  // Método para listar transações por usuário
  static async listarTransacoesPorUsuario(req, res) {
    try {
      const { usuarioId } = req.params;

      const transacoes = await Transacao.find({ usuario: usuarioId })
        .populate('produto', 'nome')    // Popula o nome do produto
        .populate('empresario', 'nome') // Popula o nome do empresário
        .sort({ dataCompra: -1 });      // Ordena por data de compra (mais recente primeiro)

      if (!transacoes || transacoes.length === 0) {
        return res.status(404).json({ message: "Nenhuma transação encontrada para este usuário" });
      }

      res.status(200).json(transacoes);
    } catch (erro) {
      res.status(500).json({ message: `${erro.message} - Falha ao listar transações do usuário` });
    }
  }

  // Método para listar transações por empresário
  static async listarTransacoesPorEmpresario(req, res) {
    try {
      const { empresarioId } = req.params;

      const transacoes = await Transacao.find({ empresario: empresarioId })
        .populate('produto', 'nome')    // Popula o nome do produto
        .populate('usuario', 'nome')    // Popula o nome do usuário
        .sort({ dataCompra: -1 });      // Ordena por data de compra (mais recente primeiro)

      if (!transacoes || transacoes.length === 0) {
        return res.status(404).json({ message: "Nenhuma transação encontrada para este empresário" });
      }

      res.status(200).json(transacoes);
    } catch (erro) {
      res.status(500).json({ message: `${erro.message} - Falha ao listar transações do empresário` });
    }
  }

  // Método para atualizar o status de uma transação
  static async atualizarStatusTransacao(req, res) {
    try {
      const { transacaoId } = req.params;
      const { status } = req.body;

      const transacao = await Transacao.findById(transacaoId);
      if (!transacao) {
        return res.status(404).json({ message: "Transação não encontrada" });
      }

      // Atualiza o status
      transacao.status = status;
      await transacao.save();

      res.status(200).json({
        message: "Status da transação atualizado com sucesso",
        transacao,
      });
    } catch (erro) {
      res.status(500).json({ message: `${erro.message} - Falha ao atualizar status da transação` });
    }
  }
}

export default TransacaoController;
