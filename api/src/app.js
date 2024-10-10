import express from 'express'
import connectDatabase from './config/dbConnect.js'
import routes from './routes/index.js'
import cors from 'cors'
import jwt from 'jsonwebtoken'
// const jwt = require('jsonwebtoken');
const conexao = await connectDatabase()




const JWT_SECRET = 'seuSegredo';
conexao.on("error", (erro) => {
    console.error("Erro de conexão", erro)
})
conexao.once("open", () => console.log("Conexão feita com sucesso!"))

const app = express()

// // Middleware para parsear JSON
// app.use(express.json())
// app.use(cors({ origin: 'http://localhost:5173' }))

// Usar as rotas
routes(app)

export default app
