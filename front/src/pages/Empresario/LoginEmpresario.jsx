import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import cashbackimg from "../../assets/cashbackImagem.jpg";

export default function EmpresarioLogin() {
  const [emailCnpj, setEmailCnpj] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const response = await fetch("http://localhost:5050/empresario/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emailCnpj, senha }),
    });
  
    // const data = await response.json();
  
    if (response.ok) {
      const data = await response.json();
    localStorage.setItem('token', data.token); // Armazena o token no localStorage
      navigate("/dashboard");
    } else {
      const data = await response.json();
      setError(data.message); // Define a mensagem de erro
    }
  };

  return (
    <div className="overflow-hidden fundo-login w-full h-screen">
      <header className="bg-lime-950 p-6">
        <span className="text-white font-bold text-xl">Uespi CashBack</span>
      </header>

      <main className="flex items-center justify-around h-screen">
        <img
          className="w-2/5 left-5 relative rounded-lg"
          src={cashbackimg}
          alt="Cashback"
        />

        <div className="bg-white p-12 w-2/5 relative right-4 shadow-md rounded-lg ">
          <h2 className="text-2xl font-bold mb-6 text-center">Login Empresarial</h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="emailCnpj"
                className="block text-sm font-medium text-gray-700"
              >
                Email ou CNPJ
              </label>
              <input
                type="text"
                id="emailCnpj"
                name="emailCnpj"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-600 focus:border-lime-600 sm:text-sm"
                placeholder="Digite seu email ou CNPJ"
                value={emailCnpj}
                onChange={(e) => setEmailCnpj(e.target.value)}
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
