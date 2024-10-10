import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import axios from "axios";

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
import { Textarea } from "@/components/ui/textarea";

// Validação com Zod
const formSchema = z.object({
  nome: z
    .string()
    .min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  descricao: z
    .string()
    .min(5, { message: "A descrição deve ter pelo menos 5 caracteres." }),
  preco: z.string().min(1, { message: "O preço é obrigatório." }),
  categoria: z.string().min(1, { message: "A categoria é obrigatória." }),
  imagem: z.any(), // Aqui não precisa de validação especial para imagem
});

export default function CadastroProduto({ empresarioId }) {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // Para armazenar a imagem selecionada

  // Hook form setup
  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("nome", data.nome);
    formData.append("descricao", data.descricao);
    formData.append("preco", parseFloat(data.preco));
    formData.append("categoria", data.categoria);
    formData.append("imagem", selectedFile); // Adiciona a imagem do estado ao FormData

    try {
      const response = await axios.post(
        "http://localhost:5050/produtos",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // Inclui o token no header da requisição
          },
        }
      );

      alert("Produto cadastrado com sucesso!");
      console.log(response.data);
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error.response?.data);
      alert("Erro ao cadastrar produto");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]); // Captura o arquivo de imagem e armazena no estado
  };

  return (
    <div className="min-h-screen fundo-login flex items-center justify-center">
      <div className="w-full max-w-xl mx-auto p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Cadastro de Produto
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
                    Nome do Produto
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome do Produto"
                      {...field}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />

            {/* Preço */}
            <FormField
              control={form.control}
              name="preco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Preço
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Preço"
                      step="0.01"
                      {...field}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />

            {/* Descrição */}
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Descrição
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição do Produto"
                      {...field}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />

            {/* Categoria */}
            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Categoria
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Categoria"
                      {...field}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />

            {/* Imagem */}
            <FormItem>
              <FormLabel className="block text-sm font-medium text-gray-700">
                Imagem do Produto
              </FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </FormControl>
              <FormMessage className="text-red-500 text-sm mt-1" />
            </FormItem>

            {/* Botão de Enviar */}
            <Button
              type="submit"
              className={`w-full py-3 text-white rounded-md ${
                loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
              }`}
              disabled={loading}
            >
              {loading ? "Cadastrando..." : "Cadastrar Produto"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
