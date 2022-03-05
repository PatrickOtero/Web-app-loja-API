const yup = require("./configurations");

const schemaLoginUsuario = yup.object().shape({
  email: yup.string().required(),
  senha: yup.string().required(),
});

module.exports = schemaLoginUsuario;
