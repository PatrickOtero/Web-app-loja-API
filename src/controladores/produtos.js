const conexao = require("../conexao");
const schemaListarProduto = require("../validations/schemaListarProduto");
const schemaDetalharProduto = require("../validations/schemaDetalharProduto");
const schemaCadastrarProduto = require("../validations/schemaCadastrarProduto");
const schemaAtualizarProduto = require("../validations/schemaAtualizarProduto");
const schemaDeletarProduto = require("../validations/schemaDeletarProduto");

async function procurarProdutos(produtoId, usuarioId) {
  const procurarProduto = "select * from produtos where id = $1";
  const { rowCount } = await conexao.query(procurarProduto, [produtoId]);

  if (rowCount === 0) return "Não existe um produto com este id";

  const mostrarDados =
    "select * from produtos where id = $1 and usuario_id = $2";
  const { rows, rowCount: rowCount1 } = await conexao.query(mostrarDados, [
    produtoId,
    usuarioId,
  ]);

  if (rowCount1 === 0)
    return "Não existe um produto com este id vinculado ao seu perfil";

  return rows;
}

const listarProdutos = async (req, res) => {
  if (categoria) {
    try {
      await schemaListarProduto.validate(req);
      await schemaListarProduto.validate(req.query);
      const mostrarProdutos =
        "select * from produtos where usuario_id = $1 and categoria = $2";
      const { rows } = await conexao.query(mostrarProdutos, [
        usuario.id,
        categoria,
      ]);

      return res.status(200).json(rows);
    } catch (error) {
      return res.status(400).json({ mensagem: error.message });
    }
  }

  try {
    const mostrarProdutos = "select * from produtos where usuario_id = $1";
    const { rows } = await conexao.query(mostrarProdutos, [usuario.id]);

    return res.status(200).json(rows);
  } catch (error) {
    return res.status(400).json({ mensagem: error.message });
  }
};

const detalharProduto = async (req, res) => {
  const { id } = req.params;
  const { usuario } = req;

  if (!usuario)
    return res.status(401).json({
      mensagem:
        "Você precisa estar autenticado para poder efetuar esta requisição",
    });

  try {
    await schemaDetalharProduto.validate(req);
    await schemaDetalharProduto.validate(req.body);
    const resultado = await procurarProdutos(id, usuario.id);
    if (typeof resultado === "string")
      return res.status(400).json({ mensagem: resultado });

    return res.status(200).json(resultado[0]);
  } catch (error) {
    return res.status(400).json({ mensagem: error.message });
  }
};

const cadastrarProduto = async (req, res) => {
  const { nome, quantidade, categoria, preco, descricao, imagem } = req.body;
  const { usuario } = req;

  if (!usuario)
    return res.status(401).json({
      mensagem:
        "Você precisa estar autenticado para poder efetuar esta requisição",
    });

  if (quantidade <= 0)
    return res
      .status(400)
      .json({ mensagem: "Não é permitido cadastrar produtos sem estoque" });
  if (preco <= 0)
    return res.status(400).json({
      mensagem: "Não é permitido cadastrar produtos sem preço de venda",
    });

  try {
    await schemaCadastrarProduto.validade(req);
    await schemaCadastrarProduto.validade(req.body);
    const criarProduto =
      "insert into produtos(usuario_id, nome, quantidade, categoria, preco, descricao, imagem) values($1, $2, $3, $4, $5, $6, $7)";
    const { rowCount } = await conexao.query(criarProduto, [
      usuario.id,
      nome,
      quantidade,
      categoria,
      preco,
      descricao,
      imagem,
    ]);

    if (rowCount === 0)
      return res.status(401).json({
        mensagem:
          "Ocorreu um erro ao cadastrar seu produto ou não existe um usuário com este id, tente novamente mais tarde",
      });

    return res.status(204).send();
  } catch (error) {
    return res.status(400).json({ mensagem: error.message });
  }
};

const atualizarProduto = async (req, res) => {
  const { nome, quantidade, categoria, preco, descricao, imagem } = req.body;
  const { id } = req.params;
  const { usuario } = req;

  if (!usuario)
    return res.status(401).json({
      mensagem:
        "Você precisa estar autenticado para poder efetuar esta requisição",
    });

  try {
    await schemaAtualizarProduto.validade(req);
    await schemaAtualizarProduto.validade(req.body);
    const resultado = await procurarProdutos(id, usuario.id);
    if (typeof resultado === "string")
      return res.status(400).json({ mensagem: resultado });

    const editarProduto =
      "update produtos set nome = $1, quantidade = $2, categoria = $3, preco = $4, descricao = $5, imagem = $6 where id = $7 and usuario_id = $8";
    const { rowCount: rowCount2 } = await conexao.query(editarProduto, [
      nome,
      quantidade,
      categoria,
      preco,
      descricao,
      imagem,
      id,
      usuario.id,
    ]);

    if (rowCount2 === 0)
      return res.status(401).json({
        mensagem:
          "Ocorreu um erro ao atualizar o seu produto ou o usuário não está logado. Tente novamente mais tarde",
      });

    return res.status(204).send();
  } catch (error) {
    return res.status(400).json({ mensagem: error.message });
  }
};

const deletarProduto = async (req, res) => {
  const { id } = req.params;
  const { usuario } = req;

  if (!usuario)
    return res.status(401).json({
      mensagem:
        "Você precisa estar autenticado para poder efetuar esta requisição",
    });

  try {
    await schemaDeletarProduto.validade(req);
    await schemaDeletarProduto.validade(req.body);
    const resultado = await procurarProdutos(id, usuario.id);
    if (typeof resultado === "string")
      return res.status(400).json({ mensagem: resultado });

    const removerProduto =
      "delete from produtos where id = $1 and usuario_id = $2";
    const { rowCount: rowCount2 } = await conexao.query(removerProduto, [
      id,
      usuario.id,
    ]);

    if (rowCount2 === 0)
      return res.status(401).json({
        mensagem:
          "Ocorreu um erro ao deletar seu produto ou o seu perfil não está autenticado, tente novamente mais tarde",
      });

    return res.status(204).send();
  } catch (error) {
    return res.status(400).json({ mensagem: error.message });
  }
};

module.exports = {
  listarProdutos,
  detalharProduto,
  cadastrarProduto,
  atualizarProduto,
  deletarProduto,
};
