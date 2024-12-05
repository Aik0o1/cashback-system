// userController.js
import bcrypt from 'bcrypt';
import user from "../models/Users.js";
import jwt from 'jsonwebtoken';

class UserController {
  static async validateField(req, res) {
    const { field, value } = req.body;
    
    try {
      const query = { [field]: value };
      const existingUser = await user.findOne(query);
      
      if (existingUser) {
        return res.status(400).json({
          message: `Este ${field} já está em uso`,
        });
      }
      
      res.status(200).json({ message: "Campo disponível" });
    } catch (error) {
      res.status(500).json({
        message: `Erro ao validar ${field}`,
        error: error.message,
      });
    }
  }

  static async listarUsuarios(req, res) {
    try {
      const usuarios = await user.find();
      res.status(200).json(usuarios);
    } catch (erro) {
      res.status(500).json({ message: `${erro.message} - falha ao listar usuários` });
    }
  }

  static async listarUsuarioPorId(req, res) {
    try {
      const usuarioId = req.params.id; // Obtém o ID do empresário dos parâmetros da URL
  
      const usuario = await user.findById(usuarioId);
  
      if (!usuario) {
        return res.status(404).json({ message: "Usuario não encontrado" });
      }
  
      // Exclui a senha antes de enviar a resposta
      const { password, ...usuarioSemSenha } = usuario._doc;
      res.status(200).json(usuarioSemSenha);
    } catch (erro) {
      res.status(500).json({ message: `${erro.message} - falha ao buscar usuário` });
    }
  }


  static async cadastrarUser(req, res) {
    try {
      // Validar username e email novamente antes de criar
      const existingUsername = await user.findOne({ username: req.body.username });
      const existingEmail = await user.findOne({ email: req.body.email });

      if (existingUsername) {
        return res.status(400).json({ message: "Username já está em uso" });
      }

      if (existingEmail) {
        return res.status(400).json({ message: "Email já está em uso" });
      }

      const { password, ...rest } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const novoUser = await user.create({ ...rest, password: hashedPassword });

      const token = jwt.sign(
        { id: novoUser._id, userType: novoUser.userType },
        'seuSegredo',
        { expiresIn: '1h' }
      );

      res.status(201).json({ 
        message: "Cadastrado com sucesso", 
        user: novoUser, 
        token 
      });
    } catch (erro) {
      res.status(500).json({ 
        message: `${erro.message} - falha ao cadastrar usuário` 
      });
    }
  }
  
  static async login(req, res) {
    const { email, senha } = req.body;

    try {
      const usuario = await user.findOne({
        $or: [{ email: email }, { username: email }],
      });

      if (!usuario) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.password);

      if (!senhaValida) {
        return res.status(401).json({ message: "Senha incorreta" });
      }

      const token = jwt.sign(
        { id: usuario._id, userType: usuario.userType },
        'seuSegredo',
        { expiresIn: '1h' }
      );

      const { password: _, ...usuarioSemSenha } = usuario._doc;
      res.status(200).json({
        message: "Login bem-sucedido",
        usuario: usuarioSemSenha,
        token
      });
    } catch (error) {
      res.status(500).json({
        message: `${error.message} - falha ao fazer login`
      });
    }
  }

  static async atualizarUsuario(req, res) {
    try {
      const { username, firstName, lastName, email, password, userType } = req.body;
      const userId = req.params.id; // Obtém o ID do empresário da URL
  
      // Verifica se o empresário existe
      const usuario = await user.findById(userId);
      if (!usuario) {
        return res.status(404).json({ message: "Empresário não encontrado" });
      }
  
      // Atualiza os dados do empresário
      if (username) usuario.username = username;
      if (firstName) usuario.firstName = firstName;
      if (lastName) usuario.lastName = lastName;
      if (email) usuario.email = email;
      if (password) usuario.password = password;
      if (userType) usuario.userType = userType;

  
      // Salva as alterações no banco de dados
      await usuario.save();
  
      // Retorna a resposta com os dados atualizados (excluindo a senha)
      const { senha, ...usuarioAtualizado } = usuario._doc;
      res.status(200).json({
        message: "Dados do usuário atualizados com sucesso",
        usuario: usuarioAtualizado,
      });
    } catch (erro) {
      res.status(500).json({ message: `${erro.message} - falha ao atualizar dados do usuário` });
    }
  }
  static async deletarUsuario(req, res) {
  try {
    const userId = req.params.id; // Obtém o ID do usuário da URL

    // Verifica se o usuário existe
    const usuario = await user.findById(userId);
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Remove o usuário do banco de dados
    await user.findByIdAndDelete(userId);

    res.status(200).json({
      message: "Usuário deletado com sucesso"
    });
  } catch (erro) {
    res.status(500).json({ 
      message: `${erro.message} - falha ao deletar usuário` 
    });
  }
}

  
}

export default UserController;