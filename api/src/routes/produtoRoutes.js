import express from "express";
import ProdutoController from "../controllers/ProdutoController.js"
import multer from 'multer';
import authMiddleware from '../middlewares/authMiddleware.js';

const upload = multer({ dest: 'uploads/' }); // Diretório temporário para os uploads
const routes = express.Router();

// Rota para cadastrar um novo produto (CREATE)
routes.post('/produtos', authMiddleware, upload.single('imagem'), ProdutoController.cadastrarProduto);// Rota para listar todos os produtos (READ - GET ALL)
routes.get("/produtos", ProdutoController.listarProdutos);

// Rota para listar um único produto por ID (READ - GET ONE)
routes.get("/produtos/:id", ProdutoController.listarProdutoPorId);

// Rota para atualizar um produto por ID (UPDATE)
routes.put("/produtos/:id", ProdutoController.atualizarProduto);

// Rota para deletar um produto por ID (DELETE)
routes.delete("/produtos/:id", ProdutoController.deletarProduto);

export default routes;
