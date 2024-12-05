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
  AlertCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [empresarios, setEmpresarios] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('usuarios');
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Verify admin access  
    try {
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      
      if (!user || user.userType !== 'admin') {
        // navigate('/login');
        return;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      // navigate('/login');
      return;
    }
  
    const fetchData = async () => {
      try {
        // Fetch users
        const usersResponse = await axios.get('https://cashback-testes.onrender.com/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(usersResponse.data);
        console.log(users)
  
        // Fetch empresarios (filter users with userType 'empresario')
        const empresariosResponse = await axios.get('https://cashback-testes.onrender.com/empresario', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmpresarios(empresariosResponse.data);
        console.log(empresariosResponse)

        // Fetch all transactions
        const transacoesResponse = await axios.get('https://cashback-testes.onrender.com/transacoes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTransacoes(transacoesResponse.data);
        console.log(transacoesResponse.data)
  
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
  // console.log(transacoes)

  const exportTransacoesToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(transacoes);
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
        window.location.reload()
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
        {/* <div>
          <label className="block text-sm font-medium text-gray-700">Tipo de Usuário</label>
          <select
            value={formData.userType}
            onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="usuario">Usuário</option>
            <option value="empresario">Empresário</option>
            <option value="admin">Admin</option>
          </select>
        </div> */}
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
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                        {users
                          .filter(user => 
                            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            `${user._id} ${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((user) => (
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
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Loja </th>
                      <th className="text-left p-2">Nome Completo</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-right p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                  {empresarios.map((empresario) => (
                      <tr key={empresario._id} className="border-b hover:bg-zinc-50">
                        <td className="p-2">{empresario.loja}</td>
                        <td className="p-2">{empresario.nome}</td>
                        <td className="p-2">{empresario.email}</td>
                        <td className="p-2 text-right">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteUser(empresario._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transacoes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Histórico de Transações</CardTitle>
                <Button 
                  variant="outline" 
                  onClick={exportTransacoesToExcel}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Usuário</th>
                      <th className="text-left p-2">Empresário</th>
                      <th className="text-left p-2">Valor</th>
                      <th className="text-left p-2">Data</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transacoes.map((transacao) => (
                      <tr key={transacao._id} className="border-b hover:bg-zinc-50">
                        <td className="p-2">{transacao._id}</td>
                        <td className="p-2">{transacao.usuario?._id || 'N/A'}</td>
                        <td className="p-2">{transacao.empresario?._id || 'N/A'}</td>
                        <td className="p-2">R$ {transacao.valorCompra.toFixed(2)}</td>
                        <td className="p-2">
                          {new Date(transacao.dataCompra).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-2">
                          <span 
                            className={`px-2 py-1 rounded-full text-xs ${
                              transacao.status === 'concluida' 
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
                      Criar Novo Usuário
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
                            'https://cashback-testes.onrender.com/usuarios', 
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
                          <option value="usuario">Usuário</option>
                          <option value="empresario">Empresário</option>
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
                          R$ {transacoes.reduce((total, t) => total + t.valorCompra, 0).toFixed(2)}
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