const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');

const { getCompanyDetails } = require('./controller/company.js');
const logger = require('./helper/logger.js');

const port = process.env.httpPort || 8000;

const app = express();

app.use(helmet());
app.use(morgan('common'));
app.use(express.json());

app.get('/company/:companyName', getCompanyDetails);

app.use((req, res, next) => {
  res.status(404).json({ message: 'route does not exist.' });
});

app.use((error, req, res, next) => {
  const status = error.status ? error.status : 500;
  res.status(status).json({
    success: false,
    message: error.message ? error.message : error.statusText,
  });
});

app.listen(port, () => {
  logger.info(`listenning on port ${port}`);
});
