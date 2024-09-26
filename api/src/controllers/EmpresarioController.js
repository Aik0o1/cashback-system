import bcrypt from 'bcrypt'
import Empresario from '../models/Empresario.js'

class EmpresarioController {
    static async cadastrarEmpresario(req, res){
        try{
            const { email, senha, ...rest } = req.body;
            
            const empresarioExistente = await Empresario.findOne({ email });
            if (empresarioExistente) {
                return res.status(400).json({ message: "Email já cadastrado"});
            }

            const hashedPassword = await bcrypt.hash(senha, 10);

            const novoEmpresario = await Empresario.create({ ...rest, email, senha: hashedPassword });

            const { senha: _, ...empresaroSemSenha } = novoEmpresario._doc;
            res.status(201).json({ message: "Empresario cadastrado com sucesso", empresario: empresaroSemSenha});  
        } catch (erro) {
            res.status(500).json({ message: `${erro.message} - falha ao cadastrar empresário` });
        }
    }
}

export default EmpresarioController;