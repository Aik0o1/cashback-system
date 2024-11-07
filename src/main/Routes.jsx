import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Empresario/Dashboard';
import EmpresarioLogin from '../pages/Empresario/LoginEmpresario';
import CadastroProduto from '../pages/Empresario/CadastroProduto';
import Loja from '../pages/Loja';
import CadastroEmpresario from '../pages/Empresario/CadastroEmpresario';
import CadastroUsuario from '@/pages/Usuario/CadastroUsuario';
import LoginUsuario from '@/pages/Usuario/LoginUsuario';
import Login from '@/pages/Login';
import Cadastro from '@/pages/Cadastro';
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

      </Routes>
    </Router>
  );
};

export default AppRoutes;