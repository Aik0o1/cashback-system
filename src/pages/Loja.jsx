import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';

function Loja() {
  const [produtos, setProdutos] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para o termo de pesquisa
  const [userName, setUserName] = useState(null); // Estado para o nome do usuário logado

  // Função para buscar os produtos da API
  const fetchProdutos = async () => {
    try {
      const response = await axios.get('https://cashback-testes.onrender.com/produtos');
      setProdutos(response.data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  // Verifica se o usuário está logado e obtém o nome do localStorage
  const checkUserLoggedIn = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserName(storedUser); // Atualiza o estado com o nome do usuário
    }
  };

  // Função de logout para limpar o localStorage e atualizar o estado
  const handleLogout = () => {
    localStorage.removeItem('user'); // Remove o usuário do localStorage
    setUserName(null); // Reseta o estado de nome de usuário
  };

  useEffect(() => {
    fetchProdutos();  // Busca os produtos quando o componente é montado
    checkUserLoggedIn(); // Verifica se o usuário está logado ao montar o componente
  }, []);

  // Função para lidar com a mudança no campo de pesquisa
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Função para filtrar os produtos com base no termo de pesquisa
  const filteredProdutos = produtos.filter((produto) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      produto.nome.toLowerCase().includes(lowerCaseSearchTerm) ||
      produto.descricao.toLowerCase().includes(lowerCaseSearchTerm) ||
      produto.categoria.toLowerCase().includes(lowerCaseSearchTerm)
    );
  });

  // Função para simular a compra de um produto
  const handleCompra = (produtoId) => {
    alert(`Produto com ID ${produtoId} foi comprado!`);
    // Aqui você pode implementar a lógica de redirecionar para uma página de checkout ou processar o pedido
  };

  return (
    <div className="container min-h-screen fundo-login max-w-full">
      <header className="bg-zinc-900 p-4 ext-white flex justify-between items-center">

        <div>
          <span className="bg-lime-600 text-white py-3 px-6 rounded-md text-lg font-bold shadow-lg">Uespi CashBack</span>
          <span className="text-white font-bold text-2xl">  - Produtos</span>
        </div>

        {/* Barra de Pesquisa */}
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar produtos..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="px-16 py-2 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-lime-600"
          />
          {/* Ícone de Lupa Opcional */}
          <svg
            className="w-5 h-5 absolute right-3 top-3 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Verificação se o usuário está logado */}
        <nav className="flex space-x-4">
          {userName ? (
            <>
              <span className="text-white font-bold text-2xl">Bem-vindo, {userName}</span>
              <button
                onClick={handleLogout}
                className="text-white bg-red-500 px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="bg-lime-600 text-white py-3 px-6 rounded-lg text-lg font-bold shadow-lg hover:bg-lime-700 transition-colors">
                Login
              </a>
             
              <a href="/cadastro" className="bg-lime-600 text-white py-3 px-6 rounded-lg text-lg font-bold shadow-lg hover:bg-lime-700 transition-colors">
                Cadastro
              </a>
            </>
          )}
        </nav>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
        {filteredProdutos.length > 0 ? (
          filteredProdutos.map((produto) => (
            <Card key={produto._id} className="shadow-lg p-6">
              <div className="flex flex-col items-center">
                {produto.imagemUrl ? (
                  <img
                    src={produto.imagemUrl}
                    alt={produto.nome}
                    className="rounded-lg h-48 object-cover mb-4"
                  />
                ) : (
                  <img
                    src="default-image.png"
                    alt="Imagem não disponível"
                    className="rounded-lg h-48 object-cover mb-4"
                  />
                )}
                
                <h2 className="text-xl font-semibold mb-2">{produto.nome}</h2>
                <p className="text-gray-600 mb-2">Descrição: {produto.descricao}</p>
                <p className="text-lg font-bold text-blue-500">Preço: R$ {produto.preco.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Categoria: {produto.categoria}</p>

                {/* Exibe detalhes do empresário associado ao produto */}
                {produto.empresario && (
                  <>
                    <p className="text-green-500 font-bold">Cashback: {produto.empresario.cashback}%</p>
                    <p className="text-red-500 font-bold">
                      Validade: {new Date(produto.empresario.validadeCashback).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600 mt-2">Empresário: {produto.empresario.loja}</p>
                  </>
                )}

                {/* Botão de Comprar */}
                <button
                  onClick={() => handleCompra(produto._id)}
                  className="mt-4 px-6 py-2 bg-lime-600 text-white rounded-md hover:bg-lime-700"
                >
                  Comprar
                </button>
              </div>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">Nenhum produto encontrado.</p>
        )}
      </div>
    </div>
  );
}

export default Loja;
