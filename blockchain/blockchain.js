const Block = require("./block");
const cryptoHash = require("../util/crypto_hash");
const { REWARD_DATA, MINING_REWARD } = require("../config");
const Transaction = require("../wallet/transaction");

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }

  addBlock = ({ data }) => {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain[this.chain.length - 1],
      data,
    });

    this.chain.push(newBlock);
  };

  static isValidChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()))
      return false;

    for (let i = 1; i < chain.length; ++i) {
      const { timestamp, lastHash, hash, data, nonce, difficulty } = chain[i];
      if (lastHash !== chain[i - 1].hash) return false;

      if (Math.abs(difficulty - chain[i - 1].difficulty) > 1) return false;

      const actualHash = cryptoHash(
        timestamp,
        lastHash,
        data,
        nonce,
        difficulty
      );
      if (actualHash !== hash) return false;
    }

    return true;
  }

  updateChain(chain, validateTransactionFlag, onSuccess) {
    if (chain.length <= this.chain.length) return;

    if (!Blockchain.isValidChain(chain)) return;

    if(validateTransactionFlag && !this.validateTransactionData({ chain })) return;

    if (onSuccess) onSuccess();
    this.chain = chain;
  }

  validateTransactionData({ chain }) {
    for (let i = 1; i < chain.length; ++i) {
      const block = chain[i];
      let rewardTransactionFound = false;
      const transactionSet = new Set();

      for (let transaction of block.data) {
        if(transaction.transactionData.address === REWARD_DATA.address) {
          if(rewardTransactionFound)
            return false;
          
          rewardTransactionFound = true;
          
          if(Object.values(transaction.outputMap)[0] !== MINING_REWARD)
            return false;
        }
        else {
          if(!Transaction.validateTransaction(transaction))
            return false;
        }

        if(transactionSet.has(transaction))
          return false;
        
        transactionSet.add(transaction);
      }

      if(!rewardTransactionFound)
        return false;
    }
    return true;
  }
}

module.exports = Blockchain;
