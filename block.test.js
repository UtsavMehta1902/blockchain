const Block = require("./block");
const { GENESIS_DATA } = require("./config");

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

    it("returans a Block object", () => {
      expect(genBlock instanceof Block).toEqual(true);
    });

    it("returns the genesis data as return value", () => {
      expect(genBlock).toEqual(GENESIS_DATA);
    });
  });
});
