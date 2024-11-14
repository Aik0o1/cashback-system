import express from "express"
import userRoutes from "./usersRoutes.js"
import empresarioRoutes from "./empresarioRoutes.js"
import produtoRoutes from "./produtoRoutes.js"
import trasacaoRoutes from "./transacaoRoutes.js"

import cors from "cors"
const routes = (app) => {
    app.route("/").get((req,res) => res.status(200).send("Olá mundo"))
    // app.use(cors({ origin: 'http://localhost:5173' }))
    app.use(cors()),
    app.use(express.json(), userRoutes)
    app.use(express.json(), empresarioRoutes)
    app.use(express.json(), produtoRoutes)
    app.use(express.json(), trasacaoRoutes)
}

export default routes

