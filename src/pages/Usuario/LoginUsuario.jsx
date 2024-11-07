import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import cashbackimg from "../../assets/cashbackImagem.jpg";

export default function LoginUsuario() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("https://cashback-testes.onrender.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token); // Armazena o token no localStorage
      localStorage.setItem('user', data.usuario.username); // Armazena o nome do usuário no localStorage
      navigate("/"); // Redireciona para o dashboard do usuário
    } else {
      const data = await response.json();
      setError(data.message); // Define a mensagem de erro
    }
  };

  return (
    <div className="overflow-hidden fundo-login w-full h-screen">
      <header className="bg-zinc-900 p-6">
        <a
          className="bg-lime-600 text-white py-3 px-6 rounded-lg text-lg font-bold shadow-lg hover:bg-lime-700 transition-colors"
            href="/"
        >
           Uespi CashBack
        </a>
        <span className="text-white font-bold text-2xl">  - Log in</span>
      </header>

      <main className="flex items-center justify-around h-5/6 p-4">
        <img
          className="w-2/5 relative rounded-lg shadow-xl"
          src={cashbackimg}
          alt="Cashback"
        />

        <div className="bg-white p-12 w-2/5 relative right-4 shadow-md rounded-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">Login de Usuário</h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-600 focus:border-lime-600 sm:text-sm"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="senha"
                className="block text-sm font-medium text-gray-700"
              >
                Senha
              </label>
              <input
                type="password"
                id="senha"
                name="senha"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-600 focus:border-lime-600 sm:text-sm"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            {error && <div className="text-red-500">{error}</div>}

            <div className="pt-4">
              <Button
                className="w-full bg-lime-600 text-white py-2 rounded-md hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-600"
                type="submit"
              >
                Entrar
              </Button>
            </div>
          </form>

          <div className="pt-4 text-center">
            <a href="#" className="text-sm text-lime-600 hover:text-lime-700">
              Esqueceu sua senha?
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
