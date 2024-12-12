import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  Users,
  Store,
  History,
  UserPlus,
  Trash2,
  Edit,
  Search,
  FileDown,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [empresarios, setEmpresarios] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('usuarios');
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editingEmpresario, setEditingEmpresario] = useState(null);
  const [saldoAdmin, setSaldoAdmin] = useState(null)

  // Pagination states
  const [userPage, setUserPage] = useState(1);
  const [empresarioPage, setEmpresarioPage] = useState(1);
  const [transacoesPage, setTransacoesPage] = useState(1);
  const itemsPerPage = 10;

  const [transactionFilters, setTransactionFilters] = useState({
    startDate: '',
    endDate: '',
    empresarioId: '',
    usuarioId: '',
    produtoId: ''
  });
  const navigate = useNavigate();
  const StatCard = ({ title, value, icon: Icon, bgColor }) => (
    <Card className="relative overflow-hidden bottom-3">
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

  useEffect(() => {
    const getSaldoAdmin = async () => {
      const storedToken = localStorage.getItem('token');
      const storedId = localStorage.getItem('userId');

      if (!storedUser || !storedToken || !storedId) {
        navigate('/login');
        return;
      }

      try {
        const saldo = await axios.get('http://localhost:5050/users/admin/saldo/:id', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });
        setSaldoAdmin(saldo)
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('erro')
        }
      }
    };

  }, [saldoAdmin])

  const fetchData = async (token) => {
    try {
      // Fetch users
      const usersResponse = await axios.get('http://localhost:5050/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(usersResponse.data);

      // Fetch empresarios
      const empresariosResponse = await axios.get('http://localhost:5050/empresario', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmpresarios(empresariosResponse.data);

      // Fetch all transactions
      const transacoesResponse = await axios.get('http://localhost:5050/transacoes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransacoes(transacoesResponse.data);
      console.log(transacoesResponse.data)

      const produtosResponse = await axios.get('http://localhost:5050/produtos', {
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

  const filterTransactions = (transactions) => {
    return transactions.filter(transacao => {
      const transactionDate = new Date(transacao.dataCompra);
      // const valor = transacao.produto.valor
      // console.log(transacao)
      // Date filter
      const startDateMatch = !transactionFilters.startDate ||
        transactionDate >= new Date(transactionFilters.startDate);

      const endDateMatch = !transactionFilters.endDate ||
        transactionDate <= new Date(transactionFilters.endDate);

      // Empresario filter
      const empresarioMatch = !transactionFilters.empresarioId ||
        transacao.empresario?._id === transactionFilters.empresarioId;

      // Usuario filter
      const usuarioMatch = !transactionFilters.usuarioId ||
        transacao.usuario?._id === transactionFilters.usuarioId;

      const produtoMatch = !transactionFilters.produtoId ||
        transacao.produto?.nome === transactionFilters.produtoId;




      return startDateMatch && endDateMatch && empresarioMatch && usuarioMatch && produtoMatch;
    });
  };
  useEffect(() => {
    const token = localStorage.getItem('token');

    // Verify admin access  
    try {
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;

      if (!user || user.userType !== 'admin') {
        return;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return;
    }


    fetchData(token);
  }, [navigate]);

  const handleDeleteUser = async (userId) => {
    const token = localStorage.getItem('token');

    try {
      if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;

      await axios.delete(`http://localhost:5050/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(users.filter(u => u._id !== userId));
      setEmpresarios(empresarios.filter(e => e._id !== userId));
      setAlert({
        show: true,
        message: 'Usuário excluído com sucesso!',
        type: 'success'
      });
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      setAlert({
        show: true,
        message: error.response?.data?.message || 'Erro ao excluir usuário. Tente novamente.',
        type: 'error'
      });
    }
  };

  const handleDeleteEmpresario = async (userId) => {
    const token = localStorage.getItem('token');

    try {
      if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;

      await axios.delete(`http://localhost:5050/empresario/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(users.filter(u => u._id !== userId));
      setEmpresarios(empresarios.filter(e => e._id !== userId));
      setAlert({
        show: true,
        message: 'Empresário excluído com sucesso!',
        type: 'success'
      });
    } catch (error) {
      console.error('Erro ao excluir Empresário:', error);
      setAlert({
        show: true,
        message: error.response?.data?.message || 'Erro ao excluir Empresário. Tente novamente.',
        type: 'error'
      });
    }
  };

  const exportTransacoesToExcel = () => {
    console.log(transacoes[0].empresario._id)
    // Flatten the nested data to create a more Excel-friendly format
    const flattenedTransacoes = transacoes.map(transacao => ({
      id: transacao._id,
      produtoId: transacao.produto?._id,
      produtoNome: transacao.produto?.nome,
      usuarioNOme: transacao.usuario.username || N / A,
      empresarioNome: transacao.empresario?.nome || 'N/A',
      valorCompra: transacao.valorCompra,
      valorCashback: transacao.valorCashback,
      status: transacao.status,
      dataCompra: transacao.dataCompra
    }));

    const worksheet = XLSX.utils.json_to_sheet(flattenedTransacoes);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Transações");

    XLSX.writeFile(workbook, "relatorio_transacoes.xlsx");
  };

  const EditUserForm = () => {
    const [formData, setFormData] = useState({
      username: editingUser?.username || '',
      firstName: editingUser?.firstName || '',
      lastName: editingUser?.lastName || '',
      email: editingUser?.email || '',
      userType: editingUser?.userType || 'usuario'
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      const token = localStorage.getItem('token');
      try {
        const response = await axios.put(
          `http://localhost:5050/users/atualizar/${editingUser._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Update users list
        setUsers(users.map(u =>
          u._id === editingUser._id ? response.data : u
        ));
        setEditingUser(null);
        setAlert({
          show: true,
          message: 'Usuário atualizado com sucesso!',
          type: 'success'
        });
        fetchData(token)
      } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        setAlert({
          show: true,
          message: 'Erro ao atualizar usuário. Tente novamente.',
          type: 'error'
        });
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome de Usuário</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Primeiro Nome</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Sobrenome</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        <div className="flex space-x-2">
          <Button type="submit" className="w-full">Atualizar Usuário</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditingUser(null)}
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      </form>
    );
  };

  const EditEmpresarioForm = () => {
    const [formData, setFormData] = useState({
      nome: editingEmpresario?.nome || '',
      email: editingEmpresario?.email || '',
      loja: editingEmpresario?.loja || '',
      cnpj: editingEmpresario?.cnpj || '',
      cashback: editingEmpresario?.cashback || '',
      validadeCashback: editingEmpresario?.validadeCashback || ''
    });
    const formatISOToBrazilianDate = (isoDate) => {
      const date = new Date(isoDate);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses começam em 0
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const handleSubmit = async (e) => {
      console.log(formData)
      e.preventDefault();
      const token = localStorage.getItem('token');
      try {
        const response = await axios.put(
          `http://localhost:5050/empresario/atualizar/${editingEmpresario._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Update empresarios list
        setEmpresarios(empresarios.map(e =>
          e._id === editingEmpresario._id ? response.data : e
        ));
        setEditingEmpresario(null);
        setAlert({
          show: true,
          message: 'Empresário atualizado com sucesso!',
          type: 'success'
        });
        fetchData(token)
      } catch (error) {
        console.error('Erro ao atualizar empresário:', error);
        setAlert({
          show: true,
          message: 'Erro ao atualizar empresário. Tente novamente.',
          type: 'error'
        });
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome</label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Loja</label>
          <input
            type="text"
            value={formData.loja}
            onChange={(e) => setFormData({ ...formData, loja: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">CNPJ</label>
          <input
            type="text"
            value={formData.cnpj}
            onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">Cashback %</label>
            <input
              type="text"
              value={formData.cashback}
              onChange={(e) => setFormData({ ...formData, cashback: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required

            />
            <div>
              <label className="block text-sm font-medium text-gray-700">Validade do Cashback</label>
              <input
                type="date"
                value={
                  formData.validadeCashback
                    ? new Date(formData.validadeCashback).toISOString().split('T')[0] // Converte para yyyy-mm-dd
                    : ''
                }
                onChange={(e) => {
                  const isoDate = new Date(e.target.value).toISOString(); // Mantém no formato ISO
                  setFormData({ ...formData, validadeCashback: isoDate });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />

            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button type="submit" className="w-full">Atualizar Empresário</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditingEmpresario(null)}
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      </form>
    );
  };

  // Pagination functions
  const paginateData = (data, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = (data) => {
    return Math.ceil(data.length / itemsPerPage);
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
              <span className="bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg text-lg font-bold shadow-sm">
                Painel Admin
              </span>
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
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
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
                <TabsTrigger value="usuarios" className="data-[state=active]:bg-white data-[state=active]:text-red-600">
                  <Users className="h-5 w-5 mr-2" />
                  Usuários
                </TabsTrigger>
                <TabsTrigger value="empresarios" className="data-[state=active]:bg-white data-[state=active]:text-red-600">
                  <Store className="h-5 w-5 mr-2" />
                  Empresários
                </TabsTrigger>
                <TabsTrigger value="transacoes" className="data-[state=active]:bg-white data-[state=active]:text-red-600">
                  <History className="h-5 w-5 mr-2" />
                  Transações
                </TabsTrigger>
                <TabsTrigger value="edicao" className="data-[state=active]:bg-white data-[state=active]:text-red-600">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Gerenciar
                </TabsTrigger>
              </TabsList>

            </CardContent>
          </Card>

          <TabsContent value="usuarios">

            <Card>
              <CardHeader>
                <CardTitle>Usuários Cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                {editingUser ? (
                  <EditUserForm />
                ) : (
                  <div className="space-y-4">
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder="Pesquisar usuários..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setUserPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2 rounded-full border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">ID</th>
                          <th className="text-left p-2">Nome de Usuário</th>
                          <th className="text-left p-2">Nome Completo</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Tipo</th>
                          <th className="text-right p-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginateData(
                          users.filter(user =>
                            user.username &&
                            (user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              `${user._id} ${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
                          ),
                          userPage
                        ).map((user) => (
                          <tr key={user._id} className="border-b hover:bg-zinc-50">
                            <td className="p-2">{user._id}</td>
                            <td className="p-2">{user.username}</td>
                            <td className="p-2">{`${user.firstName} ${user.lastName}`}</td>
                            <td className="p-2">{user.email}</td>
                            <td className="p-2">{user.userType}</td>
                            <td className="p-2 text-right space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteUser(user._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex justify-between items-center mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setUserPage(prev => Math.max(1, prev - 1))}
                        disabled={userPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
                      </Button>
                      <span>Página {userPage} de {getTotalPages(users)}</span>
                      <Button
                        variant="outline"
                        onClick={() => setUserPage(prev =>
                          prev < getTotalPages(users) ? prev + 1 : prev
                        )}
                        disabled={userPage === getTotalPages(users)}
                      >
                        Próximo <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="empresarios">
            <Card>
              <CardHeader>
                <CardTitle>Empresários Cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                {editingEmpresario ? (
                  <EditEmpresarioForm />
                ) : (
                  <div className="space-y-4">
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder="Pesquisar empresários..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setEmpresarioPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2 rounded-full border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Loja</th>
                          <th className="text-left p-2">Nome Completo</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">CNPJ</th>
                          <th className="text-left p-2">Cashback</th>
                          <th className="text-left p-2">Validade do Cashback</th>

                          <th className="text-right p-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginateData(
                          empresarios.filter(empresario =>
                            empresario.loja && empresario.loja.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            empresario.nome && empresario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            empresario.email && empresario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            empresario.cnpj && empresario.cnpj.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            empresario.cashback && empresario.cashback.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                            empresario.validadeCashback && empresario.validadeCashback.toString().toLowerCase().includes(searchTerm.toLowerCase())
                          ),
                          empresarioPage
                        ).map((empresario) => (
                          <tr key={empresario._id} className="border-b hover:bg-zinc-50">
                            <td className="p-2">{empresario.loja}</td>
                            <td className="p-2">{empresario.nome}</td>
                            <td className="p-2">{empresario.email}</td>
                            <td className="p-2">{empresario.cnpj}</td>
                            <td className="p-2">{empresario.cashback}</td>
                            <td className="p-2">{empresario.validadeCashback}</td>
                            <td className="p-2 text-right space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingEmpresario(empresario)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteEmpresario(empresario._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex justify-between items-center mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setEmpresarioPage(prev => Math.max(1, prev - 1))}
                        disabled={empresarioPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
                      </Button>
                      <span>Página {empresarioPage} de {getTotalPages(empresarios)}</span>
                      <Button
                        variant="outline"
                        onClick={() => setEmpresarioPage(prev =>
                          prev < getTotalPages(empresarios) ? prev + 1 : prev
                        )}
                        disabled={empresarioPage === getTotalPages(empresarios)}
                      >
                        Próximo <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transacoes">
            <StatCard
              title="Saldo"
              value={`R$ ${transacoes.reduce((acc, t) => acc + t.valorTotal, 0).toFixed(2)}`}
              icon={DollarSign}
              bgColor="bg-emerald-500">


            </StatCard>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Histórico de Transações</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setTransactionFilters({
                      startDate: '',
                      endDate: '',
                      empresarioId: '',
                      usuarioId: ''
                    })}
                  >
                    Limpar Filtros
                  </Button>
                  <Button
                    variant="outline"
                    onClick={exportTransacoesToExcel}
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Exportar Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data Inicial</label>
                    <input
                      type="date"
                      value={transactionFilters.startDate}
                      onChange={(e) => setTransactionFilters(prev => ({
                        ...prev,
                        startDate: e.target.value
                      }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data Final</label>
                    <input
                      type="date"
                      value={transactionFilters.endDate}
                      onChange={(e) => setTransactionFilters(prev => ({
                        ...prev,
                        endDate: e.target.value
                      }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Empresário</label>
                    <select
                      value={transactionFilters.produtoId}
                      onChange={(e) => setTransactionFilters(prev => ({
                        ...prev,
                        produtoNome: e.target.value
                      }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    >
                      <option value="">Produtos</option>
                      {produtos.map(empresario => (
                        <option key={produtos._id} value={produtos._id}>
                          {produtos.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Empresário</label>
                    <select
                      value={transactionFilters.empresarioId}
                      onChange={(e) => setTransactionFilters(prev => ({
                        ...prev,
                        empresarioId: e.target.value
                      }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    >
                      <option value="">Todos Empresários</option>
                      {empresarios.map(empresario => (
                        <option key={empresario._id} value={empresario._id}>
                          {empresario.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Usuário</label>
                    <select
                      value={transactionFilters.usuarioId}
                      onChange={(e) => setTransactionFilters(prev => ({
                        ...prev,
                        usuarioId: e.target.value
                      }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    >
                      <option value="">Todos Usuários</option>
                      {users.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.username}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Pesquisar transações..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setTransacoesPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 rounded-full border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Produto</th>
                      <th className="text-left p-2">Usuário</th>
                      <th className="text-left p-2">Empresário</th>
                      <th className="text-left p-2">Valor Compra</th>
                      <th className="text-left p-2">Valor Cashback</th>
                      <th className="text-left p-2">Valor Total</th>
                      <th className="text-left p-2">Data</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginateData(
                      filterTransactions(
                        transacoes.filter(transacao =>
                          transacao._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transacao.usuario?._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transacao.empresario?._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transacao.produto?._id.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                      ),
                      transacoesPage
                    ).map((transacao) => (
                      <tr key={transacao._id} className="border-b hover:bg-zinc-50">
                        <td className="p-2">{transacao._id}</td>
                        <td className="p-2">{transacao.produto?.nome}</td>
                        <td className="p-2">{transacao.usuario?.username || 'N/A'}</td>
                        <td className="p-2">{transacao.empresario?.nome || 'N/A'}</td>
                        <td className="p-2">R$ {transacao.valorCompra.toFixed(2)}</td>
                        <td className="p-2">R$ {transacao.valorCashback.toFixed(2)}</td>

                        <td className="p-2">R$ {transacao.valorTotal.toFixed(2)}</td>
                        <td className="p-2">
                          {new Date(transacao.dataCompra).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${transacao.status === 'concluida'
                              ? 'bg-green-100 text-green-800'
                              : transacao.status === 'pendente'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {transacao.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Pagination remains the same */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="edicao">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Create User Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <UserPlus className="h-5 w-5 mr-2" />
                      Criar Novo Administrador
                    </h3>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const newUser = {
                          username: formData.get('username'),
                          firstName: formData.get('firstName'),
                          lastName: formData.get('lastName'),
                          email: formData.get('email'),
                          password: formData.get('password'),
                          userType: formData.get('userType')
                        };

                        try {
                          const token = localStorage.getItem('token');
                          const response = await axios.post(
                            'http://localhost:5050/users',
                            newUser,
                            { headers: { Authorization: `Bearer ${token}` } }
                          );

                          setUsers([...users, response.data]);
                          if (response.data.userType === 'empresario') {
                            setEmpresarios([...empresarios, response.data]);
                          }
                          setAlert({
                            show: true,
                            message: 'Usuário criado com sucesso!',
                            type: 'success'
                          });
                          e.target.reset();
                        } catch (error) {
                          console.error('Erro ao criar usuário:', error);
                          setAlert({
                            show: true,
                            message: 'Erro ao criar usuário. Tente novamente.',
                            type: 'error'
                          });
                        }
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nome de Usuário</label>
                        <input
                          type="text"
                          name="username"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Primeiro Nome</label>
                        <input
                          type="text"
                          name="firstName"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Sobrenome</label>
                        <input
                          type="text"
                          name="lastName"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          name="email"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Senha</label>
                        <input
                          type="password"
                          name="password"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Usuário</label>
                        <select
                          name="userType"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        >
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <Button type="submit" className="w-full">
                        Criar Usuário
                      </Button>
                    </form>
                  </div>

                  {/* System Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      Informações do Sistema
                    </h3>
                    <div className="space-y-4 bg-zinc-50 p-4 rounded-lg">
                      <div>
                        <p className="font-medium">Total de Usuários:</p>
                        <p className="text-2xl font-bold text-red-600">{users.length}</p>
                      </div>
                      <div>
                        <p className="font-medium">Total de Empresários:</p>
                        <p className="text-2xl font-bold text-red-600">{empresarios.length}</p>
                      </div>
                      <div>
                        <p className="font-medium">Total de Transações:</p>
                        <p className="text-2xl font-bold text-red-600">{transacoes.length}</p>
                      </div>
                      <div>
                        <p className="font-medium">Valor Total de Transações:</p>
                        <p className="text-2xl font-bold text-green-600">
                          R$ {saldoAdmin}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;