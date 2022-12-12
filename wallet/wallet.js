const { INIT_BALANCE } = require("../config");
const { ec } = require("../util/keys");
const cryptoHash = require("../util/crypto_hash");

class Wallet {
  constructor() {
    this.balance = INIT_BALANCE;
    this.keyPair = ec.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode("hex");
  }

  sign(data) {
    return this.keyPair.sign(cryptoHash(data));
  }
}

module.exports = Wallet;
