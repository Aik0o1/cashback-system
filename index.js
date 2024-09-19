import express from "express";
import userRoutes from "./usersRoutes.js";
import cors from "cors";

const routes = (app) => {
    app.route("/").get((req, res) => res.status(200).send("Olá mundo"));
    
    app.use(cors({ origin: 'http://localhost:5173' }));
    app.use(express.json());
    
    app.use(userRoutes);

    // Rota para adicionar cashback
    app.post("/cashback", (req, res) => {
        const { userId, amount } = req.body;
        // Lógica para adicionar cashback
        res.status(201).send(`Cashback de ${amount} adicionado para o usuário ${userId}`);
    });

    // Rota para consultar saldo de cashback
    app.get("/cashback/:userId", (req, res) => {
        const { userId } = req.params;
        // Lógica para buscar saldo de cashback
        const balance = 100; // Exemplo de saldo, você deve substituir pela lógica real
        res.status(200).send(`Saldo de cashback do usuário ${userId}: ${balance}`);
    });
    
    // Rota para listar transações de cashback
    app.get("/cashback/transactions/:userId", (req, res) => {
        const { userId } = req.params;
        // Lógica para listar transações de cashback
        const transactions = []; // Exemplo de transações, substituir pela lógica real
        res.status(200).json(transactions);
    });
}

export default routes;
