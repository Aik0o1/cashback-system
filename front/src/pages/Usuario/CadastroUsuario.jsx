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

// Validação com Zod para o cadastro de usuário
const formSchema = z.object({
  username: z
    .string()
    .min(2, { message: "O username deve ter pelo menos 2 caracteres." }),
  firstName: z
    .string()
    .min(2, { message: "O primeiro nome deve ter pelo menos 2 caracteres." }),
  lastName: z
    .string()
    .min(2, { message: "O sobrenome deve ter pelo menos 2 caracteres." }),
  cidade: z.string().min(2, { message: "O nome da cidade é obrigatório." }),
  email: z.string().email({ message: "Insira um e-mail válido." }),
  password: z
    .string()
    .min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
});

export default function CadastroUsuario() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [userError, setUserError] = useState("");
  const [emailError, setEmailError] = useState("");

  // Hook form setup
  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5050/users", data);

      // Armazena o token no localStorage
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", user.username);

      alert("Usuário cadastrado com sucesso!");

      // Redireciona para a página principal da loja
      navigate("/loja");
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error.response?.data);

      if (error.response?.data?.message.includes("E11000 duplicate key error collection: test.users index: username_1")){
        setUserError("Username já cadastrado.");
      } else if (error.response?.data?.message.includes("E11000 duplicate key error collection: test.users index: email_1")){
        setEmailError("Email já cadastrado.")
      }
      else {
        alert("Erro ao cadastrar usuário");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen fundo-login flex items-center justify-center">
      <div className="w-full max-w-xl mx-auto p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Cadastro de Usuário
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Username
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Username"
                      {...field}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  {userError && (
                    <p className="text-red-500 text-sm mt-1">{userError}</p>
                  )}
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />

            {/* Primeiro Nome */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Primeiro Nome
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Primeiro Nome"
                      {...field}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />

            {/* Sobrenome */}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Sobrenome
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Sobrenome"
                      {...field}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />

            {/* Cidade */}
            <FormField
              control={form.control}
              name="cidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Cidade
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Cidade"
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
                    <p className="text-sm text-red-500 mt-1">{emailError}</p>
                  )}
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />

            {/* Senha */}
            <FormField
              control={form.control}
              name="password"
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

            {/* Botão de Enviar */}
            <Button
              type="submit"
              className={`w-full py-3 text-white rounded-md ${
                loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
              }`}
              disabled={loading}
            >
              {loading ? "Cadastrando..." : "Cadastrar Usuário"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
