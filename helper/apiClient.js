const fetch = require('node-fetch');

const doGet = (url) => new Promise((resolv, reject) => {
  fetch(url)
    .then((response) => {
      if (response.ok) {
        response
          .json()
          .then((currentCompany) => {
            resolv(currentCompany);
          })
          .catch((respErr) => {
            reject(respErr);
          });
      } else {
        reject(response);
      }
    })
    .catch((error) => {
      reject(error);
    });
});

module.exports = { doGet };
