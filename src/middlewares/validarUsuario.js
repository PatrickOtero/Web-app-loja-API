const conexao = require("../conexao");
const jwt = require("jsonwebtoken");
const jwtSecret = require("../jwtSecret");

const validarUsuario = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) return res.status(401).json({mensagem: "Token precisa ser validado"});

    try {
        const token = authorization.replace("Bearer", "").trim();

        const { id } = jwt.verify(token, jwtSecret);

        const verificarUsuario = "select * from usuarios where id = $1";
        const {rows, rowCount} = await conexao.query(verificarUsuario, [id]);

        if (rowCount === 0) return res.status(404).json({mensagem: "Não existe um usuário cadastrado com este id"});

        const {senha, ... usuario} = rows[0];
        req.usuario = usuario;

        next();

    } catch (error) {
        return res.status(400).json({mensagem: error.message});
    }
};

module.exports = validarUsuario;