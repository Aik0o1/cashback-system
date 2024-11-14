import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Building2, ChevronLeft } from "lucide-react";
import cashbackimg from "../assets/cashbackImagem.jpg";

export default function Cadastro() {
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
          <span className="ml-4 text-zinc-600 font-medium">Cadastro</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Side - Image and Text */}
        <div className="lg:w-1/2 space-y-6">
          <div className="relative">
            <img
              className="rounded-2xl shadow-2xl"
              src={cashbackimg}
              alt="Cashback"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl flex items-end">
              <div className="p-8 text-white">
                <h1 className="text-3xl font-bold mb-2">Comece sua jornada!</h1>
                <p className="text-zinc-200">
                  Cadastre-se agora e aproveite os melhores cashbacks da região.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Cadastro Options */}
        <Card className="lg:w-1/3 p-8 bg-white/50 backdrop-blur border border-white/20">
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-2xl font-bold text-zinc-800">Cadastrar como</h2>
            <p className="text-zinc-600">
              Escolha seu tipo de conta para começar
            </p>
          </div>

          <div className="space-y-4">
            <a href="/cadastroUsuario" className="block">
              <Button
                className="w-full bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white h-14 text-lg flex items-center justify-center gap-3"
              >
                <User className="h-5 w-5" />
                Cadastrar como Usuário
              </Button>
            </a>

            <a href="/cadastroEmpresario" className="block">
              <Button
                variant="outline"
                className="w-full border-2 border-lime-600 text-lime-600 hover:bg-lime-50 h-14 text-lg flex items-center justify-center gap-3"
              >
                <Building2 className="h-5 w-5" />
                Cadastrar como Empresário
              </Button>
            </a>
          </div>
        </Card>
      </main>
    </div>
  );
}