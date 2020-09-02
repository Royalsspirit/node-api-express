const yup = require('yup');

const companyDetails = yup.object().shape({
  companyName: yup.string().trim().required(),
  postcode: yup.string().length(5),
  siren: yup.string().length(9),
});

module.exports = { companyDetails };
