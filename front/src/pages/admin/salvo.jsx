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
  const [updateSaldoAmount, setUpdateSaldoAmount] = useState('');
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
    produtoId: '',
    produtoNome: ''
  });

  const navigate = useNavigate();
  const StatCard = ({ title, value, icon: Icon, bgColor }) => (
    <Card className="relative overflow-hidden bottom-3 top-3">
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
    const updateAdminSaldo = async () => {
      const storedToken = localStorage.getItem('token');
      const storedId = localStorage.getItem('userId');
      const storedUser = localStorage.getItem('user');

      if (!storedUser || !storedToken || !storedId) {
        navigate('/login');
        return;
      }

      try {
        // Calcula o saldo total baseado nas transações
        const totalSaldo = transacoes.reduce((acc, t) => {
          if (t.statusPagamentoAdmin !== 'paga') {
            // Somar apenas transações que ainda não foram pagas
            return acc + t.valorTotal;
          }
          return acc;
        }, 0);

        // Atualiza o saldo do admin no backend
        const response = await axios.put(
          `https://cashback-testes.onrender.com/users/admin/saldo/${storedId}`,
          { saldo: totalSaldo },
          {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
          }
        );

        setSaldoAdmin(response.data.saldo);
      } catch (error) {
        console.error('Erro ao atualizar saldo:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    // Atualiza o saldo apenas se houver transações pendentes
    if (transacoes.length > 0) {
      updateAdminSaldo();
    }
  }, [transacoes, navigate]);

  const getSaldoAdmin = async () => {
    const storedToken = localStorage.getItem('token'); // Token armazenado no localStorage
    const storedId = localStorage.getItem('userId');   // ID do administrador armazenado no localStorage

    if (!storedToken || !storedId) {
      console.error('Token ou ID do administrador não encontrado.');
      return;
    }

    try {
      const response = await axios.get(`https://cashback-testes.onrender.com/users/admin/saldo/${storedId}`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
        },
      });
      setSaldoAdmin(response.data.saldo); // Atualiza o estado com o saldo retornado
    } catch (error) {
      console.error('Erro ao buscar saldo do administrador:', error);
    }
  };


  useEffect(() => {
    getSaldoAdmin(); // Chama a função para buscar o saldo ao montar o componente
  }, []);



  const handleEmpresarioPayment = async (transacao) => {
    const storedToken = localStorage.getItem('token');
    const adminId = localStorage.getItem('userId');

    try {
      // Obtém saldo atual do admin
      if (!window.confirm('Tem certeza que deseja realizar este pagamento?')) return;
      
      const adminResponse = await axios.get(
        `https://cashback-testes.onrender.com/users/admin/saldo/${adminId}`,
        {
          headers: { 'Authorization': `Bearer ${storedToken}` },
        }
      );
      const currentAdminSaldo = adminResponse.data.saldo;

      // Obtém dados do empresário
      const empresarioResponse = await axios.get(
        `https://cashback-testes.onrender.com/empresario/${transacao.empresario._id}`,
        {
          headers: { 'Authorization': `Bearer ${storedToken}` },
        }
      );
      const empresario = empresarioResponse.data;

      // Calcula novos saldos
      const newAdminSaldo = currentAdminSaldo - transacao.valorTotal;
      const newEmpresarioSaldo = (empresario.saldo || 0) + transacao.valorTotal;

      // Atualiza saldos e status no backend
      await Promise.all([
        axios.put(
          `https://cashback-testes.onrender.com/users/admin/saldo/${adminId}`,
          { saldo: newAdminSaldo },
          { headers: { 'Authorization': `Bearer ${storedToken}` } }
        ),
        axios.put(
          `https://cashback-testes.onrender.com/empresario/atualizar/${transacao.empresario._id}`,
          { ...empresario, saldo: newEmpresarioSaldo },
          { headers: { 'Authorization': `Bearer ${storedToken}` } }
        ),
        axios.put(
          `https://cashback-testes.onrender.com/transacoes/atualizarsaldo/${transacao._id}`,
          { ...transacao, statusPagamentoAdmin: 'paga' },
          { headers: { 'Authorization': `Bearer ${storedToken}` } }
        ),
      ]);

      // Atualiza estado local
      setSaldoAdmin(newAdminSaldo);
      setTransacoes((prevTransacoes) =>
        prevTransacoes.map((t) =>
          t._id === transacao._id
            ? { ...t, statusPagamentoAdmin: 'paga' }
            : t
        )
      );

      setAlert({
        show: true,
        message: 'Pagamento realizado com sucesso!',
        type: 'success',
      });
    } catch (error) {
      console.error('Erro ao processar pagamento:', error.response?.data || error.message);
      setAlert({
        show: true,
        message: 'Erro ao processar pagamento. Por favor, tente novamente.',
        type: 'error',
      });
    }
  };

  const fetchData = async (token) => {
    try {
      // Fetch users
      const usersResponse = await axios.get('https://cashback-testes.onrender.com/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(usersResponse.data);

      // Fetch empresarios
      const empresariosResponse = await axios.get('https://cashback-testes.onrender.com/empresario', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmpresarios(empresariosResponse.data);

      // Fetch all transactions
      const transacoesResponse = await axios.get('https://cashback-testes.onrender.com/transacoes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransacoes(transacoesResponse.data);
      console.log(transacoesResponse.data)

      const produtosResponse = await axios.get('https://cashback-testes.onrender.com/produtos', {
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
  
      // Produto filter (agora com nome do produto)
      const produtoMatch = !transactionFilters.produtoNome ||
        transacao.produto?.nome.toLowerCase().includes(transactionFilters.produtoNome.toLowerCase());
  
      // Verifica se todos os filtros coincidem
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

      await axios.delete(`https://cashback-testes.onrender.com/users/${userId}`, {
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

      await axios.delete(`https://cashback-testes.onrender.com/empresario/${userId}`, {
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
          `https://cashback-testes.onrender.com/users/atualizar/${editingUser._id}`,
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



<TabsContent value="transacoes" className="">
            <StatCard
              title="Saldo"
              value={`R$ ${saldoAdmin.toFixed(2)}`}
              icon={DollarSign}
              bgColor="bg-emerald-500">


            </StatCard>
            <Card className="relative top-5">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Histórico de Transações</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setTransactionFilters({
                      startDate: '',
                      endDate: '',
                      empresarioId: '',
                      usuarioId: '',
                      produtoId: '',
                      produtoNome: ''
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
  <label className="block text-sm font-medium text-gray-700">Produto</label>
  <select
    value={transactionFilters.produtoNome} // Atualiza com o valor do nome do produto
    onChange={(e) => setTransactionFilters(prev => ({
      ...prev,
      produtoNome: e.target.value // Atualiza com o nome do produto selecionado
    }))}
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
  >
    <option value="">Produtos</option>
    {produtos.map(produto => (
      <option key={produto._id} value={produto.nome}>
        {produto.nome}
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
                      <th className="text-left p-2">Produto</th>
                      <th className="text-left p-2">Usuário</th>
                      <th className="text-left p-2">Empresário</th>
                      <th className="text-left p-2">Valor Compra</th>
                      <th className="text-left p-2">Valor Cashback</th>
                      <th className="text-left p-2">Valor Total</th>
                      <th className="text-left p-2">Data</th>
                      <th className="text-left p-2">Status de venda</th>
                      <th className="text-left p-2">Status de Pagamento</th>
                      <th className="text-left p-2">Pagar Empresário</th>

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

                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${transacao.statusPagamentoAdmin === 'paga'
                              ? 'bg-green-100 text-green-800'
                              : transacao.statusPagamentoAdmin === 'pendente'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {transacao.statusPagamentoAdmin}
                          </span>
                        </td>
                        <td>

                          <Button
                            className='bg-green-500'
                            variant="outline"
                            size="sm"
                            onClick={() => handleEmpresarioPayment(transacao)}
                            disabled={transacao.statusPagamentoAdmin === 'paga'}
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className='top-5'>
                    <tr c>
                      <StatCard
                        title="Total Geral"
                        value={`R$ ${transacoes.reduce((acc, t) => acc + t.valorTotal, 0).toFixed(2)}`}
                        icon={DollarSign}
                        bgColor="bg-green-700">


                      </StatCard>

                    </tr>
                  </tfoot>
                </table>
                {/* Pagination remains the same */}
              </CardContent>
            </Card>
          </TabsContent>