import bcrypt from 'bcrypt';
import Empresario from '../models/Empresario.js';
import jwt from 'jsonwebtoken'; // Adicionando jwt
import Produto from '../models/Produtos.js';

class EmpresarioController {
  // Método para cadastrar um novo empresário
  static async cadastrarEmpresario(req, res) {
    try {
      const { email, senha, ...rest } = req.body;

      // Verifica se o email já está cadastrado
      const empresarioExistente = await Empresario.findOne({ email });
      if (empresarioExistente) {
        return res.status(400).json({ message: "Email já cadastrado" });
      }

      // Criptografa a senha antes de salvar
      const hashedPassword = await bcrypt.hash(senha, 10);

      // Cria um novo empresário no banco de dados
      const novoEmpresario = await Empresario.create({
        ...rest,
        email,
        senha: hashedPassword, // Armazena a senha criptografada
      });

      // Gera o token JWT para login automático
      const token = jwt.sign({ id: novoEmpresario._id }, 'seuSegredo', { expiresIn: '1h' });

      // Remove a senha da resposta para não expô-la
      const { senha: _, ...empresarioSemSenha } = novoEmpresario._doc;

      // Resposta de sucesso com o token
      res.status(201).json({
        message: "Empresário cadastrado com sucesso",
        empresario: empresarioSemSenha,
        token, // Envia o token no retorno
      });
    } catch (erro) {
      // Tratamento de erro
      res.status(500).json({ message: `${erro.message} - falha ao cadastrar empresário` });
    }
  }

  // Método para login de empresário
  static async login(req, res) {
    const { emailCnpj, senha } = req.body;

    try {
      const empresario = await Empresario.findOne({
        $or: [{ email: emailCnpj }, { cnpj: emailCnpj }],
      });

      if (!empresario) {
        return res.status(404).json({ message: "Empresário não encontrado" });
      }

      const senhaValida = await bcrypt.compare(senha, empresario.senha);

      if (!senhaValida) {
        return res.status(401).json({ message: "Senha incorreta" });
      }

      // Gera o token JWT
      const token = jwt.sign({ id: empresario._id }, 'seuSegredo', { expiresIn: '1h' });

      // Sucesso - retorna o empresário autenticado e o token (sem expor a senha)
      const { senha: _, ...empresarioSemSenha } = empresario._doc;
      res.status(200).json({ message: "Login bem-sucedido", empresario: empresarioSemSenha, token });
    } catch (error) {
      res.status(500).json({ message: `${error.message} - falha ao fazer login` });
    }
  }

  static async listarEmpresarios(req, res) {
    try {
      const empresarios = await Empresario.find();
      res.status(200).json(empresarios);
    } catch (erro) {
      res.status(500).json({ message: `${erro.message} - falha ao listar empresários` });
    }
  }

  static async listarEmpresarioPorId(req, res) {
    try {
      const empresarioId = req.params.id; // Obtém o ID do empresário dos parâmetros da URL
  
      // Busca o empresário pelo ID
      const empresario = await Empresario.findById(empresarioId);
  
      if (!empresario) {
        return res.status(404).json({ message: "Empresário não encontrado" });
      }
  
      // Exclui a senha antes de enviar a resposta
      const { senha, ...empresarioSemSenha } = empresario._doc;
      res.status(200).json(empresarioSemSenha);
    } catch (erro) {
      res.status(500).json({ message: `${erro.message} - falha ao buscar empresário` });
    }
  }

  // Método para atualizar os dados do empresário (UPDATE)
  static async atualizarEmpresario(req, res) {
    try {
      const { 
        nome, 
        email, 
        loja, 
        cnpj, 
        cashback, 
        validadeCashback,
        saldo 
      } = req.body;
      
      const empresarioId = req.params.id; // Obtém o ID do empresário da URL
      
      // Verifica se o empresário existe
      const empresario = await Empresario.findById(empresarioId);
      
      if (!empresario) {
        return res.status(404).json({ message: "Empresário não encontrado" });
      }
      
      // Atualiza os dados do empresário
      if (nome) empresario.nome = nome;
      if (email) empresario.email = email;
      if (loja) empresario.loja = loja; 
      if (cnpj) empresario.cnpj = cnpj;
      if (cashback) empresario.cashback = cashback;
      if (validadeCashback) empresario.validadeCashback = validadeCashback;
      if (saldo) empresario.saldo = saldo;

      
      // Salva as alterações no banco de dados
      await empresario.save();
      
      // Retorna a resposta com os dados atualizados (excluindo a senha)
      const { senha, ...empresarioAtualizado } = empresario._doc;
      
      res.status(200).json({
        message: "Dados do empresário atualizados com sucesso",
        empresario: empresarioAtualizado,
      });
    } catch (erro) {
      console.error('Erro ao atualizar saldo do empresário:', erro.message);
      res.status(500).json({ 
        message: `${erro.message} - falha ao atualizar dados do empresário` 
      });
    }
  }

  static async deletarEmpresario(req, res) {
    try {
      const empresarioId = req.params.id; // Obtém o ID do empresário da URL
  
      // Verifica se o empresário existe
      const empresario = await Empresario.findById(empresarioId);
      if (!empresario) {
        return res.status(404).json({ message: "Empresário não encontrado" });
      }
  
      // Primeiro, delete todos os produtos associados ao empresário
      await Produto.deleteMany({ empresario: empresarioId });
  
      // Remove o empresário do banco de dados
      await Empresario.findByIdAndDelete(empresarioId);
  
      res.status(200).json({
        message: "Empresário e todos os seus produtos foram deletados com sucesso"
      });
    } catch (erro) {
      res.status(500).json({
        message: `${erro.message} - falha ao deletar empresário`
      });
    }
  }

}

export default EmpresarioController;
