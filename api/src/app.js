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
const corsOptions = {
    origin: ['https://cashback-testes-oda9keomm-aik0o1s-projects.vercel.app/', 'https://cashback-testes.onrender.com'], // Permitir múltiplas origens
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos permitidos
    credentials: true, // Permite enviar cookies e headers de autenticação
    optionsSuccessStatus: 200, // Para navegadores mais antigos
  };
  
  app.use(cors(corsOptions));
  

app.use(cors(corsOptions));

// Definir as rotas
routes(app);

export default app;
