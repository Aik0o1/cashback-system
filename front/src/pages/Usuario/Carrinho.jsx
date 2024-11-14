import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ShoppingBag, Home, Trash2, User, LogOut } from 'lucide-react';

function Carrinho() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userName, setUserName] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    const storedId = localStorage.getItem('userId');
    
    if (!storedUser || !storedToken || !storedId) {
      navigate('/login');
      return;
    }

    setUserName(storedUser);
    
    try {
      await axios.get('https://cashback-testes.onrender.com/transacoes', {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      });
      fetchCarrinho(storedId, storedToken);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
      }
    }
  };

  const fetchCarrinho = async (userId, token) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `https://cashback-testes.onrender.com/transacoes/usuario/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      const pendingTransactions = response.data.filter(
        transaction => transaction.status === "pendente"
      );
      
      setCartItems(pendingTransactions);
    } catch (error) {
      console.error('Erro ao buscar carrinho:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao carregar o carrinho. Tente novamente mais tarde.';
      setError(errorMessage);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };
console.log(cartItems)
  const removeFromCart = async (trasacaoId) => {
    try {
      console.log('legadsdl ' + trasacaoId)
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        throw new Error('Usuário não está autenticado');
      }

      await axios.delete(
        `https://cashback-testes.onrender.com/transacoes/deletar/${trasacaoId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      setSuccess('Item removido do carrinho com sucesso!');
      fetchCarrinho(userId, token);
    } catch (error) {
      console.error('Erro ao remover item:', error);
      setError('Erro ao remover item do carrinho.');
      
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const finalizarCompra = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        throw new Error('Usuário não está autenticado');
      }

      const response = await axios.post(
        'https://cashback-testes.onrender.com/transacoes/bulk',
        {
          usuarioId: userId,
          items: cartItems.map(item => ({
            produtoId: item.produto._id,
            empresarioId: item.empresario._id,
          }))
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (response.status === 200) {
        setSuccess('Compra realizada com sucesso!');
        setCartItems([]);
        setTimeout(() => {
          navigate('/pedidos');
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao finalizar compra:', error);
      setError(error.response?.data?.message || 'Erro ao finalizar a compra. Tente novamente.');
      
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.produto?.preco || 0);
    }, 0);
  };

  const calculateTotalCashback = () => {
    return cartItems.reduce((total, item) => {
      const preco = item.produto?.preco || 0;
      const cashback = item.empresario?.cashback || 0;
      return total + (preco * cashback / 100);
    }, 0);
  
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100">
      {/* Modern Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <span className="bg-gradient-to-r from-lime-500 to-lime-600 text-white py-2 px-4 rounded-lg text-lg font-bold shadow-sm">
                Uespi CashBack
              </span>
            </div>

            {/* User Menu */}
            <nav className="flex items-center space-x-3">
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="flex items-center space-x-2 text-zinc-700 hover:text-lime-600"
              >
                <Home className="h-5 w-5" />
                <span className="hidden sm:inline">Loja</span>
              </Button>

              <Button
                onClick={() => navigate('/pedidos')}
                variant="ghost"
                className="flex items-center space-x-2 text-zinc-700 hover:text-lime-600"
              >
                <ShoppingBag className="h-5 w-5" />
                <span className="hidden sm:inline">Pedidos</span>
              </Button>

              {userName && (
                <>
                  <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-100">
                    <User className="h-5 w-5 text-zinc-600" />
                    <span className="text-sm font-medium text-zinc-700">{userName}</span>
                  </div>
                  <Button
                    onClick={() => {
                      localStorage.clear();
                      navigate('/login');
                    }}
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Alerts */}
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <Card key={item._id} className="p-4 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-zinc-100">
                        <img
                          src={item.produto?.imagemUrl || "/api/placeholder/100/100"}
                          alt={item.produto?.nome}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-zinc-900">{item.produto?.nome}</h3>
                        <p className="text-zinc-600 text-sm">{item.produto?.descricao}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-xl font-bold text-zinc-900">
                            R$ {item.produto?.preco?.toFixed(2)}
                          </p>
                          <p className="text-lime-600 font-medium">
                            Cashback: {item.empresario?.cashback}%
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={loading}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <ShoppingCart className="mx-auto h-12 w-12 text-zinc-400" />
                  <h3 className="mt-4 text-lg font-medium text-zinc-900">Seu carrinho está vazio</h3>
                  <p className="mt-2 text-zinc-600">Adicione alguns produtos para começar</p>
                  <Button
                    onClick={() => navigate('/')}
                    className="mt-4 bg-lime-600 hover:bg-lime-700"
                  >
                    Voltar para Loja
                  </Button>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h2 className="text-xl font-bold text-zinc-900 mb-4">Resumo do Pedido</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal</span>
                    <span>R$ {calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lime-600 font-medium">
                    <span>Cashback Total</span>
                    <span>R$ {calculateTotalCashback().toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-zinc-200">
                    <div className="flex justify-between text-xl font-bold text-zinc-900">
                      <span>Total</span>
                      <span>R$ {calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                  <Button
                    onClick={finalizarCompra}
                    disabled={loading || cartItems.length === 0}
                    className="w-full mt-6 bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white"
                  >
                    {loading ? 'Processando...' : 'Finalizar Compra'}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Carrinho;