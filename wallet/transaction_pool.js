const Transaction = require("./transaction");

class TransactionPool {
  constructor() {
    this.transactionMap = {};
  }

  setTransaction(transaction) {
    this.transactionMap[transaction.id] = transaction;
  }

  setMap(transactionPoolMap) {
    this.transactionMap = transactionPoolMap;
  }

  existingTransaction({ inputAddress }) {
    const transactions = Object.values(this.transactionMap);

    return transactions.find(
      (transaction) => transaction.transactionData.address === inputAddress
    );
  }

  validTransactions() {
    const valid_transactions = [];

    Object.values(this.transactionMap).map((transaction, idx) => {
      if (Transaction.validateTransaction(transaction))
        valid_transactions.push(transaction);
    });

    return valid_transactions;
  }

  clearPool() {
    this.transactionMap = {};
  }

  clearBlockchainTransactions({ chain }) {
    for(let i=0; i<chain.length; ++i) {
        const block = chain[i];

        for(let transaction of block.data) {
            if(this.transactionMap[transaction.id])
                delete this.transactionMap[transaction.id];
        }
    }
  }
}

module.exports = TransactionPool;
