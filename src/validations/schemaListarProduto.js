const yup = require("./configurations");

const schemaListarProduto = yup.object().shape({
  categoria: yup.string("Query em formato inválido"),
  usuario: yup
    .string()
    .required(
      "Você precisa estar autenticado para poder efetuar esta requisição"
    ),
});

module.exports = schemaListarProduto;
