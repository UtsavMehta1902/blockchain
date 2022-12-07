const cryptoHash = require("./crypto_hash");

describe("cryptoHash()", () => {
  
    it('returns a correct hash', () => {
        expect(cryptoHash('foobar')).toEqual('c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2');
    });

    it('produces order independent results', () => {
        expect(cryptoHash('foo', 'bar', 'sed')).toEqual(cryptoHash('bar', 'sed', 'foo'));
    });
});
