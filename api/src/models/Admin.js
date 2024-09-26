import mongoose, { version } from "mongoose";


const AdminSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    dataCadastro: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model('Admin', AdminSchema);
  