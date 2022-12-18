const Blockchain = require("./blockchain");
const Block = require("./block");
const cryptoHash = require("../util/crypto_hash");
const Wallet = require("../wallet/wallet");
const Transaction = require("../wallet/transaction");

describe("Blockchain", () => {
  let blockchain, newChain;

  beforeEach(() => {
    blockchain = new Blockchain();
    newChain = new Blockchain();
  });

  it("contains a chain as an array", () => {
    expect(blockchain.chain instanceof Array).toBe(true);
  });

  it("contains the genesis block", () => {
    expect(blockchain.chain[0]).toEqual(Block.genesis());
  });

  it("can add new blocks to the blockchain", () => {
    const newData = "foo bar";
    blockchain.addBlock({ data: newData });
    expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
  });

  describe("isValidChain()", () => {
    it("returns false is first block in not genesis block", () => {
      blockchain.chain[0].data = "fake-genesis";

      expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
    });

    describe("first block is genesis and it contains multiple blocks", () => {
      beforeEach(() => {
        blockchain.addBlock({ data: "foo" });
        blockchain.addBlock({ data: "bar" });
        blockchain.addBlock({ data: "foo-bar" });
      });

      it("returns false when lastHash value is changed", () => {
        blockchain.chain[1].lastHash = "kdnjei";

        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
      });

      it("returns false when intermediate data is changed", () => {
        blockchain.chain[1].data = "asafkpv";

        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
      });

      it("returns false when it encounters difficulty jumps", () => {
        const timestamp = Date.now();
        const lastHash = blockchain.chain[blockchain.chain.length - 1].hash;
        const nonce = 0;
        const data = [];
        const difficulty =
          blockchain.chain[blockchain.chain.length - 1].difficulty - 3;
        const hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);

        const newBlock = new Block({
          timestamp,
          lastHash,
          hash,
          data,
          nonce,
          difficulty,
        });

        blockchain.chain.push(newBlock);

        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
      });

      it("returns true when everything is right", () => {
        expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
      });
    });
  });

  describe("updateChain()", () => {
    describe("when the new chain is not longer", () => {
      it("does not update the original chain", () => {
        const origChain = blockchain.chain;
        newChain.chain[0].data = "fake-data";

        blockchain.updateChain(newChain.chain);
        expect(blockchain.chain).toEqual(origChain);
      });
    });

    describe("when the new chain is longer", () => {
      beforeEach(() => {
        newChain.addBlock({ data: "bar" });
        newChain.addBlock({ data: "foo-bar" });
        newChain.addBlock({ data: "foo" });
      });

      describe("when the new chain is invalid", () => {
        it("does not update the original chain", () => {
          const origChain = blockchain.chain;
          newChain.chain[2].hash = "noenov";

          blockchain.updateChain(newChain.chain);
          expect(blockchain.chain).toEqual(origChain);
        });

        it("replaces when the original chain is valid", () => {
          blockchain.updateChain(newChain.chain);
          expect(blockchain.chain).toEqual(newChain.chain);
        });
      });
    });

    describe("the validTransactionFalg is true", () => {
      it("calls the validTransactionData function", () => {
        validateTransactionDataMock = jest.fn();
        blockchain.validateTransactionData = validateTransactionDataMock;

        newChain.addBlock({ data: "dummy" });
        blockchain.updateChain(newChain.chain, true);

        expect(validateTransactionDataMock).toHaveBeenCalled();
      });
    });
  });

  describe("validateTransactionData", () => {
    let wallet, transaction, rewardTransaction;

    beforeEach(() => {
      wallet = new Wallet();
      transaction = wallet.createTransaction({
        amount: 50,
        recipient: "foobar",
      });
      rewardTransaction = Transaction.rewardMinerTransaction({
        minerWallet: wallet,
      });
    });

    describe("the transaction data is valid", () => {
      it("returns true", () => {
        newChain.addBlock({ data: [transaction, rewardTransaction] });

        expect(
          blockchain.validateTransactionData({ chain: newChain.chain })
        ).toBe(true);
      });
    });

    describe("the transaction data is invalid", () => {
      describe("has more than one reward transaction blocks", () => {
        it("returns false", () => {
          newChain.addBlock({
            data: [transaction, rewardTransaction, rewardTransaction],
          });
          expect(
            blockchain.validateTransactionData({ chain: newChain.chain })
          ).toBe(false);
        });
      });

      describe("has altered outputMap", () => {
        describe("of a non-reward transaction", () => {
          it("returns false", () => {
            transaction.outputMap[wallet.publicKey] = 343;
            newChain.addBlock({ data: [transaction, rewardTransaction] });
            expect(
              blockchain.validateTransactionData({ chain: newChain.chain })
            ).toBe(false);
          });
        });

        describe("of a reward transaction", () => {
          it("returns false", () => {
            rewardTransaction.outputMap[wallet.publicKey] = 343;
            newChain.addBlock({ data: [transaction, rewardTransaction] });
            expect(
              blockchain.validateTransactionData({ chain: newChain.chain })
            ).toBe(false);
          });
        });
      });

      describe("has altered transactionData", () => {
        it("returns false", () => {
          // console.log(transaction.transactionData.timestamp);
          transaction.transactionData.address = new Wallet().publicKey;
          newChain.addBlock({ data: [transaction, rewardTransaction] });
          expect(
            blockchain.validateTransactionData({ chain: newChain.chain })
          ).toBe(false);
        });
      });

      describe("contains multiple identical transactions", () => {
        it("returns false", () => {
          newChain.addBlock({
            data: [transaction, rewardTransaction, transaction],
          });
          expect(
            blockchain.validateTransactionData({ chain: newChain.chain })
          ).toBe(false);
        });
      });
    });
  });
});
