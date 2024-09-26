import bcrypt from 'bcrypt'
import Empresario from '../models/Empresario.js'

class EmpresarioController {
    static async cadastrarEmpresario(req, res){
        try{
            const { email, password, ...rest } = req.body;
            
            const empresarioExistente = await Empresario.findOne({ email });
            if (empresarioExistente) {
                return res.status(400).json({ message: "Email já cadastrado"});
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const novoEmpresario = await Empresario.create({ ...rest, email, password: hashedPassword });

            const { password: _, ...empresaroSemSenha } = novoEmpresario._doc;
            res.status(201).json({ message: "Empresario cadastrado com sucesso", empresario: empresaroSemSenha});  
        } catch (erro) {
            res.status(500).json({ message: `${erro.message} - falha ao cadastrar empresário` });
        }
    }
}

export default EmpresarioController;