import express from "express"
import EmpresarioController from "../controllers/EmpresarioController.js"

const routes = express.Router()

routes.post("/empresario", EmpresarioController.cadastrarEmpresario)

export default routes