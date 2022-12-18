const TransactionPool = require("./transaction_pool");
const Transaction = require("./transaction");
const Wallet = require("./wallet");
const Blockchain = require("../blockchain/blockchain");

describe("TransactionPool", () => {
  let transactionPool, transaction;

  beforeEach(() => {
    transactionPool = new TransactionPool();
    transaction = new Transaction({
      senderWallet: new Wallet(),
      amount: 50,
      recipient: "dummy-recipient",
    });
  });

  describe("setTransaction()", () => {
    it("adds a new transaction to the pool", () => {
      transactionPool.setTransaction(transaction);
      expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
    });
  });

  describe("existingTransaction()", () => {
    it("returns an existing transaction", () => {
      transactionPool.setTransaction(transaction);

      expect(
        transactionPool.existingTransaction({
          inputAddress: transaction.transactionData.address,
        })
      ).toBe(transaction);
    });
  });

  describe("validTransactions()", () => {
    let valid_transactions, wallet;

    beforeEach(() => {
      valid_transactions = [];
      wallet = new Wallet();
      for (let i = 0; i < 10; ++i) {
        transaction = new Transaction({
          senderWallet: wallet,
          recipient: "utsav",
          amount: 30,
        });

        if (i % 3 === 0) valid_transactions.push(transaction);
        else if (i % 3 === 1) transaction.transactionData.amount = 123456;
        else transaction.transactionData.signature = wallet.sign("kmfob");

        transactionPool.setTransaction(transaction);
      }
    });

    it("returns the list of valid transactions", () => {
      expect(transactionPool.validTransactions()).toEqual(valid_transactions);
    });
  });

  describe("clearPool()", () => {
    it("clears the tranasaction-pool", () => {
      transactionPool.clearPool();
      expect(transactionPool.transactionMap).toEqual({});
    });
  });

  describe("clearBlockchainTransactions()", () => {
    it("removes the transaction already present in the blockchain", () => {
      const expectedTransactionMap = {};
      const blockchain = new Blockchain();

      for (let i = 0; i < 10; ++i) {
        const transaction = new Transaction({
          senderWallet: new Wallet(),
          recipient: "foobar",
          amount: 25,
        });

        transactionPool.setTransaction(transaction);

        if (i % 2) blockchain.addBlock({ data: [transaction] });
        else expectedTransactionMap[transaction.id] = transaction;
      }

      transactionPool.clearBlockchainTransactions({ chain: blockchain.chain });
      expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
    });
  });
});
