import express from "express"
import UserController from "../controllers/userController.js"

const routes = express.Router()

routes.post("/users", UserController.cadastrarUser)
routes.post("/users/login", UserController.login)
export default routes
