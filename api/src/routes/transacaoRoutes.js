import express from "express";
import TransacaoController from "../controllers/TransaçãoController.js"; 
import authMiddleware from '../middlewares/authMiddleware.js';

const routes = express.Router();

// Rota para criar uma nova transação (CREATE) - Autenticada
routes.post('/transacoes', authMiddleware, TransacaoController.criarTransacao);

// Rota para listar todas as transações (READ - GET ALL) - Autenticada
routes.get("/transacoes", authMiddleware, TransacaoController.listarTransacoes);

// Rota para listar as transações de um empresário por ID (READ - GET BY EMPRESARIO ID) - Autenticada
routes.get("/transacoes/empresario/:empresarioId", authMiddleware, TransacaoController.listarTransacoesPorEmpresario);

// Rota para listar as transações de um usuário por ID (READ - GET BY USUARIO ID) - Autenticada
routes.get("/transacoes/usuario/:usuarioId", authMiddleware, TransacaoController.listarTransacoesPorUsuario);

// Rota para deletar uma transação por ID (DELETE) - Autenticada
routes.delete("/transacoes/atualizar", authMiddleware, TransacaoController.atualizarStatusTransacao);

export default routes;