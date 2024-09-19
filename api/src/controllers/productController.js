import product from "../models/Products.js";

class ProductController {
  static async cadastrarProduct(req, res) {
    try {
      const { nome, descricao, preco, ...rest } = req.body;
      const novoProduto = await product.create({ ...rest, nome, descricao, preco });
      res.status(201).json({ message: "Cadastrado com sucesso", product: novoProduto });
    } catch (erro) {
      res.status(500).json({ message: `${erro.message} - falha ao cadastrar produto` });
    }
  }

}

export default ProductController;
