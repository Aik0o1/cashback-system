import React from "react";
import cashbackimg from "../assets/cashbackImagem.jpg";

export default function Cadastro() {
  return (
    <div className="overflow-hidden fundo-login w-full h-screen">
      {/* Cabeçalho */}
      <header className="bg-lime-950 p-6">
        <span className="text-white font-bold text-2xl">Uespi CashBack - Usuário</span>
      </header>

      {/* Corpo Principal */}
      <main className="flex items-center justify-around h-screen p-4">
        {/* Imagem do Cashback */}
        <img
          className="w-2/5 relative rounded-lg shadow-xl"
          src={cashbackimg}
          alt="Cashback"
        />

        {/* Caixa de Login */}
        <div className="bg-white p-12 w-1/3 shadow-lg rounded-lg flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Cadastrar como
          </h2>

          {/* Botões de Escolha */}
          <div className="flex gap-10">
            <a
              className="bg-lime-600 text-white py-3 px-6 rounded-full text-lg font-semibold shadow-lg hover:bg-lime-700 transition-colors"
              href="/cadastroUsuario"
            >
              Usuário
            </a>
            <a
              className="bg-lime-600 text-white py-3 px-6 rounded-full text-lg font-semibold shadow-lg hover:bg-lime-700 transition-colors"
              href="/cadastroEmpresario"
            >
              Empresário
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
