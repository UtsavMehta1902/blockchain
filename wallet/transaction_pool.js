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

        return transactions.find(transaction => transaction.transactionData.address === inputAddress);
    }
}

module.exports = TransactionPool;
