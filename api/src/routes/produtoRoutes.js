import express from "express"
import ProdutoController from "../controllers/ProdutoController"

const routes = express.Router()

routes.post("/produtos", ProdutoController.cadastrarProduto)

export default routes
