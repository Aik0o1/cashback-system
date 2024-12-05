import express from "express";
import TransacaoController from "../controllers/TransacaoController.js"; 
import authMiddleware from '../middlewares/authMiddleware.js';

const routes = express.Router();

// Rota para criar uma nova transação (CREATE) - Autenticada
routes.post('/transacoes', authMiddleware, TransacaoController.criarTransacao);

// Rota para listar todas as transações (READ - GET ALL) - Autenticada
routes.get("/transacoes", authMiddleware, TransacaoController.listarTransacoes);

// Rota para listar as transações de um empresário por ID (READ - GET BY EMPRESARIO ID) - Autenticada
routes.get("/transacoes/empresario/:empresarioId", authMiddleware, TransacaoController.listarTransacoesPorEmpresario);

// Rota para listar as transações de um usuário por ID (READ - GET BY USUARIO ID) - Autenticada
routes.get("/transacoes/usuario/:usuarioId", authMiddleware, TransacaoController.listarTransacoesPendentesPorUsuario);

// Rota para deletar uma transação por ID (DELETE) - Autenticada
routes.delete("/transacoes/deletar/:transacaoId", authMiddleware, TransacaoController.deletarTransacao);

routes.post('/transacoes/bulk', authMiddleware, TransacaoController.atualizarTransacoesParaPago)

routes.get("/transacoes/usuario/pedidos/:usuarioId", authMiddleware, TransacaoController.listarTransacoesConcluidasPorUsuario);

routes.get("/transacoes/verificar/:produtoId", authMiddleware, TransacaoController.verificarTransacoesProduto);

// Rota para exportar transações como CSV (EXPORT) - Autenticada
routes.get("/transacoes/export/csv", authMiddleware, TransacaoController.exportToCsv);

export default routes;