const Wallet = require("./wallet");
const { verifySignature } = require("../util/keys");
const Transaction = require("./transaction");
const Blockchain = require("../blockchain/blockchain");
const { INIT_BALANCE } = require("../config");

describe("Wallet", () => {
  let wallet;

  beforeEach(() => {
    wallet = new Wallet();
  });

  it("has a balance field", () => {
    expect(wallet).toHaveProperty("balance");
  });

  it("has a publicKey field", () => {
    expect(wallet).toHaveProperty("publicKey");
  });

  describe("signing data", () => {
    const data = "dummy-data";

    it("verifies a valid signature", () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: wallet.sign(data),
        })
      ).toBe(true);
    });

    it("does not verify invalid signature", () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: new Wallet().sign(data),
        })
      ).toBe(false);
    });
  });

  describe("createTransaction()", () => {
    let amount, recipient;
    beforeEach(() => {
      amount = 50;
      recipient = "dummy-recipient";
    });

    describe("when the amount is greater than the balance", () => {
      it("throws an error", () => {
        amount = 999999;
        expect(() => wallet.createTransaction({ amount, recipient })).toThrow(
          "Amount greater than balance!"
        );
      });
    });

    describe("when the amount entered is within the balance", () => {
      it("returns an Transaction object", () => {
        expect(
          wallet.createTransaction({ amount, recipient }) instanceof Transaction
        ).toBe(true);
      });

      it("sends the correct amount", () => {
        expect(
          wallet.createTransaction({ amount, recipient }).outputMap[recipient]
        ).toEqual(amount);
      });

      it("matches the address with wallet's publicKey", () => {
        expect(
          wallet.createTransaction({ amount, recipient }).transactionData
            .address
        ).toEqual(wallet.publicKey);
      });
    });

    describe("when a chain is passed", () => {
      it("calls the calculateBalance function", () => {
        let calculateBalanceMock = jest.fn();
        const storeCalculateBalance = Wallet.calculateBalance;
        Wallet.calculateBalance = calculateBalanceMock;

        wallet.createTransaction({
          chain: new Blockchain().chain,
          amount: 20,
          recipient: "foobar",
        });

        expect(calculateBalanceMock).toHaveBeenCalled();
        Wallet.calculateBalance = storeCalculateBalance;
      });
    });
  });

  describe("calculateBalance()", () => {
    let blockchain;

    beforeEach(() => {
      blockchain = new Blockchain();
    });

    describe("there are no outputs for the wallet", () => {
      it("returns the initial balance", () => {
        expect(
          Wallet.calculateBalance({
            chain: blockchain.chain,
            address: wallet.publicKey,
          })
        ).toEqual(INIT_BALANCE);
      });
    });

    describe("there are outputs for the wallet as the recipient", () => {
      let transactionOne, transactionTwo;

      beforeEach(() => {
        transactionOne = new Wallet().createTransaction({
          recipient: wallet.publicKey,
          amount: 50,
        });

        transactionTwo = new Wallet().createTransaction({
          recipient: wallet.publicKey,
          amount: 60,
        });

        blockchain.addBlock({ data: [transactionOne, transactionTwo] });
      });

      it("adds the sum of all outputs to the wallet balance", () => {
        expect(
          Wallet.calculateBalance({
            chain: blockchain.chain,
            address: wallet.publicKey,
          })
        ).toEqual(
          INIT_BALANCE +
            transactionOne.outputMap[wallet.publicKey] +
            transactionTwo.outputMap[wallet.publicKey]
        );
      });
    });

    describe("there are outputs for the wallet as the sender", () => {
      let recentTransaction;

      beforeEach(() => {
        recentTransaction = wallet.createTransaction({
          amount: 50,
          recipient: "foo-bar",
        });

        blockchain.addBlock({ data: [recentTransaction] });
      });

      it("returns the output amount equal to balance at end of recent-transaction", () => {
        expect(
          Wallet.calculateBalance({
            chain: blockchain.chain,
            address: wallet.publicKey,
          })
        ).toEqual(recentTransaction.outputMap[wallet.publicKey]);
      });

      describe("and there are outputs in same and next block for this wallet", () => {
        let sameBlockRecieveTransaction,
          sameBlockRewardTransaction,
          nextBlockRecieveTransaction;

        beforeEach(() => {
          sameBlockRecieveTransaction = new Wallet().createTransaction({
            amount: 40,
            recipient: wallet.publicKey,
          });
          sameBlockRewardTransaction = Transaction.rewardMinerTransaction({
            minerWallet: wallet,
          });

          blockchain.addBlock({
            data: [sameBlockRecieveTransaction, sameBlockRewardTransaction],
          });

          nextBlockRecieveTransaction = new Wallet().createTransaction({
            amount: 50,
            recipient: wallet.publicKey,
          });

          blockchain.addBlock({ data: [nextBlockRecieveTransaction] });
        });

        it("outputs the correct amount considering all transactions", () => {
          expect(
            Wallet.calculateBalance({
              chain: blockchain.chain,
              address: wallet.publicKey,
            })
          ).toEqual(
            recentTransaction.outputMap[wallet.publicKey] +
              sameBlockRecieveTransaction.outputMap[wallet.publicKey] +
              sameBlockRewardTransaction.outputMap[wallet.publicKey] +
              nextBlockRecieveTransaction.outputMap[wallet.publicKey]
          );
        });
      });
    });
  });
});
