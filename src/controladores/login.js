const conexao = require("../conexao");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecret = require("../jwtSecret");
const schemaLoginUsuario = require("../validations/schemaLoginUsuario");

const loginUsuario = async (req, res) => {
  const { email, senha } = req.body;
  try {
    await schemaLoginUsuario.validate(req.body);
    const procurarEmail = "select * from usuarios where email = $1";
    const { rows, rowCount } = await conexao.query(procurarEmail, [email]);

    if (rowCount === 0)
      return res.status(404).json({
        mensagem:
          "Não foi encontrado nenhum usuário registrado com este e-mail",
      });

    const verificarSenha = await bcrypt.compare(senha, rows[0].senha);

    if (!verificarSenha)
      return res.status(401).json({ mensagem: "Senha incorreta" });

    const token = jwt.sign(
      {
        id: rows[0].id,
      },
      jwtSecret
    );

    return res.status(200).json({ token });
  } catch (error) {
    return res.status(400).json({ mensagem: error.message });
  }
};

module.exports = { loginUsuario };
