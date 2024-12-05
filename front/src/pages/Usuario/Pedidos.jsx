import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Home, User, LogOut, Search, ShoppingBag, Package } from 'lucide-react';

const MeusPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userCashback, setUserCashback] = useState(0);
  const [userId, setUserId] = useState(null)

  const navigate = useNavigate();

  useEffect(() => {
    fetchPedidos();
    fetchCashback()
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      setError(null);
  
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const storedUser = localStorage.getItem('username');
  
      if (!token || !userId) {
        throw new Error('Usuário não está autenticado');
      }

      setUserName(storedUser);
  
      const response = await axios.get(
        `https://cashback-testes.onrender.com/transacoes/usuario/pedidos/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      setPedidos(response.data);
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

  const fetchCashback = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    const response = await axios.get(`https://cashback-testes.onrender.com/users/${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    console.log(response)
    setUserCashback(response.data.cashback || 0)
    
  }
  

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredPedidos = pedidos.filter((pedido) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      pedido._id.toLowerCase().includes(searchTermLower) ||
      pedido.produto.nome.toLowerCase().includes(searchTermLower) ||
      pedido.empresario.nome.toLowerCase().includes(searchTermLower)
    );
  });
console.log(filteredPedidos)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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

            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar pedidos por produto, ID ou vendedor..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                />
              </div>
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


      {/* Page Title and Summary */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Meus Pedidos</h1>
            <p className="text-zinc-600 mt-1">
              Acompanhe seus pedidos concluídos e o cashback recebido
            </p>
          </div>
          <Button
            onClick={() => navigate('/')}
            className="bg-lime-600 hover:bg-lime-700 text-white flex items-center space-x-2"
          >
            <ShoppingBag className="h-5 w-5" />
            <span>Continuar Comprando</span>
          </Button>
          
        </div>
        <Card className="mt-10 mb-10 w-56  p-4  bg-lime-50 border-lime-500">
  <h3 className="text-xl font-bold text-lime-700">Meu Cashback</h3>
  <p className="text-2xl font-medium text-lime-900">
    R$ {userCashback.toFixed(2)}
  </p>
</Card>
        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6 animate-slideDown">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600"></div>
          </div>
        ) : filteredPedidos.length === 0 ? (
          <Card className="text-center py-12 bg-white">
            <Package className="mx-auto h-12 w-12 text-zinc-400" />
            <h3 className="mt-4 text-lg font-medium text-zinc-900">
              {searchTerm ? 'Nenhum pedido encontrado' : 'Nenhum pedido concluído'}
            </h3>
            <p className="mt-2 text-zinc-600">
              {searchTerm
                ? 'Tente buscar usando outros termos'
                : 'Você ainda não possui pedidos concluídos.'}
            </p>
            <Button
              onClick={() => navigate('/')}
              className="mt-4 bg-lime-600 hover:bg-lime-700 text-white"
            >
              Ir às compras
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
           {filteredPedidos.map((pedido) => (
  <Card key={pedido._id} className="group hover:shadow-xl transition-shadow duration-300 overflow-hidden bg-white">
    <div className="p-6">
      {/* Cabeçalho do Pedido */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-zinc-900">
            Pedido #{pedido._id.slice(-6)}
          </h3>
          <p className="text-sm text-zinc-500">
            {new Date(pedido.dataCompra).toLocaleDateString('pt-BR', {
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

      {/* Imagem e Detalhes do Produto */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-100">
          <img
            src={pedido.produto?.imagemUrl || "/api/placeholder/80/80"}
            alt={pedido.produto?.nome || "Produto"}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h4 className="font-medium text-zinc-900">{pedido.produto?.nome || 'Nome não disponível'}</h4>
          <p className="text-sm text-zinc-600">
            Vendido por: {pedido.empresario?.nome || 'Vendedor não identificado'}
          </p>
        </div>
      </div>

      {/* Valores e Cashback */}
      <div className="mt-4 pt-4 border-t border-zinc-200 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-zinc-600">Valor da compra:</span>
          <span className="text-zinc-900 font-medium">
            {formatCurrency(pedido.valorCompra || 0)}
          </span>
        </div>
        <div className="flex justify-between items-center bg-lime-50 p-3 rounded-lg">
          <div>
            <span className="text-lime-700 font-medium">
              Cashback ({pedido.empresario?.cashback || 0}%):
            </span>
          </div>
          <span className="text-lime-700 font-medium">
            {formatCurrency(pedido.valorCashback || 0)}
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