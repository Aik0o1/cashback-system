import express from "express"
import userRoutes from "./usersRoutes.js"
import empresarioRoutes from "./empresarioRoutes.js"
import produtoRoutes from "./produtoRoutes.js"

import cors from "cors"
const routes = (app) => {
    app.route("/").get((req,res) => res.status(200).send("Olá mundo"))
    // app.use(cors({ origin: 'http://localhost:5173' }))
    app.use(cors({ origin: 'https://cashback-testes-oda9keomm-aik0o1s-projects.vercel.app/' }))
    app.use(express.json(), userRoutes)
    app.use(express.json(), empresarioRoutes)
    app.use(express.json(), produtoRoutes)
}

export default routes

