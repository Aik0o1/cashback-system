import mongoose from "mongoose";

const TransacaoSchema = new mongoose.Schema({
  produto: { type: mongoose.Schema.Types.ObjectId, ref: 'Produto' }, // Note o 'P' maiúsculo
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }, // Note o 'U' maiúsculo
  empresario: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresario' }, // Note o 'E' maiúsculo
  valorCompra: { type: Number, required: true },
  valorCashback: { type: Number, required: true },
  dataCompra: { type: Date, default: Date.now },
  status: { type: String, enum: ['pendente', 'concluída'], default: 'pendente' },
});

const Transacao = mongoose.model('Transacao', TransacaoSchema);
export default Transacao;
