import express from "express"
import UserController from "../controllers/userController.js"

const routes = express.Router()

routes.get("/users", UserController.listarUsuarios)
routes.post("/users", UserController.cadastrarUser)
routes.post("/users/login", UserController.login)
routes.post("/users/validate", UserController.validateField)
routes.get('/users/:id', UserController.listarUsuarioPorId)
routes.put('/users/atualizar/:id', UserController.atualizarUsuario)
routes.delete("/users/:id", UserController.deletarUsuario)

routes.get('/users/admin/saldo/:id', UserController.getSaldoAdmin)
routes.put('/users/admin/saldo/:id', UserController.atualizarSaldoAdmin)

export default routes