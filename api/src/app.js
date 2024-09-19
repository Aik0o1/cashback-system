import express from 'express'
import connectDatabase from './config/dbConnect.js'
import routes from './routes/index.js'
import cors from 'cors'

const conexao = await connectDatabase()

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

app.get('/pontos/:id', (req, res) => {
    const index = buscaPonto(req.params.id)
    res.status(200).json(pontos[index]) 
})

export default app
