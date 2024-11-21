import Produto from "../models/Produtos.js";
import Usuario from "../models/Users.js";
import Empresario from "../models/Empresario.js";
import Transacao from "../models/Transacao.js";
import { Parser } from "json2csv";
import fs from "fs";
import path from "path";

class TransacaoController {
  // Método para criar uma nova transação
  static async criarTransacao(req, res) {
    try {
      const { produtoId, usuarioId, empresarioId } = req.body;

      const produto = await Produto.findById(produtoId);
      if (!produto)
        return res.status(404).json({ message: "Produto não encontrado" });
      const valorCompra = produto.preco;

      const usuario = await Usuario.findById(usuarioId);
      if (!usuario)
        return res.status(404).json({ message: "Usuário não encontrado" });

      const empresario = await Empresario.findById(empresarioId);
      if (!empresario)
        return res.status(404).json({ message: "Empresário não encontrado" });

      const taxaCashback = parseFloat(empresario.cashback) || 0;
      const valorCashback = valorCompra * (taxaCashback / 100);

      const novaTransacao = await Transacao.create({
        produto: produtoId,
        usuario: usuarioId,
        empresario: empresarioId,
        valorCompra,
        valorCashback,
        status: "pendente",
      });

      res.status(201).json({
        message: "Transação criada com sucesso",
        transacao: novaTransacao,
      });
    } catch (erro) {
      res
        .status(500)
        .json({ message: "${erro.message} - Falha ao criar transação" });
    }
  }

  // Método para listar todas as transações
  static async listarTransacoes(req, res) {
    try {
      const transacoes = await Transacao.find()
        .populate("produto", "nome")
        .populate("usuario", "nome")
        .populate("empresario", "nome")
        .sort({ dataCompra: -1 });

      // if (!transacoes || transacoes.length === 0) {
      //   return res.status(404).json({ message: "Nenhuma transação encontrada" });
      // }

      res.status(200).json(transacoes);
    } catch (erro) {
      res
        .status(500)
        .json({ message: `${erro.message} - Falha ao listar transações` });
    }
  }

  // Método para listar transações por usuário
  static async listarTransacoesPendentesPorUsuario(req, res) {
    try {
      const { usuarioId } = req.params;

      // Filtra as transações do usuário com status "pendente"
      const transacoes = await Transacao.find({
        usuario: usuarioId,
        status: "pendente",
      })
        .populate("produto", "nome preco imagemUrl")
        .populate("empresario", "nome cashback")
        .sort({ dataCompra: -1 });

      res.status(200).json(transacoes);
    } catch (erro) {
      res.status(500).json({
        message: `${erro.message} - Falha ao listar transações do usuário`,
      });
    }
  }

  static async listarTransacoesConcluidasPorUsuario(req, res) {
    try {
      const { usuarioId } = req.params;

      // Filtra as transações do usuário com status "pendente"
      const transacoes = await Transacao.find({
        usuario: usuarioId,
        status: "concluída",
      })
        .populate("produto", "nome preco imagemUrl")
        .populate("empresario", "nome cashback")
        .sort({ dataCompra: -1 });

      res.status(200).json(transacoes);
    } catch (erro) {
      res.status(500).json({
        message: `${erro.message} - Falha ao listar transações do usuário`,
      });
    }
  }

  // Método para listar transações por empresário
  static async listarTransacoesPorEmpresario(req, res) {
    try {
      const empresarioId = req.empresarioId;

      const transacoes = await Transacao.find({ empresario: empresarioId })
        .populate("usuario", "nome")
        .populate("empresario", "nome")
        .populate("produto", "nome preco imagemUrl")
        .sort({ dataCompra: -1 });

      // Map transactions to handle deleted products
      const transacoesProcessadas = transacoes.map((transacao) => ({
        ...transacao._doc,
        produto: transacao.produto || {
          nome: "Produto Removido",
          preco: transacao.valorCompra,
          imagemUrl: null,
        },
      }));

      res.status(200).json(transacoesProcessadas);
    } catch (erro) {
      res.status(500).json({
        message: `${erro.message} - Falha ao listar transações do empresário`,
      });
    }
  }

  // Método para atualizar o status de uma transação
  static async atualizarStatusTransacao(req, res) {
    try {
      const { transacaoId } = req.params;
      const { status } = req.body;

      // Verifica se a transação existe e pertence ao empresário autenticado
      const transacao = await Transacao.findOne({
        _id: transacaoId,
        empresario: req.empresarioId,
      });
      if (!transacao) {
        return res.status(404).json({
          message:
            "Transação não encontrada ou você não tem permissão para atualizá-la",
        });
      }

      // Atualiza o status da transação
      transacao.status = status;
      await transacao.save();

      res.status(200).json({
        message: "Status da transação atualizado com sucesso",
        transacao,
      });
    } catch (erro) {
      res.status(500).json({
        message: `${erro.message} - Falha ao atualizar status da transação`,
      });
    }
  }
  // Método para deletar uma transação por ID
  static async deletarTransacao(req, res) {
    try {
      const { transacaoId } = req.params;

      // Verifica se a transação existe
      const transacao = await Transacao.findById(transacaoId);
      if (!transacao) {
        return res.status(404).json({ message: "Transação não encontrada" });
      }

      // Deleta a transação
      await Transacao.deleteOne({ _id: transacaoId });

      res.status(200).json({ message: "Transação deletada com sucesso" });
    } catch (erro) {
      res
        .status(500)
        .json({ message: `${erro.message} - Falha ao deletar transação` });
    }
  }

  // Método para criar múltiplas transações em lote
  static async atualizarTransacoesParaPago(req, res) {
    try {
      const { usuarioId, items } = req.body;
      const usuario = await Usuario.findById(usuarioId);

      if (!usuario)
        return res.status(404).json({ message: "Usuário não encontrado" });

      const transacoesAtualizadas = [];

      for (const item of items) {
        const { produtoId, empresarioId } = item;

        const transacao = await Transacao.findOne({
          produto: produtoId,
          usuario: usuarioId,
          empresario: empresarioId,
          status: "pendente", // Garante que apenas transações pendentes sejam atualizadas
        });

        if (!transacao) {
          return res.status(404).json({
            message: `Transação pendente para o produto ${produtoId} não encontrada`,
          });
        }

        // Atualiza o status para "concluída"
        transacao.status = "concluída";
        await transacao.save();

        transacoesAtualizadas.push(transacao);
      }

      res.status(200).json({
        message: "Transações atualizadas para pagas com sucesso",
        transacoes: transacoesAtualizadas,
      });
    } catch (erro) {
      res.status(500).json({
        message: `${erro.message} - Falha ao atualizar transações para pagas`,
      });
    }
  }

  static async verificarTransacoesProduto(req, res) {
    try {
      const { produtoId } = req.params;
      const transacoes = await Transacao.find({ produto: produtoId });

      return res.status(200).json({
        temTransacoes: transacoes.length > 0,
        count: transacoes.length,
      });
    } catch (erro) {
      res
        .status(500)
        .json({ message: `${erro.message} - Falha ao verificar transações` });
    }
  }

  static async exportToCsv(req, res) {
    try {
      const { status, empresarioId } = req.query;

      // Filtra as transações com base nos parâmetros de consulta
      const filtro = {};
      if (status) filtro.status = status;
      if (empresarioId) filtro.empresario = empresarioId;

      const transacoes = await Transacao.find(filtro)
        .populate("produto", "nome preco")
        .populate("usuario", "nome email")
        .populate("empresario", "nome cashback");

      if (!transacoes || transacoes.length === 0) {
        return res
          .status(404)
          .json({ message: "Nenhuma transação encontrada para exportação." });
      }

      // Dados para o CSV
      const campos = [
        { label: "ID da Transação", value: "_id" },
        { label: "Nome do Produto", value: "produto.nome" },
        { label: "Preço do Produto", value: "produto.preco" },
        { label: "Nome do Cliente", value: "usuario.nome" },
        { label: "Nome do Empresário", value: "empresario.nome" },
        { label: "Taxa de Cashback (%)", value: "empresario.cashback" },
        { label: "Valor da Compra", value: "valorCompra" },
        { label: "Valor do Cashback", value: "valorCashback" },
        { label: "Status", value: "status" },
        { label: "Data da Compra", value: "dataCompra" },
      ];

      const parser = new Parser({ fields: campos });
      const csv = parser.parse(transacoes);

      // Caminho para salvar temporariamente o arquivo CSV
      const filePath = path.resolve("exports", `transacoes-${Date.now()}.csv`);
      fs.writeFileSync(filePath, csv);

      // Envia o arquivo para o cliente
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=transacoes.csv`
      );
      res.download(filePath, (err) => {
        if (err) {
          throw new Error("Erro ao enviar o arquivo CSV.");
        }
        // Remove o arquivo após o envio
        fs.unlinkSync(filePath);
      });
    } catch (erro) {
      res.status(500).json({
        message: `${erro.message} - Falha ao exportar transações para CSV.`,
      });
    }
  }
}

export default TransacaoController;
