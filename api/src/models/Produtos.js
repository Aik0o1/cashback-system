import mongoose from "mongoose";

const ProdutoSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    preco: { type: Number, required: true },
    categoria: { type: String, required: true },
    imagemUrl: { type: String, required: true },
    empresario: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresario' },  // Note o 'E' maiúsculo
    dataCadastro: { type: Date, default: Date.now },
});

const Produto = mongoose.model('Produto', ProdutoSchema); // Note o 'P' maiúsculo
export default Produto;