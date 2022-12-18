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

  createTransaction({ amount, recipient, chain }) {
    if (chain)
      this.balance = Wallet.calculateBalance({
        chain,
        address: this.publicKey,
      });
    if (amount > this.balance) {
      throw new Error("Amount greater than balance!");
    }

    return new Transaction({ senderWallet: this, amount, recipient });
  }

  static calculateBalance({ chain, address }) {
    let outputsTotal = 0, isSender = false;

    for (let i = chain.length-1; i > 0; i--) {
      const block = chain[i];

      for (let transaction of block.data) {
        if(transaction.transactionData.address === address)
          isSender = true;

        const addressOutput = transaction.outputMap[address];

        if (addressOutput)
          outputsTotal += addressOutput;
      }

      if(isSender)
        break;
    }

    return isSender ? outputsTotal : INIT_BALANCE + outputsTotal;
  }
}

module.exports = Wallet;
