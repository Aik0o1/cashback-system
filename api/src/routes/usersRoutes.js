import express from "express"
import UserController from "../controllers/userController.js"

const routes = express.Router()

routes.post("/users", UserController.cadastrarUser)
routes.post("/users/login", UserController.login)
routes.post("/users/validate", UserController.validateField);
export default routes
