import Produto from "../models/Produto.js"
import Empresario from "../models/Empresario.js"

class ProdutoController {
    static async cadastrarProduto(req, res) {
        try{
            const { empresarioId, nome, preco, cashback, validade } = req.body;

            const empresario = await Empresario.findById(empresarioId);
            if (!empresario) {
                return res.status(404).json({ message: "Empresario não encontrado" });
            }

            const novoProduto = await Produto.create({
                nome,
                preco,
                cashback,
                validade,
                empresario: empresarioId,    
            })

            res.status(201).json({ message: "Produto cadastrado com sucesso", produto: novoProduto });
        } catch (erro) {
            res.status(500).json({ message: `${erro.message} - falha ao cadastrar produto`});
        }
    }
}

export default ProdutoController;