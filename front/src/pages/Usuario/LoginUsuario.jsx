import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import cashbackimg from "../../assets/cashbackImagem.jpg";
import { User, Building2, Mail, Lock, ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function LoginUsuario() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("https://cashback-testes.onrender.com/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha }),
    });
    console.log(response)

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token); // Armazena o token no localStorage
      localStorage.setItem('user', data.usuario.username); // Armazena o nome do usuário no localStorage
      localStorage.setItem('userId', data.usuario._id); // Armazena o nome do usuário no localStorage
      
      navigate("/"); // Redireciona para o dashboard do usuário
    } else {
      const data = await response.json();
      setError(data.message); // Define a mensagem de erro
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center">
          <a href="/" className="flex items-center space-x-2">
            <ChevronLeft className="h-5 w-5 text-lime-600" />
            <span className="bg-gradient-to-r from-lime-500 to-lime-600 bg-clip-text text-transparent text-xl font-bold">
              Uespi CashBack
            </span>
          </a>
          <span className="ml-4 text-zinc-600 font-medium">Login de Usuário</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Side - Image */}
        <div className="lg:w-1/2">
          <div className="relative">
            <img
              className="rounded-2xl shadow-2xl"
              src={cashbackimg}
              alt="Cashback"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl flex items-end">
              <div className="p-8 text-white">
                <h1 className="text-3xl font-bold mb-2">Área do Usuário</h1>
                <p className="text-zinc-200">
                  Acesse sua conta para ver suas compras e cashbacks.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="lg:w-1/3 p-8 bg-white/50 backdrop-blur border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-bold text-zinc-800">
                Login de Usuário
              </h2>
              <p className="text-zinc-600">
                Entre com suas credenciais para continuar
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 w-full h-12 bg-white border border-zinc-200 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                    placeholder="Digite seu email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="pl-10 w-full h-12 bg-white border border-zinc-200 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                    placeholder="Digite sua senha"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white h-12"
            >
              Entrar
            </Button>

            <div className="text-center text-zinc-600">
              <span>Ainda não tem conta? </span>
              <a
                href="/cadastroUsuario"
                className="text-lime-600 font-semibold hover:text-lime-700"
              >
                Cadastre-se
              </a>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}