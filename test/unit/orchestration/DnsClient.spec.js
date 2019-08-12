const dns = require('dns');
const DnsClient = require('../../../src/orchestration/DnsClient');

describe('DnsClient', () => {
  let listDnsRecordsStub;

  describe('#listEngines', () => {
    afterEach(() => {
      listDnsRecordsStub.restore();
    });

    it('should list two engines with matching discovery label', async () => {
      listDnsRecordsStub = sinon.stub(dns, 'lookup').callsFake((name, opts, callback) => callback(undefined, [{
        address: '192.168.0.1',
      }, {
        address: '192.168.0.2',
      }]));
      const engines = await DnsClient.listEngines('engine.service.consul');
      const rawEngines = engines.map((engine) => ({
        engine: engine.engine,
      }));
      expect(listDnsRecordsStub).to.have.been.calledOnce;
      expect(rawEngines.length).to.equal(2);
    });

    it('should return an empty list if dns lookup throws ENOTFOUND', async () => {
      listDnsRecordsStub = sinon.stub(dns, 'lookup').callsFake((name, opts, callback) => callback({
        code: dns.NOTFOUND,
      }, undefined));
      const engines = await DnsClient.listEngines();
      const rawEngines = engines.map((engine) => ({
        engine: engine.engine,
      }));
      expect(listDnsRecordsStub).to.have.been.calledOnce;
      expect(rawEngines.length).to.equal(0);
    });

    it('should throw error if other dns error is encountered', async () => {
      listDnsRecordsStub = sinon.stub(dns, 'lookup').callsFake((name, opts, callback) => callback({
        code: dns.BADNAME,
      }, undefined));

      await expect(DnsClient.listEngines()).to.be.rejected;
    });
  });
});
