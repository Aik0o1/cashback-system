import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Home, User, LogOut } from 'lucide-react';

const MeusPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      setError(null);
  
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const storedUser = localStorage.getItem('user');
  
      if (!token || !userId) {
        throw new Error('Usuário não está autenticado');
      }

      setUserName(storedUser);
  
      const response = await axios.get(
        `http://localhost:5050/transacoes/usuario/pedidos/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      const concluidos = response.data.filter(transacao => transacao.status === 'concluída');
      setPedidos(concluidos);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao carregar os pedidos. Tente novamente mais tarde.';
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
                onClick={() => navigate('/carrinho')}
                variant="ghost"
                className="flex items-center space-x-2 text-zinc-700 hover:text-lime-600"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden sm:inline">Carrinho</span>
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
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600"></div>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <ShoppingCart className="mx-auto h-12 w-12 text-zinc-400" />
            <h3 className="mt-4 text-lg font-medium text-zinc-900">Nenhum pedido concluído</h3>
            <p className="mt-2 text-zinc-600">Você ainda não possui pedidos concluídos.</p>
            <Button
              onClick={() => navigate('/')}
              className="mt-4 bg-lime-600 hover:bg-lime-700 text-white"
            >
              Ir às compras
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pedidos.map((pedido) => (
              <Card key={pedido._id} className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-zinc-900">
                        Pedido #{pedido._id.slice(-6)}
                      </h3>
                      <p className="text-sm text-zinc-500">
                        {new Date(pedido.dataPedido).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className="px-3 py-1 text-sm font-medium text-lime-700 bg-lime-100 rounded-full">
                      Concluído
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {pedido.itens.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="text-zinc-900 font-medium">{item.nome}</p>
                          <p className="text-sm text-zinc-600">Qtd: {item.quantidade}</p>
                        </div>
                        <p className="text-zinc-900 font-medium">
                          R$ {(item.preco * item.quantidade).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-200">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-600">Subtotal:</span>
                      <span className="text-zinc-900 font-medium">
                        R$ {pedido.valorTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-lime-600 font-medium">Cashback:</span>
                      <span className="text-lime-600 font-medium">
                        R$ {(pedido.valorTotal * 0.05).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeusPedidos;