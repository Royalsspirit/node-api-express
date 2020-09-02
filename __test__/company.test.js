const apiClient = require('../helper/apiClient.js');
const { getCompanyDetails } = require('../controller/company.js');
/*
 * test doGet module:
 * - if it reject properly
 * - if it resolves properly
 */
describe('doGet call', () => {
  describe('when url exists', () => {
    it('should return a result', async () => {
      const result = await apiClient.doGet(
        'https://entreprise.data.gouv.fr/api/sirene/v1/full_text/google',
      );
      expect(result).not.toBeNull();
    });
    it('should promise reject with external content', async () => {
      await expect(() => apiClient.doGet(
        'https://entreprise.data.gouv.fr/api/sirene/v1/full_text/',
      )).rejects.toMatchObject({ status: 404 });
    });
  });
  describe('when url does not return format expected', () => {
    it('should trigger a exception', async () => {
      await expect(() => apiClient.doGet('https://toto.fr')).rejects.toThrow();
    });
  });
});
/**
 * test controller for /company/:name route
 *
 * */
describe('controller call', () => {
  let req = {};
  let res = {};
  let next = {};
  beforeEach(() => {
    req = {
      body: jest.fn().mockReturnValue({}),
      params: jest.fn().mockReturnValue({}),
      query: jest.fn().mockReturnValue({}),
    };
    res = {
      status: jest.fn().mockReturnValue({}),
      json: jest.fn().mockReturnValue({}),
    };
    next = jest.fn().mockReturnValue({});
    const spy = jest.spyOn(apiClient, 'doGet');
    spy.mockReturnValue({
      total_results: 1,
      etablissement: [{ siret: 123456789 }],
    });
  });
  describe('when name parameter is a string', () => {
    describe('and none optionnal parameter', () => {
      beforeEach(() => {
        req.params.companyName = 'apple';
      });

      it('should call json function', async () => {
        await getCompanyDetails(req, res, next);
        expect(res.json).toHaveBeenCalledTimes(1);
      });
      it('should contain a siret number', async () => {
        await getCompanyDetails(req, res, next);
        expect(res.json.mock.calls[0][0]).toEqual({ siret: 123456789 });
      });
    });
  });
  describe('when name parameter is empty', () => {
    it('should fail at validator level', async () => {
      req.params.companyName = '';
      await getCompanyDetails(req, res, next);
      expect(res.json).toHaveBeenCalledTimes(0);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0].message).toBe('name is a required field');
    });
  });
});
