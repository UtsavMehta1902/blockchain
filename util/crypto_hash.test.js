const cryptoHash = require("./crypto_hash");

describe("cryptoHash()", () => {
  it("returns a correct hash", () => {
    expect(cryptoHash("foobar")).toEqual(
      "a61deaef26c069e32bda388991cf1f07f0a6dd451bc6a7bdad3e34eecbbadb39"
    );
  });

  it("produces order independent results", () => {
    expect(cryptoHash("foo", "bar", "sed")).toEqual(
      cryptoHash("bar", "sed", "foo")
    );
  });
});
