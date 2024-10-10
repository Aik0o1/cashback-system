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
  username: z.string().min(2, { message: "O username deve ter pelo menos 2 caracteres." }),
  firstName: z.string().min(2, { message: "O primeiro nome deve ter pelo menos 2 caracteres." }),
  lastName: z.string().min(2, { message: "O sobrenome deve ter pelo menos 2 caracteres." }),
  cidade: z.string().min(2, { message: "O nome da cidade é obrigatório." }),
  email: z.string().email({ message: "Insira um e-mail válido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
});

export default function CadastroUsuario() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Hook form setup
  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await axios.post("https://cashback-system-1.onrender.com/users", data);

      // Armazena o token no localStorage
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", user.username);

      alert("Usuário cadastrado com sucesso!");

      // Redireciona para a página principal da loja
      navigate("/loja");
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error.response?.data);
      alert("Erro ao cadastrar usuário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Username */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Primeiro Nome */}
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primeiro Nome</FormLabel>
              <FormControl>
                <Input placeholder="Primeiro Nome" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sobrenome */}
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sobrenome</FormLabel>
              <FormControl>
                <Input placeholder="Sobrenome" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cidade */}
        <FormField
          control={form.control}
          name="cidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cidade</FormLabel>
              <FormControl>
                <Input placeholder="Cidade" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Senha */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Senha" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botão de Enviar */}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar Usuário"}
        </Button>
      </form>
    </Form>
  );
}
