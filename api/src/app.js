import express from 'express';
import connectDatabase from './config/dbConnect.js';
import routes from './routes/index.js';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const conexao = await connectDatabase();

const JWT_SECRET = 'seuSegredo';
conexao.on("error", (erro) => {
    console.error("Erro de conexão", erro);
});
conexao.once("open", () => console.log("Conexão feita com sucesso!"));

const app = express();

// Middleware para parsear JSON
app.use(express.json()); // Importante para garantir que o express parseie requisições JSON corretamente

// Configuração de CORS para permitir o frontend local
// const corsOptions = {
//   origin: [
//       'http://localhost:5173', 
//       'http://localhost:5050', 
//       'https://cashback-testes.vercel.app' // Inclua o link do frontend
//   ],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
//   optionsSuccessStatus: 200,
// };

  
  // app.use(cors(corsOptions));
  

app.use(cors());

// Definir as rotas
routes(app);

export default app;
