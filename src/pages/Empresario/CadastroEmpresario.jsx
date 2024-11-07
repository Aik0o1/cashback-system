import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Validação com Zod
const formSchema = z.object({
  nome: z
    .string()
    .min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  loja: z
    .string()
    .min(2, { message: "O nome da loja deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Insira um e-mail válido." }),
  senha: z
    .string()
    .min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
  cnpj: z.string().min(14, { message: "O CNPJ deve ter 14 caracteres." }),
  cashback: z
    .string()
    .min(0, { message: "O valor do cashback é obrigatório." }),
  validadeCashback: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Data de validade inválida.",
  }),
});

export default function CadastroEmpresario() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [emailError, setEmailError] = useState("");
  const [cnpjError, setCnpjError] = useState("");

  // Hook form setup
  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
  
    try {
      const response = await axios.post(
        "https://cashback-testes.onrender.com/empresario",
        {
          ...data,
          cashback: parseFloat(data.cashback), // Converte o valor de cashback para número
        }
      );
  
      const { token } = response.data;
      
      // Salva o token no localStorage
      localStorage.setItem('token', token);
  
      alert("Empresário cadastrado com sucesso!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao cadastrar empresário:", error.response?.data);
  
      if (error.response?.data?.message === "Email já cadastrado") {
        setEmailError("Email já cadastrado.");
      } else if (
        error.response?.data?.message.includes(
          "E11000 duplicate key error collection"
        )
      ) {
        setCnpjError("Cnpj já cadastrado.");
      } else {
        alert("Erro ao cadastrar empresário.");
      }
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen fundo-login">
    {/* Cabeçalho */}
    <header className="bg-zinc-900 p-6">
      <a
        className="bg-lime-600 text-white py-3 px-6 rounded-lg text-lg font-bold shadow-lg hover:bg-lime-700 transition-colors"
        href="/"
      >
        Uespi CashBack
      </a>
      <span className="text-white font-bold text-2xl"> </span>
    </header>

    <div className="min-h-screen fundo-login flex items-center justify-center pt-10">
    <div className="w-full max-w-xl mx-auto p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Cadastro de Empresário
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome */}
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Nome do Empresário
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome do Empresário"
                      {...field}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />

            {/* Loja */}
            <FormField
              control={form.control}
              name="loja"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Nome da Loja
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome da Loja"
                      {...field}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Email"
                      {...field}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  {emailError && (
                    <p className="text-red-500 text-sm mt-1">{emailError}</p>
                  )}
                  <FormMessage className="text-red-500 text-sm mt-1"/>
                </FormItem>
              )}
            />

            {/* Senha */}
            <FormField
              control={form.control}
              name="senha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Senha
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Senha"
                      {...field}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />

            {/* CNPJ */}
            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    CNPJ
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="CNPJ"
                      {...field}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  {cnpjError && (
                    <p className="text-sm text-red-500 mt-1">{cnpjError}</p>
                  )}
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />

            {/* Cashback */}
            <FormField
              control={form.control}
              name="cashback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Cashback (%)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Cashback"
                      {...field}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />

            {/* Validade do Cashback */}
            <FormField
              control={form.control}
              name="validadeCashback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Validade do Cashback
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      placeholder="Validade do Cashback"
                      {...field}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />

            {/* Botão de Enviar */}
            <Button
              type="submit"
              className={`w-full py-3 text-white rounded-md ${
                loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
              }`}
              disabled={loading}
            >
              {loading ? "Cadastrando..." : "Cadastrar Empresário"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  </div>
  );
}
