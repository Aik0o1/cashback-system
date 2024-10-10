import bcrypt from 'bcrypt';
import user from "../models/Users.js";
import jwt from 'jsonwebtoken';

class UserController {
  static async cadastrarUser(req, res) {
    try {
      const { password, ...rest } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const novoUser = await user.create({ ...rest, password: hashedPassword });

      // Gera o token JWT
      const token = jwt.sign({ id: novoUser._id, userType: novoUser.userType }, 'seuSegredo', { expiresIn: '1h' });

      // Retorna o usuário cadastrado, o token e a mensagem de sucesso
      res.status(201).json({ 
        message: "Cadastrado com sucesso", 
        user: novoUser, 
        token 
      });
    } catch (erro) {
      res.status(500).json({ message: `${erro.message} - falha ao cadastrar user` });
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

      const token = jwt.sign({ id: usuario._id, userType: usuario.userType }, 'seuSegredo', { expiresIn: '1h' });

      const { password: _, ...usuarioSemSenha } = usuario._doc;
      res.status(200).json({ message: "Login bem-sucedido", usuario: usuarioSemSenha, token });
    } catch (error) {
      res.status(500).json({ message: `${error.message} - falha ao fazer login` });
    }
  }

}

export default UserController;
