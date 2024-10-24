import Produto from "../models/Produtos.js";
import Empresario from "../models/Empresario.js";
import { cloudinary } from "../config/cloudinary.js"; // Importa a configuração do Cloudinary

class ProdutoController {
  // Método para cadastrar um novo produto (CREATE)
  static async cadastrarProduto(req, res) {
    try {
      const { nome, descricao, preco, categoria } = req.body;
      const empresarioId = req.empresarioId; // Obtém o ID do empresário autenticado do middleware

      // Verifica se o empresário existe
      const empresario = await Empresario.findById(empresarioId);
      if (!empresario) {
        return res.status(404).json({ message: "Empresário não encontrado" });
      }

      let imagemUrl = null;
      if (!req.file) {
        return res.status(400).json({ message: "Imagem é obrigatória" });
      }
      if (req.file) {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "produtos",
        });
        imagemUrl = uploadResult.secure_url;
      }

      const novoProduto = await Produto.create({
        nome,
        descricao,
        preco,
        categoria,
        imagemUrl,
        empresario: empresarioId // Associa o produto ao empresário autenticado
      });

      // Associa o produto criado ao empresário
      empresario.produtos.push(novoProduto._id);
      await empresario.save();

      res.status(201).json({ message: "Produto cadastrado com sucesso", produto: novoProduto });
    } catch (erro) {
      res.status(500).json({ message: `${erro.message} - falha ao cadastrar produto`, stack: erro.stack });
    }
  }

  // Método para listar todos os produtos (READ - GET ALL)
  static async listarProdutos(req, res) {
    try {
      const produtos = await Produto.find().populate("empresario", "nome loja cashback validadeCashback"); // Popula os dados do empresário
      res.status(200).json(produtos);
    } catch (erro) {
      res.status(500).json({ message: `${erro.message} - falha ao listar produtos` });
    }
  }

  // Método para listar um único produto por ID (READ - GET ONE)
  static async listarProdutoPorId(req, res) {
    try {
      const produto = await Produto.findById(req.params.id).populate("empresario", "nome loja cashback validadeCashback");
      if (!produto) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      res.status(200).json(produto);
    } catch (erro) {
      res.status(500).json({ message: `${erro.message} - falha ao buscar produto` });
    }
  }

  // Método para atualizar um produto por ID (UPDATE)
  static async atualizarProduto(req, res) {
    try {
      const { nome, descricao, preco, categoria, cashback, validade } = req.body;
      const empresarioId = req.empresarioId; // Obtém o ID do empresário autenticado do middleware

      let imagemUrl = null;
      if (req.file) {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "produtos",
        });
        imagemUrl = uploadResult.secure_url;
      }

      // Atualiza os campos do produto, incluindo a imagem se ela foi enviada
      const produtoAtualizado = await Produto.findOneAndUpdate(
        { _id: req.params.id, empresario: empresarioId }, // Verifica se o produto pertence ao empresário autenticado
        { nome, descricao, preco, categoria, cashback, validadeCashback: validade, imagemUrl },
        { new: true, omitUndefined: true } // `omitUndefined` ignora os campos não definidos
      );

      if (!produtoAtualizado) {
        return res.status(404).json({ message: "Produto não encontrado ou você não tem permissão para atualizá-lo" });
      }

      res.status(200).json({ message: "Produto atualizado com sucesso", produto: produtoAtualizado });
    } catch (erro) {
      res.status(500).json({ message: `${erro.message} - falha ao atualizar produto` });
    }
  }

  // Método para deletar um produto por ID (DELETE)
  static async deletarProduto(req, res) {
    try {
      const empresarioId = req.empresarioId; // Obtém o ID do empresário autenticado do middleware

      // Busca o produto e verifica se ele pertence ao empresário autenticado
      const produtoDeletado = await Produto.findOneAndDelete({ _id: req.params.id, empresario: empresarioId });

      if (!produtoDeletado) {
        return res.status(404).json({ message: "Produto não encontrado ou você não tem permissão para deletá-lo" });
      }

      // Remove o produto do array de produtos do empresário
      const empresario = await Empresario.findById(empresarioId);
      empresario.produtos.pull(produtoDeletado._id);
      await empresario.save();

      res.status(200).json({ message: "Produto deletado com sucesso" });
    } catch (erro) {
      res.status(500).json({ message: `${erro.message} - falha ao deletar produto` });
    }
  }
}

export default ProdutoController;
