import bcrypt from 'bcrypt';
import Empresario from '../models/Empresario.js';
import jwt from 'jsonwebtoken'; // Adicionando jwt

class EmpresarioController {
  // Método para cadastrar um novo empresário
  static async cadastrarEmpresario(req, res) {
    try {
      const { email, senha, validadeCashback, ...rest } = req.body;

      // Verifica se o email já está cadastrado
      const empresarioExistente = await Empresario.findOne({ email });
      if (empresarioExistente) {
        return res.status(400).json({ message: "Email já cadastrado" });
      }

      // Valida se a data de validade do cashback é futura
      const dataAtual = new Date();
      if (new Date(validadeCashback) <= dataAtual) {
        return res.status(400).json({ message: "A data de validade do cashback deve ser posterior ao dia atual." });
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
}

export default EmpresarioController;
