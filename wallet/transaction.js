const UUID = require("uuid/v1");
const { verifySignature } = require("../util/keys");

class Transaction {
  constructor({ senderWallet, amount, recipient }) {
    this.id = UUID();
    this.outputMap = this.outputMapGenerator({
      senderWallet,
      amount,
      recipient,
    });
    this.transactionData = this.transactionDataGenerator({ senderWallet });
  }

  outputMapGenerator({ senderWallet, amount, recipient }) {
    const outputMap = {};
    outputMap[recipient] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

    return outputMap;
  }

  transactionDataGenerator({ senderWallet }) {
    return {
      amount: senderWallet.balance,
      timestamp: Date.now(),
      address: senderWallet.publicKey,
      signature: senderWallet.sign(this.outputMap),
    };
  }

  static validateTransaction(transaction) {
    const {
      transactionData: { address, amount, signature },
      outputMap,
    } = transaction;

    if (!verifySignature({ publicKey: address, data: outputMap, signature }))
      return false;

    const totalAmount = Object.values(outputMap).reduce(
      (total, value) => total + value
    );

    if (amount != totalAmount) {
      console.log(amount);
      return false;
    }

    return true;
  }
}

module.exports = Transaction;