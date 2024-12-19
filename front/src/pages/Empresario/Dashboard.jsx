import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CadastroProduto from "./CadastroProduto";
import { Package, Store, History, AlertCircle, LogOut, Search, Percent, Calendar, DollarSign, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, bgColor }) => (
  <Card className="relative overflow-hidden">
    <div className={`absolute inset-0 ${bgColor} opacity-10`} />
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${bgColor} bg-opacity-20`}>
          <Icon className={`h-6 w-6 ${bgColor.replace('bg-', 'text-')}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

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

        const transacoesResponse = await axios.get(`https://cashback-testes.onrender.com/transacoes/empresario/${empresarioId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTransacoes(transacoesResponse.data.filter(t => t.status === 'concluída'));

        const empresarioResponse = await axios.get(`https://cashback-testes.onrender.com/empresario/${empresarioId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmpresario(empresarioResponse.data);

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

  const handleDeleteTransacao = async (transacaoId) => {
    const token = localStorage.getItem('token');

    try {
      if (!window.confirm('Tem certeza que deseja excluir esta transação?')) return;

      await axios.delete(`https://cashback-testes.onrender.com/transacoes/deletar/${transacaoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTransacoes(transacoes.filter(t => t._id !== transacaoId));
      setAlert({
        show: true,
        message: 'Transação excluída com sucesso!',
        type: 'success'
      });
      setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      setAlert({
        show: true,
        message: error.response?.data?.message || 'Erro ao excluir transação. Tente novamente.',
        type: 'error'
      });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleEdit = (produto) => {
    setEditingProduto(produto);
    setActiveTab('cadastro');
  };

  const handleCancelEdit = () => {
    setEditingProduto(null);
    setActiveTab('produtos');
  };

  const handleDelete = async (produtoId) => {
    const token = localStorage.getItem('token');

    try {
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

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100">
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

      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Saldo total em vendas"
            value={`R$ ${transacoes.reduce((acc, t) => acc + t.valorTotal, 0).toFixed(2)}`}
            icon={DollarSign}
            bgColor="bg-emerald-500"
          />
            <StatCard
              title="Saldo Recebido"
              value={`R$ ${empresario.saldo.toFixed(2)}`}
              icon={DollarSign}
              bgColor="bg-blue-500"
            />
          <StatCard
            title="Total de Cashback"
            value={`R$ ${transacoes.reduce((acc, t) => acc + t.valorCashback, 0).toFixed(2)}`}
            icon={Percent}
            bgColor="bg-red-500"
          />
          <StatCard
            title="Produtos Ativos"
            value={produtos.length}
            icon={Package}
            bgColor="bg-violet-500"
          />
          <StatCard
            title="Transações"
            value={transacoes.length}
            icon={History}
            bgColor="bg-amber-500"
          />
        </div>

        {alert.show && (
          <Alert
            variant={alert.type === 'success' ? 'default' : 'destructive'}
            className="mb-6"
          >
            <AlertTitle>{alert.type === 'success' ? 'Sucesso' : 'Erro'}</AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardContent className="p-1">
              <TabsList className="grid w-full grid-cols-4 gap-4 bg-zinc-100/50">
                <TabsTrigger value="produtos" className="data-[state=active]:bg-white data-[state=active]:text-lime-600">
                  <Package className="h-5 w-5 mr-2" />
                  Produtos
                </TabsTrigger>
                <TabsTrigger value="cadastro" className="data-[state=active]:bg-white data-[state=active]:text-lime-600">
                  <Store className="h-5 w-5 mr-2" />
                  Novo Produto
                </TabsTrigger>
                <TabsTrigger value="transacoes" className="data-[state=active]:bg-white data-[state=active]:text-lime-600">
                  <History className="h-5 w-5 mr-2" />
                  Transações
                </TabsTrigger>
                <TabsTrigger value="empresa" className="data-[state=active]:bg-white data-[state=active]:text-lime-600">
                  <Store className="h-5 w-5 mr-2" />
                  Dados da Empresa
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          <TabsContent value="produtos">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Pesquisar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {produtos
                .filter(produto =>
                  produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  produto.descricao.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((produto) => (
                  <Card key={produto._id} className="group hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                    <div className="relative p-4">
                      <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-zinc-100">
                        <img
                          src={produto.imagemUrl || "/api/placeholder/400/400"}
                          alt={produto.nome}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-zinc-900">{produto.nome}</h2>
                        <p className="text-zinc-600 text-sm line-clamp-2">{produto.descricao}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-lime-600">
                            R$ {produto.preco.toFixed(2)}
                          </span>
                          <div className="text-sm text-zinc-500">
                            Cashback: {(produto.preco * (empresario.cashback / 100)).toFixed(2)}
                          </div>
                        </div>
                        <div className="pt-4 flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(produto)}
                            className="hover:bg-zinc-100"
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(produto._id)}
                            className="hover:bg-red-700"
                          >
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="cadastro">
            <Card>
              <CardHeader>
                <CardTitle>{editingProduto ? 'Editar Produto' : 'Cadastrar Novo Produto'}</CardTitle>
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
                  produto={editingProduto} // Changed from editingProduto to produto
                  onSuccess={handleUpdateSuccess}
                  onCancel={handleCancelEdit}
                />
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="transacoes">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Transações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Data</th>
                        <th className="text-left py-3 px-4">Produto</th>
                        <th className="text-left py-3 px-4">Cliente</th>
                        <th className="text-right py-3 px-4">Valor</th>
                        <th className="text-right py-3 px-4">Cashback</th>
                        <th className="text-right py-3 px-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transacoes.map((transacao) => (
                        <tr key={transacao._id} className="border-b hover:bg-zinc-50">
                          <td className="py-3 px-4">
                            {new Date(transacao.dataCompra).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">{transacao.produto.nome}</td>
                          <td className="py-3 px-4">{transacao.usuario._id}</td>
                          <td className="py-3 px-4 text-right">
                            R$ {transacao.valorCompra.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right text-lime-600">
                            R$ {transacao.valorCashback.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteTransacao(transacao._id)}
                              className="hover:bg-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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