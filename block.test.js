const Block = require("./block");
const { GENESIS_DATA } = require("./config");
const cryptoHash = require("./crypto_hash");

describe("Block", () => {
  const timestamp = "tmstmp";
  const lastHash = "lstHsh";
  const hash = "hsh";
  const data = [{ data: "data" }];
  const block = new Block({ timestamp, lastHash, hash, data });

  it("contains a timestamp, lasthash, data, hash property checker.", () => {
    expect(block.timestamp).toEqual(timestamp);
    expect(block.lastHash).toEqual(lastHash);
    expect(block.hash).toEqual(hash);
    expect(block.data).toEqual(data);
  });

  describe("genesis()", () => {
    const genBlock = Block.genesis();

    it("returns a Block object", () => {
      expect(genBlock instanceof Block).toEqual(true);
    });

    it("returns the genesis data as return value", () => {
      expect(genBlock).toEqual(GENESIS_DATA);
    });
  });

  describe("mineBlock()", () => {
    const lastBlock = Block.genesis();
    const data = "random data";
    const minedBlock = Block.mineBlock({ lastBlock, data });

    it("returns a Block Object", () => {
      expect(minedBlock instanceof Block).toEqual(true);
    });

    it("has a timestamp", () => {
      expect(minedBlock.timestamp).not.toEqual(undefined);
    });

    it("has 'lastHash' equal to 'lastBlock->hash'", () => {
      expect(minedBlock.lastHash).toEqual(lastBlock.hash);
    });

    it("has 'data' equal to the parameter provided", () => {
      expect(minedBlock.data).toEqual(data);
    });

    it("generates a correct SHA-256 hash", () => {
      expect(minedBlock.hash).toEqual(cryptoHash(minedBlock.timestamp, lastBlock.hash, data));
    });
  });
});
