const yup = require('yup');

const companyDetails = yup.object().shape({
  query: yup.string().trim().required(),
});

module.exports = { companyDetails };
