const express = require("express");
const {cadastrarUsuario, detalharUsuario, atualizarUsuario} = require("./controladores/usuarios");
const {loginUsuario} = require("./controladores/login");
const validarUsuario = require("./middlewares/validarUsuario");
const { listarProdutos, detalharProduto, cadastrarProduto, atualizarProduto, deletarProduto } = require("./controladores/produtos");

const rotas = express();

// Login
rotas.post("/login", loginUsuario);
// Usuários
rotas.post("/usuario", cadastrarUsuario);

rotas.use(validarUsuario);
// Usuários
rotas.get("/usuario", detalharUsuario);
rotas.put("/usuario", atualizarUsuario);
// Produtos
rotas.get("/produtos", listarProdutos);
rotas.get("/produtos/:id", detalharProduto);
rotas.post("/produtos", cadastrarProduto);
rotas.put("/produtos/:id", atualizarProduto);
rotas.delete("/produtos/:id", deletarProduto);


module.exports = rotas;