import mongoose from "mongoose";

const EmpresarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  loja: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  cnpj: { type: String, required: true, unique: true },
  dataCadastro: { type: Date, default: Date.now },
  cashback: { type: String, required: true },
  validadeCashback: { type: Date, required: true },
  saldo: {type: Number, required: true, default:0},
  produtos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'produtos' }]  // Array de produtos relacionados
});

const Empresario = mongoose.model("Empresario", EmpresarioSchema);  // Ajustado o nome do modelo
export default Empresario;
