import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Building2, Mail, Lock, User, Calculator, Calendar } from "lucide-react";
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

// Mantendo o mesmo schema de validação
const formSchema = z.object({
  nome: z
    .string()
    .min(2, { message: "O nome deve ter pelo menos 2 caracteres." })
    .max(100, { message: "O nome não pode ter mais de 100 caracteres." })
    .regex(/^[a-zA-ZÀ-ÖØ-öø-ÿ\s]+$/, {
      message: "O nome deve conter apenas letras e espaços."
    }),

  loja: z
    .string()
    .min(2, { message: "O nome da loja deve ter pelo menos 2 caracteres." })
    .max(100, { message: "O nome da loja não pode ter mais de 100 caracteres." })
    .regex(/^[a-zA-ZÀ-ÖØ-öø-ÿ0-9\s\-\&]+$/, {
      message: "O nome da loja pode conter letras, números, espaços, hífens e &."
    }),

  email: z
    .string()
    .email({ message: "Insira um e-mail válido." })
    .max(254, { message: "O e-mail não pode ter mais de 254 caracteres." })
    .toLowerCase(),

  senha: z
    .string()
    .min(6, { message: "A senha deve ter pelo menos 6 caracteres." })
    .max(100, { message: "A senha não pode ter mais de 100 caracteres." })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
      message: "A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial."
    }),

  cnpj: z
    .string()
    .length(14, { message: "O CNPJ deve ter exatamente 14 caracteres." })
    .regex(/^\d+$/, { message: "O CNPJ deve conter apenas números." })
    .refine((cnpj) => {
      if (!/^\d{14}$/.test(cnpj)) return false;
      if (/^(\d)\1{13}$/.test(cnpj)) return false;
      
      let size = cnpj.length - 2;
      let numbers = cnpj.substring(0, size);
      let digits = cnpj.substring(size);
      let sum = 0;
      let pos = size - 7;

      for (let i = size; i >= 1; i--) {
        sum += numbers.charAt(size - i) * pos--;
        if (pos < 2) pos = 9;
      }

      let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
      if (result !== parseInt(digits.charAt(0))) return false;

      size = size + 1;
      numbers = cnpj.substring(0, size);
      sum = 0;
      pos = size - 7;

      for (let i = size; i >= 1; i--) {
        sum += numbers.charAt(size - i) * pos--;
        if (pos < 2) pos = 9;
      }

      result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
      if (result !== parseInt(digits.charAt(1))) return false;

      return true;
    }, { message: "CNPJ inválido." }),

  cashback: z
    .string()
    .refine((value) => !isNaN(parseFloat(value)), {
      message: "O valor do cashback deve ser um número válido."
    })
    .transform((value) => parseFloat(value))
    .refine((value) => value >= 0 && value <= 100, {
      message: "O valor do cashback deve estar entre 0 e 100%."
    })
    .refine((value) => Number.isFinite(value), {
      message: "O valor do cashback deve ser um número finito."
    }),

  validadeCashback: z
    .string()
    .refine((date) => {
      const inputDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(inputDate.getTime())) {
        return false;
      }

      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      return inputDate > today && inputDate <= oneYearFromNow;
    }, {
      message: "A data de validade deve ser futura e não mais que 1 ano a partir de hoje."
    }),
});

export default function CadastroEmpresario() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [emailError, setEmailError] = useState("");
  const [cnpjError, setCnpjError] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5050/empresario",
        {
          ...data,
          cashback: parseFloat(data.cashback),
        }
      );

      const { token, empresario } = response.data;
      console.log(response.data)
      localStorage.setItem('token', token);
      localStorage.setItem('empresarioId', empresario._id);

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
        setCnpjError("CNPJ já cadastrado.");
      } else {
        alert("Erro ao cadastrar empresário.");
      }
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
            Cadastro Empresarial
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <Card className="max-w-2xl mx-auto p-8 bg-white/50 backdrop-blur border border-white/20">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-zinc-800">
              Cadastro Empresarial
            </h2>
            <p className="text-zinc-600">
              Preencha os dados abaixo para cadastrar sua empresa
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Nome do Empresário */}
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-700">Nome do Empresário</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                        <Input
                          {...field}
                          className="pl-10 h-12 bg-white border border-zinc-200"
                          placeholder="Seu nome completo"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nome da Loja */}
              <FormField
                control={form.control}
                name="loja"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-700">Nome da Loja</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                        <Input
                          {...field}
                          className="pl-10 h-12 bg-white border border-zinc-200"
                          placeholder="Nome da sua loja"
                        />
                      </div>
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
                    <FormLabel className="text-zinc-700">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                        <Input
                          {...field}
                          type="email"
                          className="pl-10 h-12 bg-white border border-zinc-200"
                          placeholder="seu@email.com"
                        />
                      </div>
                    </FormControl>
                    {emailError && (
                      <p className="text-red-500 text-sm mt-1">{emailError}</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Senha */}
              <FormField
                control={form.control}
                name="senha"
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
                          placeholder="Sua senha segura"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CNPJ */}
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-700">CNPJ</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                        <Input
                          {...field}
                          className="pl-10 h-12 bg-white border border-zinc-200"
                          placeholder="00000000000000"
                        />
                      </div>
                    </FormControl>
                    {cnpjError && (
                      <p className="text-red-500 text-sm mt-1">{cnpjError}</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cashback */}
              <FormField
                control={form.control}
                name="cashback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-700">Cashback (%)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          className="pl-10 h-12 bg-white border border-zinc-200"
                          placeholder="0.00"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Validade do Cashback */}
              <FormField
                control={form.control}
                name="validadeCashback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-700">Validade do Cashback</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                        <Input
                          {...field}
                          type="date"
                          className="pl-10 h-12 bg-white border border-zinc-200"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Botão de Enviar */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white h-12"
                disabled={loading}
              >
                {loading ? "Cadastrando..." : "Cadastrar Empresa"}
              </Button>

              <div className="text-center text-zinc-600">
                <span>Já tem uma conta? </span>
                <a
                  href="/loginEmpresario"
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
