import mongoose from "mongoose";

const ProdutoSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    preco: { type: Number, required: true },
    categoria: { type: String, required: true },
    empresario: { type: mongoose.Schema.Types.ObjectId, ref: 'empresario' },  // Ajustado o nome do modelo
    dataCadastro: { type: Date, default: Date.now },
});

const Produto = mongoose.model("produtos", ProdutoSchema);  // Nome do modelo em singular
export default Produto;
