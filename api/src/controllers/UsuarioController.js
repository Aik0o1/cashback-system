import bcrypt from 'bcrypt';
import Usuario from "../models/Usuario.js";

class UsuarioController {
  static async cadastrarUsuario(req, res) {
    try {
      const { email, password, saldoInicial = 0, ...rest } = req.body;

      const usuarioExistente = await Usuario.findOne({ email });
      if (usuarioExistente) {
        return res.status(400).json({ message: "Email já cadastrado" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const novoUsuario = await Usuario.create({
        ...rest,
        email,
        password: hashedPassword,
        saldo: saldoInicial
      });

      const { password: _, ...usuarioSemSenha } = novoUsuario._doc;

      res.status(201).json({ message: "Usuário cadastrado com sucesso", usuario: usuarioSemSenha });
    } catch (erro) {
      res.status(500).json({ message: `${erro.message} - falha ao cadastrar usuário` });
    }
  }
}

export default UsuarioController;