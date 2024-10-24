import mongoose from "mongoose";

const ProdutoSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    preco: { type: Number, required: true },
    categoria: { type: String, required: true },
    imagemUrl: { type: String, required: true },  // Campo para armazenar a URL da imagem
    empresario: { type: mongoose.Schema.Types.ObjectId, ref: 'empresario' },  
    dataCadastro: { type: Date, default: Date.now },
});

const Produto = mongoose.model("produtos", ProdutoSchema);
export default Produto;

// cashback: { type: Number, required: true },  // Cashback adicionado se for aplicável
    // validadeCashback: { type: Date },  // Campo para validade do cashback