import mongoose, { version } from "mongoose";


const PagamentoSchema = new mongoose.Schema({
    beneficiario: { 
      type: mongoose.Schema.Types.ObjectId, 
      refPath: 'tipoBeneficiario', 
      required: true 
    },
    tipoBeneficiario: { 
      type: String, 
      enum: ['Empresario', 'Usuario'], 
      required: true 
    },
    valorPago: { type: Number, required: true },
    dataPagamento: { type: Date, default: Date.now },
    status: { type: String, enum: ['pendente', 'concluído'], default: 'pendente' },
  });
  
  module.exports = mongoose.model('Pagamento', PagamentoSchema);
  