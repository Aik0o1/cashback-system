import bcrypt from 'bcrypt';
import user from "../models/Users.js";

class UserController {
  static async cadastrarUser(req, res) {
    try {
      const { password, ...rest } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const novoUser = await user.create({ ...rest, password: hashedPassword });
      res.status(201).json({ message: "Cadastrado com sucesso", user: novoUser });
    } catch (erro) {
      res.status(500).json({ message: `${erro.message} - falha ao cadastrar user` });
    }
  }

}

export default UserController;
