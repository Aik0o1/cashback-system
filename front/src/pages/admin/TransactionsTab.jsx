import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  FileDown,
  DollarSign,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const TransactionsTab = ({
  transacoes,
  transactionFilters,
  setTransactionFilters,
  searchTerm,
  setSearchTerm,
  selectedTransactions,
  setSelectedTransactions,
  handleEmpresarioPayment,
  saldoAdmin,
  exportTransacoesToExcel,
  produtos,
  empresarios,
  users,
  StatCard
}) => {
  const [activeTransactionTab, setActiveTransactionTab] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Separate transactions by status
  const pendingTransactions = transacoes.filter(t => t.statusPagamentoAdmin !== 'paga');
  const paidTransactions = transacoes.filter(t => t.statusPagamentoAdmin === 'paga');

  // Filter transactions based on current filters
  const filterTransactions = (transactions) => {
    return transactions.filter(transacao => {
      const transactionDate = new Date(transacao.dataCompra);
      
      const startDateMatch = !transactionFilters.startDate ||
        transactionDate >= new Date(transactionFilters.startDate);
      
      const endDateMatch = !transactionFilters.endDate ||
        transactionDate <= new Date(transactionFilters.endDate);
      
      const empresarioMatch = !transactionFilters.empresarioId ||
        transacao.empresario?._id === transactionFilters.empresarioId;
      
      const usuarioMatch = !transactionFilters.usuarioId ||
        transacao.usuario?._id === transactionFilters.usuarioId;
      
      const produtoMatch = !transactionFilters.produtoNome ||
        transacao.produto?.nome.toLowerCase().includes(transactionFilters.produtoNome.toLowerCase());
      
      return startDateMatch && endDateMatch && empresarioMatch && usuarioMatch && produtoMatch;
    });
  };

  const getCurrentTransactions = () => {
    const filteredTransactions = filterTransactions(
      activeTransactionTab === 'pending' ? pendingTransactions : paidTransactions
    );
    return filteredTransactions;
  };

  // Pagination
  const totalPages = Math.ceil(getCurrentTransactions().length / itemsPerPage);
  const currentTransactions = getCurrentTransactions().slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const TransactionTable = ({ transactions }) => (
    <table className="w-full">
      <thead>
        <tr className="border-b">
          {activeTransactionTab === 'pending' && (
            <th className="text-left p-2">Selecionar</th>
          )}
          <th className="text-left p-2">Produto</th>
          <th className="text-left p-2">Usuário</th>
          <th className="text-left p-2">Empresário</th>
          <th className="text-left p-2">Valor de Compra</th>
          <th className="text-left p-2">Cashback</th>
          <th className="text-left p-2">Valor Total</th>
          <th className="text-left p-2">Data</th>
          <th className="text-left p-2">Status de venda</th>
          <th className="text-left p-2">Status de Pagamento</th>
          {activeTransactionTab === 'pending' && (
            <th className="text-left p-2">Pagar Empresário</th>
          )}
        </tr>
      </thead>
      <tbody>
        {transactions.map((transacao) => (
          <tr key={transacao._id} className="border-b hover:bg-zinc-50">
            {activeTransactionTab === 'pending' && (
              <td className="p-2">
                <Checkbox
                  checked={selectedTransactions.has(transacao._id)}
                  onCheckedChange={() => {
                    const newSelected = new Set(selectedTransactions);
                    if (newSelected.has(transacao._id)) {
                      newSelected.delete(transacao._id);
                    } else {
                      newSelected.add(transacao._id);
                    }
                    setSelectedTransactions(newSelected);
                  }}
                />
              </td>
            )}
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
              <span className={`px-2 py-1 rounded-full text-xs ${
                transacao.status === 'concluida'
                  ? 'bg-green-100 text-green-800'
                  : transacao.status === 'pendente'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {transacao.status}
              </span>
            </td>
            <td className="p-2">
              <span className={`px-2 py-1 rounded-full text-xs ${
                transacao.statusPagamentoAdmin === 'paga'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {transacao.statusPagamentoAdmin}
              </span>
            </td>
            {activeTransactionTab === 'pending' && (
              <td>
                <Button
                  className="bg-green-500 hover:bg-green-600"
                  size="sm"
                  onClick={() => {
                    if (!window.confirm(`Deseja realizar este pagamento?`)) {
                      return;
                    }
                    handleEmpresarioPayment(transacao);
                  }}
                >
                  <DollarSign className="h-4 w-4" />
                </Button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <>
      <StatCard
        title="Saldo"
        value={`R$ ${saldoAdmin.toFixed(2)}`}
        icon={DollarSign}
        bgColor="bg-emerald-500"
      />
      <Card className="relative top-5">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <CardTitle>Histórico de Transações</CardTitle>
            <Tabs value={activeTransactionTab} onValueChange={setActiveTransactionTab} className="ml-4">
              <TabsList>
                <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-100">
                  Pendentes ({pendingTransactions.length})
                </TabsTrigger>
                <TabsTrigger value="paid" className="data-[state=active]:bg-green-100">
                  Pagas ({paidTransactions.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
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
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
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
                value={transactionFilters.produtoNome}
                onChange={(e) => setTransactionFilters(prev => ({
                  ...prev,
                  produtoNome: e.target.value
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value="">Todos Produtos</option>
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

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Pesquisar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Batch Selection (Only for pending transactions) */}
          {activeTransactionTab === 'pending' && (
            <div className="mb-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  checked={selectedTransactions.size === pendingTransactions.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedTransactions(new Set(pendingTransactions.map(t => t._id)));
                    } else {
                      setSelectedTransactions(new Set());
                    }
                  }}
                />
                <span>Selecionar Todos</span>
              </div>
              {selectedTransactions.size > 0 && (
                <Button
                  onClick={() => {
                    if (!window.confirm(`Deseja realizar o pagamento de ${selectedTransactions.size} transações selecionadas?`)) {
                      return;
                    }
                    pendingTransactions
                      .filter(t => selectedTransactions.has(t._id))
                      .forEach(t => handleEmpresarioPayment(t));
                    setSelectedTransactions(new Set());
                  }}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Pagar Selecionados ({selectedTransactions.size})
                </Button>
              )}
            </div>
          )}

          {/* Transactions Table */}
          <TransactionTable transactions={currentTransactions} />

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
            </Button>
            <span>Página {currentPage} de {totalPages}</span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Próximo <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default TransactionsTab;