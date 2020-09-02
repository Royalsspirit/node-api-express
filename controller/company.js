const apiClient = require('../helper/apiClient.js');
const { companyDetails } = require('../validator/company.js');
const logger = require('../helper/logger.js');

const SOCIETECOM_API = process.env.societeomApi || false;
const API_KEY = process.env.apiKey || 'v7b7ikr3mka7p1fmc8nbblruualj9cv8qalbth3vkpn1tn7cpk8';

const getCompanyDetails = async (req, res, next) => {
  const { query, withAddress, withName } = req.params;
  logger.info(query);
  try {
    await companyDetails.validate({
      query,
    });

    const output = {};
    // made a free call to entreprise data gouv to get siret number from string
    // and to save credit for societeinfo call
    const companyInfo = await apiClient.doGet(
      `https://entreprise.data.gouv.fr/api/sirene/v1/full_text/${query}`,
    );
    if (companyInfo.total_results > 0) {
      output.siret = companyInfo.etablissement[0].siret;

      if (SOCIETECOM_API === true) {
        const detailsCompany = await apiClient.doGet(
          `https://societeinfo.com/app/rest/api/v2/company.json/${companyInfo.etablissement[0].siret}?key=${API_KEY}`,
        );
        if (withAddress && detailsCompany.result.last_bodacc) {
          output.address = detailsCompany.result.last_bodacc.address;
        }
        if (withName && detailsCompany.result.organization) {
          output.name = detailsCompany.result.organization.name;
        }
        if (detailsCompany.result.contacts) {
          output.phones = detailsCompany.result.contacts.phones;
        }
      }
    } else {
      const error = new Error(`${query} not found in entreprise.data.gouv.fr`);
      error.code = '400';
      next(error);
    }

    res.json(output);
  } catch (e) {
    next(e);
  }
};

module.exports = { getCompanyDetails };
