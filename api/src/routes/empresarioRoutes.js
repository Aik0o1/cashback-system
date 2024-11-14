import express from "express";
import EmpresarioController from "../controllers/EmpresarioController.js";

const routes = express.Router();

routes.get("/empresario", EmpresarioController.listarEmpresarios);

// Rota para login de empresário
routes.post("/empresario/login", EmpresarioController.login);

// Outras rotas (cadastrarEmpresario, etc.)
routes.post("/empresario", EmpresarioController.cadastrarEmpresario);
routes.get('/empresario/:id', EmpresarioController.listarEmpresarioPorId);

routes.put('/empresarios/atualizar/:id', EmpresarioController.atualizarEmpresario);

export default routes;
