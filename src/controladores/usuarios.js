const conexao = require("../conexao");
const bcrypt = require("bcrypt");

function constarCampos (body) {
    if(!body.nome) return "O campo 'nome' é necessário";
    if(!body.email) return "O campo 'email' é necessário";
    if(!body.senha) return "O campo 'senha' é necessário";
    if(!body.nome_loja) return "O campo 'nome_loja' é necessário";
}

const detalharUsuario = async (req, res) => {
    const {usuario} = req;

    if (!usuario) return res.status(401).json({mensagem: "Você precisa estar autenticado para poder efetuar esta requisição"});

    try {
        const obterDadosDoUsuario = "select * from usuarios where id = $1"
        const { rowCount } = await conexao.query(obterDadosDoUsuario, [usuario.id]);

        if (rowCount === 0) return res.status(401).json({mensagem: "Seu token não foi validado ou o nosso servidor encontrou um problema, tente novamente mais tarde"});

        return res.status(200).json(usuario);
    } catch (error) {
        return res.status(400).json({mensagem: error.message});
    }
};

const cadastrarUsuario = async (req, res) => {
    const {nome, email, senha, nome_loja} = req.body;

    const mensagem = constarCampos(req.body);
    if(mensagem) return res.status(400).json({mensagem});

    try {
        const verificarEmail = "select * from usuarios where email = $1"
        const {rowCount} = await conexao.query(verificarEmail, [email]);

        if (rowCount > 0) return res.status(403).json({mensagem: "Já existe um usuário utilizando este e-mail"});

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const criarUsuario = "insert into usuarios(nome, email, senha, nome_loja) values($1, $2, $3, $4)"
        const {rowCount: rowCount2} = await conexao.query(criarUsuario, [nome, email, senhaCriptografada, nome_loja]);

        if (rowCount2 === 0) return res.status(404).json({mensagem: "Ocorreu um erro durante o seu registro, tente novamente mais tarde"});

        return res.status(204).send();
    } catch(error) {
        return res.status({mensagem: error.message});
    }
    
};

const atualizarUsuario = async (req, res) => {
    const {nome, email, senha, nome_loja} = req.body;
    const {usuario} = req;

    if (!usuario) return res.status(401).json({mensagem: "Você precisa estar autenticado para poder efetuar esta requisição"});

    const mensagem = constarCampos(req.body);
    if(mensagem) return res.status(400).json({mensagem});

    try {
        const procurarUsuario = "select * from usuarios where id = $1"
        const {rowCount} = await conexao.query(procurarUsuario, [usuario.id]);

        if (rowCount === 0) return res.status(404).json({mensagem: "Não há nenhum usuário com este id"});

        const verificarEmail = "select * from usuarios where email = $1 and id != $2"
        const {rowCount: rowCount1} = await conexao.query(verificarEmail, [email, usuario.id]);

        if (rowCount1 > 0) return res.status(401).json({mensagem: "Já existe um usuário utilizando este e-mail"});

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const mudarUsuario = "update usuarios set nome = $1, email = $2, senha = $3, nome_loja = $4 where id = $5"
        const {rowCount: rowCount2} = await conexao.query(mudarUsuario, [nome, email, senhaCriptografada, nome_loja, usuario.id]);

        if (rowCount2 === 0) return res.status(404).json({mensagem: "Ocorreu um erro ao tentar alterar seu perfil, tente novamente mais tarde"});

        return res.status(204).send();
    } catch (error) {
        return res.status(400).json({mensagem: error.message});
    }
};

module.exports = {detalharUsuario, cadastrarUsuario, atualizarUsuario}
