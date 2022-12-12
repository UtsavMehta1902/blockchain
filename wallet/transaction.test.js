const { verifySignature } = require("../util/keys");
const Transaction = require("./transaction");
const Wallet = require("./wallet");

describe("Transaction", () => {
  let transaction, amount, recipient, senderWallet;

  beforeEach(() => {
    amount = 50;
    recipient = "recipient public key";
    senderWallet = new Wallet();
    transaction = new Transaction({ senderWallet, amount, recipient });
  });

  it("has an id", () => {
    expect(transaction).toHaveProperty("id");
  });

  describe("outputMap", () => {
    it("is a transaction property", () => {
      expect(transaction).toHaveProperty("outputMap");
    });

    it("outputs correct amount sent to recipient", () => {
      expect(transaction.outputMap[recipient]).toEqual(amount);
    });

    it("outputs the remaining amount in sender", () => {
      expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
        senderWallet.balance - amount
      );
    });
  });

  describe("transactionData", () => {
    it("transaction has an transactionData attribute", () => {
      expect(transaction).toHaveProperty("transactionData");
    });

    it("has a timestamp attribute", () => {
      expect(transaction.transactionData).toHaveProperty("timestamp");
    });

    it("sets amount attr to sender wallet's balance", () => {
      expect(transaction.transactionData.amount).toEqual(senderWallet.balance);
    });

    it("sets address attr to sender wallet's public key", () => {
      expect(transaction.transactionData.address).toEqual(
        senderWallet.publicKey
      );
    });

    it("has a valid signature", () => {
      expect(
        verifySignature({
          publicKey: senderWallet.publicKey,
          data: transaction.outputMap,
          signature: transaction.transactionData.signature,
        })
      ).toBe(true);
    });
  });

  describe("validateTransaction()", () => {
    describe("validates untampered transactions", () => {
      it("returns true", () => {
        expect(Transaction.validateTransaction(transaction)).toBe(true);
      });
    });

    describe("invalidates tampered transactions", () => {
      it("returns false when outputMap is changed", () => {
        transaction.outputMap[senderWallet.publicKey] = 999999;
        expect(Transaction.validateTransaction(transaction)).toBe(false);
      });

      it("returns false when transactionData is changed", () => {
        transaction.transactionData.signature = new Wallet().sign("data");
        expect(Transaction.validateTransaction(transaction)).toBe(false);
      });
    });
  });
});
