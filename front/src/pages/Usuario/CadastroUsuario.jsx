import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
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
import debounce from 'lodash/debounce';

// Schema de validação Zod
const formSchema = z.object({
  username: z
    .string()
    .min(2, { message: "O username deve ter pelo menos 2 caracteres." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username deve conter apenas letras, números e underscore",
    }),
  firstName: z
    .string()
    .min(2, { message: "O primeiro nome deve ter pelo menos 2 caracteres." })
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, {
      message: "Nome deve conter apenas letras",
    }),
  lastName: z
    .string()
    .min(2, { message: "O sobrenome deve ter pelo menos 2 caracteres." })
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, {
      message: "Sobrenome deve conter apenas letras",
    }),
  email: z
    .string()
    .min(1, { message: "E-mail é obrigatório" })
    .email({ message: "Insira um e-mail válido." }),
  password: z
    .string()
    .min(6, { message: "A senha deve ter pelo menos 6 caracteres." })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
      message: "A senha deve conter letra maiúscula, minúscula, número e caractere especial",
    }),
});

// Hook customizado para validação de campos
const useFieldValidation = () => {
  const [fieldErrors, setFieldErrors] = useState({
    username: "",
    email: "",
  });

  const validateField = async (field, value) => {
    if (!value) return;

    try {
      await axios.post(`https://cashback-testes.onrender.com/users/validate`, {
        field,
        value,
      });
      
      setFieldErrors(prev => ({
        ...prev,
        [field]: "",
      }));
      return true;
    } catch (error) {
      const message = error.response?.data?.message || `Este ${field} já está em uso`;
      setFieldErrors(prev => ({
        ...prev,
        [field]: message,
      }));
      return false;
    }
  };

  // Debounce da validação para evitar muitas requisições
  const debouncedValidation = useCallback(
    debounce((field, value) => validateField(field, value), 500),
    []
  );

  return { fieldErrors, validateField: debouncedValidation };
};

export default function CadastroUsuario() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { fieldErrors, validateField } = useFieldValidation();

  // Configuração do formulário
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  // Handler para submissão do formulário
  const onSubmit = async (data) => {
    setLoading(true);

    try {
      // Validar username e email antes do envio final
      const isUsernameValid = await validateField("username", data.username);
      const isEmailValid = await validateField("email", data.email);

      if (!isUsernameValid || !isEmailValid) {
        setLoading(false);
        return;
      }

      const response = await axios.post("https://cashback-testes.onrender.com/users", data);
      
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", user.username);
      localStorage.setItem("userId", user._id);

      navigate("/");
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error.response?.data);
      const errorMessage = error.response?.data?.message || "Erro ao cadastrar usuário";
      alert("Corrija as Informações");
    } finally {
      setLoading(false);
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
          <span className="ml-4 text-zinc-600 font-medium">
            Cadastro de Usuário
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <Card className="max-w-2xl mx-auto p-8 bg-white/50 backdrop-blur border border-white/20">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-zinc-800">
              Criar Nova Conta
            </h2>
            <p className="text-zinc-600">
              Preencha os dados abaixo para se cadastrar
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-700">Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                        <Input
                          {...field}
                          className="pl-10 h-12 bg-white border border-zinc-200"
                          placeholder="Seu username"
                          onBlur={(e) => validateField("username", e.target.value)}
                        />
                      </div>
                    </FormControl>
                    {fieldErrors.username && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.username}</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nome */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-700">Nome</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="h-12 bg-white border border-zinc-200"
                          placeholder="Seu nome"
                        />
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
                      <FormLabel className="text-zinc-700">Sobrenome</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="h-12 bg-white border border-zinc-200"
                          placeholder="Seu sobrenome"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-700">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                        <Input
                          {...field}
                          type="email"
                          className="pl-10 h-12 bg-white border border-zinc-200"
                          placeholder="seu.email@exemplo.com"
                          onBlur={(e) => validateField("email", e.target.value)}
                        />
                      </div>
                    </FormControl>
                    {fieldErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
                    )}
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
                    <FormLabel className="text-zinc-700">Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                        <Input
                          {...field}
                          type="password"
                          className="pl-10 h-12 bg-white border border-zinc-200"
                          placeholder="Sua senha"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Botão de Cadastro */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white h-12"
                disabled={loading}
              >
                {loading ? "Cadastrando..." : "Criar Conta"}
              </Button>

              {/* Link para Login */}
              <div className="text-center text-zinc-600">
                <span>Já tem uma conta? </span>
                <a
                  href="/loginUsuario"
                  className="text-lime-600 font-semibold hover:text-lime-700"
                >
                  Faça login
                </a>
              </div>
            </form>
          </Form>
        </Card>
      </main>
    </div>
  );
}