import express from "express";
import ProdutoController from "../controllers/ProdutoController.js";
import multer from 'multer';
import authMiddleware from '../middlewares/authMiddleware.js';

const upload = multer({ dest: 'uploads/' }); // Diretório temporário para os uploads
const routes = express.Router();

// Rota para cadastrar um novo produto (CREATE) - Autenticada
routes.post('/produtos', authMiddleware, upload.single('imagem'), ProdutoController.cadastrarProduto);

// Rota para listar todos os produtos (READ - GET ALL) - Pública
routes.get("/produtos", ProdutoController.listarProdutos);

// Rota para listar um único produto por ID (READ - GET ONE) - Pública
routes.get("/produtos/:id", ProdutoController.listarProdutoPorId);

// Rota para atualizar um produto por ID (UPDATE) - Autenticada
routes.put("/produtos/:id", authMiddleware, upload.single('imagem'), ProdutoController.atualizarProduto);

// Rota para deletar um produto por ID (DELETE) - Autenticada
routes.delete("/produtos/:id", authMiddleware, ProdutoController.deletarProduto);

routes.get('/produtos/empresario/:empresarioId', ProdutoController.listarProdutosPorEmpresarioId);


export default routes;
