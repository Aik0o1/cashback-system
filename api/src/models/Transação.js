import mongoose, { version } from "mongoose";


const TransacaoSchema = new mongoose.Schema({
    produto: { type: mongoose.Schema.Types.ObjectId, ref: 'Produto', required: true },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    empresario: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresario', required: true },
    valorCompra: { type: Number, required: true },
    valorCashback: { type: Number, required: true },
    dataCompra: { type: Date, default: Date.now },
    status: { type: String, enum: ['pendente', 'concluída'], default: 'pendente' },
  });
  
  module.exports = mongoose.model('Transacao', TransacaoSchema);
  