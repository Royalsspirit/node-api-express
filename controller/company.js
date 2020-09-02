const apiClient = require('../helper/apiClient.js');
const { companyDetails } = require('../validator/company.js');
const logger = require('../helper/logger.js');

const SOCIETECOM_API = process.env.enableSocietecomApi || false;
const API_KEY = process.env.societecomApiKey
  || 'v7b7ikr3mka7p1fmc8nbblruualj9cv8qalbth3vkpn1tn7cpk8';

const getCompanyDetails = async (req, res, next) => {
  const { companyName } = req.params;
  const { postcode, siren } = req.query;

  logger.info(`name ${companyName} postcode ${postcode} siren ${siren}`);

  try {
    await companyDetails.validate({
      companyName,
      postcode,
      siren,
    });

    const output = {};

    if (!siren) {
      // made a free call to entreprise data gouv to get siret number from string
      // and to save credit for societeinfo call
      // move url to global var
      let url = `https://entreprise.data.gouv.fr/api/sirene/v1/full_text/${companyName}`;
      if (postcode) {
        url += `?code_postal=${postcode}`;
      }
      const companyInfo = await apiClient.doGet(url);
      logger.info(JSON.stringify(companyInfo));
      if (companyInfo.total_results > 0) {
        if (companyInfo.total_results === 1) {
          output.siret = companyInfo.etablissement[0].siret;
          output.siren = companyInfo.etablissement[0].siren;
        } else {
          for (const company of companyInfo.etablissement) {
            if (company.l1_normalisee.indexOf(companyName) !== -1) {
              logger.info(JSON.stringify(company));
              output.siret = company.siret;
              output.siren = company.siren;
              break;
            }
          }
        }
      } else {
        output.siren = siren;
      }

      if (SOCIETECOM_API === true) {
        const detailsCompany = await apiClient.doGet(
          `https://societeinfo.com/app/rest/api/v2/company.json/${output.siren}?key=${API_KEY}`,
        );
        if (detailsCompany.result.last_bodacc.address) {
          output.address = detailsCompany.result.last_bodacc.address;
        }
        if (!output.siret) {
          output.siret = detailsCompany.result.organization.full_registration_number;
        }
        if (detailsCompany.result.organization.name) {
          output.name = detailsCompany.result.organization.name;
        }
        if (detailsCompany.result.contacts.phones) {
          output.phones = detailsCompany.result.contacts.phones;
        } else {
          logger.info('Sorry cell number not found');
        }
      }
    } else {
      const error = new Error(
        `${companyName} not found in entreprise.data.gouv.fr`,
      );
      error.code = '400';
      next(error);
    }

    res.json(output);
  } catch (e) {
    next(e);
  }
};

module.exports = { getCompanyDetails };
