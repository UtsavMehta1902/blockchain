const Wallet = require("./wallet");
const { verifySignature } = require("../util/keys");
const Transaction = require("./transaction");

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
  });
});
