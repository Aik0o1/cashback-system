import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ShoppingBag, Search, LogOut, User } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

function Loja() {
  const [produtos, setProdutos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProdutos();
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = () => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    const storedId = localStorage.getItem('userId');

    // console.log(storedToken)
    // console.log(storedId)
    // console.log(storedUser)

    if (storedUser && storedToken && storedId) {
      setUser({ username: storedToken });
      setUserName(storedUser);
      setToken(storedToken);
      setUserId(storedId);
    }
  };
  
  const fetchProdutos = async () => {
    try {
      console.log(localStorage.getItem('token'))
      setLoading(true);
      const response = await axios.get('https://cashback-testes.onrender.com/produtos');
      setProdutos(response.data);
    } catch (error) {
      setError('Erro ao carregar produtos. Tente novamente mais tarde.');
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompra = async (produto) => {
    if (!user || !token) {
      setError('Você precisa estar logado para realizar uma compra.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (!produto.empresario) {
      setError('Este produto não está disponível para compra no momento.');
      return;
    }

    const validadeCashback = new Date(produto.empresario.validadeCashback);
    if (validadeCashback < new Date()) {
      setError('O cashback deste produto está expirado.');
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        'https://cashback-testes.onrender.com/transacoes',
        {
          produtoId: produto._id,
          usuarioId: userId,
          empresarioId: produto.empresario._id,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        setSuccess(`Pedido enviado ao carrinho! Você receberá ${produto.empresario.cashback}% de cashback ao finalizar a compra.`);
        fetchProdutos();
      }
    } catch (error) {
      console.error('Erro na compra:', error);
      setError(error.response?.data?.message || 'Erro ao processar a compra. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setUserName(null)
    setUserId(null)
    localStorage.clear();

  };

  const navigateToCart = () => {
    navigate('/carrinho');
  };

  const navigateToPedidos = () => {
    navigate('/pedidos');
  };

  const filteredProdutos = produtos.filter((produto) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      produto.nome.toLowerCase().includes(searchTermLower) ||
      produto.descricao.toLowerCase().includes(searchTermLower) ||
      produto.categoria.toLowerCase().includes(searchTermLower)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100">
      {/* Header com design moderno */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo e nome */}
            <div className="flex items-center space-x-4">
              <span className="bg-gradient-to-r from-lime-500 to-lime-600 text-white py-2 px-4 rounded-lg text-lg font-bold shadow-sm">
                Uespi CashBack
              </span>
            </div>

            {/* Barra de pesquisa centralizada */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Pesquisar produtos..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Menu do usuário */}
            <nav className="flex items-center space-x-3">
              {userName ? (
                <>
                  <div className="flex items-center space-x-3">
                    <span className="text-white font-bold text-2xl">Bem-vindo, {userName}</span>
                    
                    <Button
                      onClick={navigateToPedidos}
                      variant="ghost"
                      className="flex items-center space-x-2 text-zinc-700 hover:text-lime-600"
                    >
                      <ShoppingBag className="h-5 w-5" />
                      <span className="hidden sm:inline">Pedidos</span>
                    </Button>

                    <Button
                      onClick={navigateToCart}
                      variant="ghost"
                      className="flex items-center space-x-2 text-zinc-700 hover:text-lime-600"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span className="hidden sm:inline">Carrinho</span>
                    </Button>

                    <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-100">
                      <User className="h-5 w-5 text-zinc-600" />
                      <span className="text-sm font-medium text-zinc-700">{userName}</span>
                    </div>

                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => navigate('/login')}
                    variant="outline"
                    className="border-lime-600 text-lime-600 hover:bg-lime-50"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => navigate('/cadastro')}
                    className="bg-lime-600 hover:bg-lime-700 text-white"
                  >
                    Cadastro
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Alertas com animação */}
      <div className="container mx-auto px-4 mt-4">
        {error && (
          <Alert variant="destructive" className="mb-4 animate-slideDown">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-lime-50 border-lime-500 text-lime-800 animate-slideDown">
            <AlertTitle>Sucesso</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Grid de produtos com layout responsivo e moderno */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600"></div>
            </div>
          ) : filteredProdutos.length > 0 ? (
            filteredProdutos.map((produto) => (
              <Card key={produto._id} className="group hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="relative p-4">
                  {/* Badge de cashback */}
                  {produto.empresario && (
                     <div className="absolute top-2 right-2 bg-lime-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                     {produto.empresario.cashback}% Cashback
                   </div>
                  )}

                  {/* Imagem do produto */}
                  <div className="relative aspect-square mt-10 mb-4 overflow-hidden rounded-lg bg-zinc-100">
                    <img
                      src={produto.imagemUrl || "/api/placeholder/400/400"}
                      alt={produto.nome}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Informações do produto */}
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-zinc-900 line-clamp-2">
                      {produto.nome}
                    </h2>
                    <p className="text-zinc-600 text-sm line-clamp-2">
                      {produto.descricao}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-zinc-900">
                        R$ {produto.preco.toFixed(2)}
                      </span>
                      <span className="text-sm text-zinc-500 bg-zinc-100 px-2 py-1 rounded">
                        {produto.categoria}
                      </span>
                    </div>

                    {produto.empresario && (
                      <div className="pt-2 border-t border-zinc-200 mt-2">
                        <p className="text-sm text-zinc-600">
                          Loja: <span className="font-medium">{produto.empresario.loja}</span>
                        </p>
                        <p className="text-xs text-zinc-500">
                          Válido até: {new Date(produto.empresario.validadeCashback).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {/* Botão de compra */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          disabled={loading || !produto.empresario}
                          className="w-full mt-4 bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white shadow-sm"
                        >
                          {loading ? 'Processando...' : 'Comprar Agora'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Compra</AlertDialogTitle>
                          <AlertDialogDescription>
                            Você está prestes a comprar {produto.nome} por R$ {produto.preco.toFixed(2)}.
                            {produto.empresario && (
                              <span className="block mt-2 text-lime-600 font-medium">
                                Você receberá {produto.empresario.cashback}% de cashback nesta compra!
                              </span>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-zinc-200 text-zinc-700 hover:bg-zinc-50">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleCompra(produto)}
                            className="bg-lime-600 hover:bg-lime-700 text-white"
                          >
                            Confirmar Compra
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-zinc-400 text-lg">
                Nenhum produto encontrado para sua busca.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default Loja;