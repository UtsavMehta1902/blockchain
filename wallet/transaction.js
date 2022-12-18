const UUID = require("uuid/v1");
const { verifySignature } = require("../util/keys");
const { MINING_REWARD, REWARD_DATA } = require("../config");

class Transaction {
  constructor({ senderWallet, amount, recipient, outputMap, transactionData }) {
    this.id = UUID();
    this.outputMap =
      outputMap ||
      this.outputMapGenerator({
        senderWallet,
        amount,
        recipient,
      });
    this.transactionData =
      transactionData || this.transactionDataGenerator({ senderWallet });
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

  updateTransaction({ senderWallet, amount, recipient }) {
    if (amount > this.outputMap[senderWallet.publicKey])
      throw new Error("Amount exceeds current balance!");

    if (this.outputMap[recipient]) this.outputMap[recipient] += amount;
    else this.outputMap[recipient] = amount;

    this.outputMap[senderWallet.publicKey] -= amount;
    this.transactionData = this.transactionDataGenerator({ senderWallet });
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
      //   console.log(amount);
      return false;
    }

    return true;
  }

  static rewardMinerTransaction({ minerWallet }) {
    return new this({
      outputMap: { [minerWallet.publicKey]: MINING_REWARD },
      transactionData: { address: REWARD_DATA.address },
    });
  }
}

module.exports = Transaction;
