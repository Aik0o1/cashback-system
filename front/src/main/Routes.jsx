import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Empresario/Dashboard.jsx';
import EmpresarioLogin from '../pages/Empresario/LoginEmpresario.jsx';
import CadastroProduto from '../pages/Empresario/CadastroProduto.jsx';
import Loja from '../pages/Loja.jsx';
import CadastroEmpresario from '../pages/Empresario/CadastroEmpresario.jsx';
import CadastroUsuario from '@/pages/Usuario/CadastroUsuario.jsx';
import LoginUsuario from '@/pages/Usuario/LoginUsuario.jsx';
import Login from '@/pages/Login.jsx';
import Cadastro from '@/pages/Cadastro.jsx';
import Carrinho from '@/pages/Usuario/Carrinho.jsx';
import MeusPedidos from '@/pages/Usuario/Pedidos.jsx'
import AdminDashboard from '@/pages/admin/adminDashboard.jsx';
const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="/empresarioLogin" element={<EmpresarioLogin />} />
        <Route path="/cadastroProduto" element={<CadastroProduto />} />
        <Route path="/" element={<Loja />} />
        <Route path="/cadastroEmpresario" element={<CadastroEmpresario />} />
        <Route path="/cadastroUsuario" element={<CadastroUsuario />}/>
        <Route path="/loginUsuario" element={<LoginUsuario />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/cadastro" element={<Cadastro />}/>
        <Route path="/carrinho" element={<Carrinho />}/>
        <Route path="/pedidos" element={<MeusPedidos />}/>
        <Route path="/admin"  element={<AdminDashboard />}/>


      </Routes>
    </Router>
  );
};

export default AppRoutes;