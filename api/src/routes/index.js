import express from "express"
import userRoutes from "./usersRoutes.js"
import cors from "cors"
const routes = (app) => {
    app.route("/").get((req,res) => res.status(200).send("Olá mundo"))
    app.use(cors({ origin: 'http://localhost:5173' }))
    app.use(express.json(), userRoutes)
}

export default routes

