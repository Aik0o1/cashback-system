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
}

export default UserController;