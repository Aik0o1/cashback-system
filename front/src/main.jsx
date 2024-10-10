import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
// import App from './App.jsx'
import Loja from './pages/Loja'
import EmpresarioLogin from './pages/Empresario/LoginEmpresario'
import './index.css'
import CadastroProduto from './pages/Empresario/CadastroProduto'
import App from './main/App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App/>    
  </StrictMode>,
)
