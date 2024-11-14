import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CadastroProduto from "./CadastroProduto";
import { Package, Store, History, AlertCircle, LogOut, Search, Percent, Calendar, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [transacoes, setTransacoes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [empresario, setEmpresario] = useState(null);
  const [editingProduto, setEditingProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('produtos');
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();



  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const empresarioId = localStorage.getItem('empresarioId');
          
        // Buscar transações concluídas
        const transacoesResponse = await axios.get(`https://cashback-testes.onrender.com/transacoes/empresario/${empresarioId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTransacoes(transacoesResponse.data.filter(t => t.status === 'concluída'));
        transacoes.forEach(t => {
            console.log(t)
        })
        
        // Buscar dados do empresário
        const empresarioResponse = await axios.get(`https://cashback-testes.onrender.com/empresario/${empresarioId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmpresario(empresarioResponse.data);

        // Buscar produtos do empresário
        const produtosResponse = await axios.get(`https://cashback-testes.onrender.com/produtos/empresario/${empresarioId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProdutos(produtosResponse.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setAlert({
          show: true,
          message: 'Erro ao carregar dados. Por favor, recarregue a página.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const handleLogout = () => {
    localStorage.removeItem('empresarioId');
    localStorage.removeItem('token');
    localStorage.removeItem('nome');
    navigate('/');
    setEmpresario(null);
    localStorage.clear();

  };

  const handleEdit = (produto) => {
    setEditingProduto(produto);
    setActiveTab('cadastro');
  };

  const handleCancelEdit = () => {
    setEditingProduto(null);
    setActiveTab('produtos');
  };

  const handleUpdateSuccess = async (updatedProduto) => {
    try {
      const newProdutos = produtos.map(p => 
        p._id === updatedProduto._id ? updatedProduto : p
      );
      setProdutos(newProdutos);
      setEditingProduto(null);
      setActiveTab('produtos');
      setAlert({
        show: true,
        message: 'Produto atualizado com sucesso!',
        type: 'success'
      });
      setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
    } catch (error) {
      setAlert({
        show: true,
        message: 'Erro ao atualizar produto. Tente novamente.',
        type: 'error'
      });
    }
  };

  const EditEmpresarioForm = () => {
    const [formData, setFormData] = useState({
      nome: empresario?.nome || '',
      loja: empresario?.loja || '',
      cashback: empresario?.cashback || '',
      validadeCashback: empresario?.validadeCashback || ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      const token = localStorage.getItem('token');
      try {
        await axios.put(
          `https://cashback-testes.onrender.com/empresarios/atualizar/${empresario._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEmpresario({ ...empresario, ...formData });
        setAlert({
          show: true,
          message: 'Dados atualizados com sucesso!',
          type: 'success'
        });
        setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
      } catch (error) {
        console.error('Erro ao atualizar dados:', error);
        setAlert({
          show: true,
          message: 'Erro ao atualizar dados. Tente novamente.',
          type: 'error'
        });
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Cashback (%)</label>
          <input
            type="number"
            value={formData.cashback}
            onChange={(e) => setFormData({ ...formData, cashback: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Validade do Cashback</label>
          <input
            type="date"
            value={formData.validadeCashback}
            onChange={(e) => setFormData({ ...formData, validadeCashback: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <Button type="submit" className="w-full">
          Atualizar Dados
        </Button>
      </form>
    );
  };

  const ProdutosList = () => {
    const handleDelete = async (produtoId) => {
      const token = localStorage.getItem('token');
      
      try {
        // Primeiro, verificar se existem transações
        const checkResponse = await axios.get(
          `https://cashback-testes.onrender.com/transacoes/verificar/${produtoId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        if (checkResponse.data.temTransacoes) {
          setAlert({
            show: true,
            message: `Não é possível excluir este produto pois existem ${checkResponse.data.count} transações associadas a ele.`,
            type: 'error'
          });
          return;
        }
  
        if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
  
        await axios.delete(`https://cashback-testes.onrender.com/produtos/${produtoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setProdutos(produtos.filter(p => p._id !== produtoId));
        setAlert({
          show: true,
          message: 'Produto excluído com sucesso!',
          type: 'success'
        });
        setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        setAlert({
          show: true,
          message: error.response?.data?.message || 'Erro ao excluir produto. Tente novamente.',
          type: 'error'
        });
      }
    };
  

    return (
      <div className="space-y-4">
        {alert.show && (
          <Alert variant={alert.type === 'success' ? "default" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {alert.message}
            </AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {produtos.map((produto) => (
            <Card key={produto._id}>
              <CardHeader>
                <img 
                  src={produto.imagemUrl} 
                  alt={produto.nome} 
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <CardTitle>{produto.nome}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{produto.descricao}</p>
                <p className="text-lg font-bold mt-2">R$ {produto.preco.toFixed(2)}</p>
                <div className="flex justify-between mt-4">
                  <Button 
                    onClick={() => handleEdit(produto)} 
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Package size={16} />
                    Editar
                  </Button>
                  <Button 
                    onClick={() => handleDelete(produto._id)} 
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <AlertCircle size={16} />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };
  const TransacoesList = () => (
    <div className="space-y-4">
      {transacoes.map((transacao) => (
        <Card key={transacao._id}>
          <CardContent className="flex justify-between items-center p-4">
            <div>
              <h3 className="font-bold">
                {transacao.produto?.nome || 'Produto Removido'}
              </h3>
              <p className="text-sm text-gray-600">
                Cliente: {transacao.usuario?._id || 'Usuário não disponível'}
              </p>
              <p className="text-sm text-gray-600">
                Data: {new Date(transacao.dataCompra).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold">R$ {transacao.valorCompra.toFixed(2)}</p>
              <p className="text-sm text-green-600">
                Cashback: R$ {transacao.valorCashback.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <span className="bg-gradient-to-r from-lime-500 to-lime-600 text-white py-2 px-4 rounded-lg text-lg font-bold shadow-sm">
                Uespi CashBack
              </span>
              <span className="text-zinc-700 font-semibold">Dashboard Empresarial</span>
            </div>

            {empresario && (
              <div className="flex items-center space-x-6">
                <div className="flex flex-col items-end">
                  <span className="text-lg font-bold text-zinc-800">{empresario.loja}</span>
                  <span className="text-sm text-lime-600">Cashback: {empresario.cashback}%</span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 gap-4">
            <TabsTrigger value="produtos" className="flex items-center gap-2">
              <Package size={20} /> Produtos
            </TabsTrigger>
            <TabsTrigger value="cadastro" className="flex items-center gap-2">
              <Store size={20} /> Novo Produto
            </TabsTrigger>
            <TabsTrigger value="transacoes" className="flex items-center gap-2">
              <History size={20} /> Transações
            </TabsTrigger>
            <TabsTrigger value="empresa" className="flex items-center gap-2">
              <Store size={20} /> Dados da Empresa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="produtos">
            <Card>
              <CardHeader>
                <CardTitle>Meus Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                <ProdutosList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cadastro">
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>
                  {editingProduto ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                </CardTitle>
                {editingProduto && (
                  <Button 
                    variant="outline" 
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2"
                  >
                    Cancelar Edição
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <CadastroProduto 
                  produto={editingProduto}
                  onSuccess={handleUpdateSuccess}
                  onCancel={handleCancelEdit}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transacoes">
            <Card>
              <CardHeader>
                <CardTitle>Transações Concluídas</CardTitle>
              </CardHeader>
              <CardContent>
                <TransacoesList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="empresa">
            <Card>
              <CardHeader>
                <CardTitle>Dados da Empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <EditEmpresarioForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;