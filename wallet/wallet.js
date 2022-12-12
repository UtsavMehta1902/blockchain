const { INIT_BALANCE } = require("../config");
const { ec } = require("../util/keys");
const cryptoHash = require("../util/crypto_hash");
const Transaction = require("./transaction");

class Wallet {
  constructor() {
    this.balance = INIT_BALANCE;
    this.keyPair = ec.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode("hex");
  }

  sign(data) {
    return this.keyPair.sign(cryptoHash(data));
  }

  createTransaction({ amount, recipient }) {
    if (amount > this.balance) {
      throw new Error("Amount greater than balance!");
    }

    return new Transaction({ senderWallet: this, amount, recipient });
  }
}

module.exports = Wallet;
