import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import axios from "axios";

import { Button } from "@/components/ui/button.jsx";
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
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  nome: z
    .string()
    .min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  descricao: z
    .string()
    .min(5, { message: "A descrição deve ter pelo menos 5 caracteres." }),
  preco: z.string().min(1, { message: "O preço é obrigatório." }),
  categoria: z.string().min(1, { message: "A categoria é obrigatória." }),
  imagem: z.any(),
});

export default function CadastroProduto({ produto, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(produto?.imagemUrl || null);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: produto?.nome || '',
      descricao: produto?.descricao || '',
      preco: produto?.preco?.toString() || '',
      categoria: produto?.categoria || '',
    }
  });

  useEffect(() => {
    if (produto) {
      form.reset({
        nome: produto.nome,
        descricao: produto.descricao,
        preco: produto.preco.toString(),
        categoria: produto.categoria,
      });
      setCurrentImageUrl(produto.imagemUrl);
    }
  }, [produto, form]);

  const onSubmit = async (data) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    
    try {
      let response;
      
      if (produto) {
        // Se estiver editando, criar um objeto com os dados atualizados
        const updateData = {
          nome: data.nome,
          descricao: data.descricao,
          preco: parseFloat(data.preco),
          categoria: data.categoria,
          imagemUrl: currentImageUrl // Usar a URL atual da imagem
        };

        // Se uma nova imagem foi selecionada, criar FormData
        if (selectedFile) {
          const formData = new FormData();
          Object.entries(updateData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              formData.append(key, value);
            }
          });
          formData.append("imagem", selectedFile);

          response = await axios.put(
            `https://cashback-testes.onrender.com/produtos/${produto._id}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } else {
          // Se não houver nova imagem, enviar apenas os dados como JSON
          response = await axios.put(
            `https://cashback-testes.onrender.com/produtos/${produto._id}`,
            updateData,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      } else {
        // Para novo produto
        const formData = new FormData();
        formData.append("nome", data.nome);
        formData.append("descricao", data.descricao);
        formData.append("preco", parseFloat(data.preco));
        formData.append("categoria", data.categoria);
        if (selectedFile) {
          formData.append("imagem", selectedFile);
        }

        response = await axios.post(
          "https://cashback-testes.onrender.com/produtos",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // Atualizar a URL da imagem atual com a nova resposta ou manter a existente
      const newImageUrl = response.data.imagemUrl || currentImageUrl;
      setCurrentImageUrl(newImageUrl);

      const updatedProduto = {
        ...response.data,
        imagemUrl: newImageUrl
      };

      setAlert({
        show: true,
        message: produto 
          ? 'Produto atualizado com sucesso!' 
          : 'Produto cadastrado com sucesso!',
        type: 'success'
      });

      if (onSuccess) {
        onSuccess(updatedProduto);
        location.reload();

      }

      if (!produto) {
        form.reset();
        setSelectedFile(null);
        setCurrentImageUrl(null);
      }
    } catch (error) {
      console.error("Erro ao processar produto:", error.response?.data);
      setAlert({
        show: true,
        message: produto 
          ? 'Erro ao atualizar produto' 
          : 'Erro ao cadastrar produto',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      {alert.show && (
        <Alert variant={alert.type === 'success' ? "default" : "destructive"} className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {alert.message}
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Produto</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do Produto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preco"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Preço" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="descricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea placeholder="Descrição do Produto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <FormControl>
                  <Input placeholder="Categoria" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>
              {produto ? "Nova Imagem do Produto (opcional)" : "Imagem do Produto"}
            </FormLabel>
            {currentImageUrl && (
              <div className="mb-2">
                <img 
                  src={currentImageUrl} 
                  alt="Imagem do produto"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </FormControl>
            {produto && !selectedFile && (
              <p className="text-sm text-gray-500 mt-1">
                Deixe em branco para manter a imagem atual
              </p>
            )}
          </FormItem>

          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? "Processando..." : (produto ? "Atualizar" : "Cadastrar")}
            </Button>
            
            {produto && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}