const { verifySignature } = require("../util/keys");
const Transaction = require("./transaction");
const Wallet = require("./wallet");
const { MINING_REWARD, REWARD_DATA } = require("../config");

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

  describe("updateTransaction()", () => {
    let newRecipient, newAmount, prevSignature, prevResidualBalance;

    describe("amount entered exceeds the current balance", () => {
      it("throws an error", () => {
        expect(() =>
          transaction.updateTransaction({
            senderWallet,
            recipient: "kndsk",
            amount: 999999,
          })
        ).toThrow("Amount exceeds current balance!");
      });
    });

    beforeEach(() => {
      prevSignature = transaction.transactionData.signature;
      prevResidualBalance = transaction.outputMap[senderWallet.publicKey];
      newAmount = 50;
      newRecipient = "dummy-new-recipient";

      transaction.updateTransaction({
        senderWallet,
        recipient: newRecipient,
        amount: newAmount,
      });
    });

    it("outputs correct amount to new recipient", () => {
      expect(transaction.outputMap[newRecipient]).toEqual(newAmount);
    });

    it("calculates correct residual balance of the sender", () => {
      expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
        prevResidualBalance - newAmount
      );
    });

    it("calculates correct total balance of the wallet", () => {
      const totalAmount = Object.values(transaction.outputMap).reduce(
        (total, value) => total + value
      );

      expect(totalAmount).toEqual(transaction.transactionData.amount);
    });

    it("re-calculates the signature", () => {
      expect(transaction.transactionData.signature).not.toEqual(prevSignature);
    });

    it("calculates the new signature correctly", () => {
      expect(
        verifySignature({
          publicKey: senderWallet.publicKey,
          data: transaction.outputMap,
          signature: transaction.transactionData.signature,
        })
      ).toBe(true);
    });

    describe("and another update for the a recipient", () => {
      let addedAmount;

      beforeEach(() => {
        addedAmount = 80;
        transaction.updateTransaction({
          senderWallet,
          recipient: newRecipient,
          amount: addedAmount,
        });
      });

      it("adds to the recipient amount in outputMap", () => {
        expect(transaction.outputMap[newRecipient]).toEqual(
          newAmount + addedAmount
        );
      });

      it("subtracts the amount from the original sender output amount", () => {
        expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
          prevResidualBalance - newAmount - addedAmount
        );
      });
    });
  });

  describe("rewardMinerTransaction()", () => {
    let rewardedTransaction, minerWallet;

    beforeEach(() => {
      minerWallet = new Wallet();
      rewardedTransaction = Transaction.rewardMinerTransaction({ minerWallet });
    });

    it("provides the miner with correct reward amount", () => {
      expect(rewardedTransaction.outputMap[minerWallet.publicKey]).toEqual(
        MINING_REWARD
      );
    });

    it("provides the miner the reward from correct sender", () => {
      expect(rewardedTransaction.transactionData.address).toEqual(
        REWARD_DATA.address
      );
    });
  });
});
