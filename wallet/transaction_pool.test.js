const TransactionPool = require("./transaction_pool");
const Transaction = require("./transaction");
const Wallet = require("./wallet");

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
});
