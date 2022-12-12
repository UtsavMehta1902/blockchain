const hexToBinary = require("hex-to-binary");
const { mineBlock } = require("./block");
const Block = require("./block");
const { GENESIS_DATA, MINE_RATE } = require("../config");
const cryptoHash = require("../util/crypto_hash");

describe("Block", () => {
  const timestamp = 2000;
  const lastHash = "lstHsh";
  const hash = "hsh";
  const data = [{ data: "data" }];
  const nonce = 1;
  const difficulty = 1;
  const block = new Block({
    timestamp,
    lastHash,
    hash,
    data,
    nonce,
    difficulty,
  });

  it("contains a timestamp, lasthash, data, hash, nonce and difficulty property checker.", () => {
    expect(block.timestamp).toEqual(timestamp);
    expect(block.lastHash).toEqual(lastHash);
    expect(block.hash).toEqual(hash);
    expect(block.data).toEqual(data);
    expect(block.nonce).toEqual(nonce);
    expect(block.difficulty).toEqual(difficulty);
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
      expect(minedBlock.hash).toEqual(
        cryptoHash(
          minedBlock.timestamp,
          lastBlock.hash,
          data,
          minedBlock.nonce,
          minedBlock.difficulty
        )
      );
    });

    it("generates a hash correct wrt difficulty", () => {
      expect(
        hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty)
      ).toEqual("0".repeat(minedBlock.difficulty));
    });

    it("calls the adjustDifficulty()", () => {
      expect(
        minedBlock.difficulty === lastBlock.difficulty + 1 ||
          minedBlock.difficulty === lastBlock.difficulty - 1
      ).toBe(true);
    });
  });

  describe("adjustDifficulty", () => {
    it("raises the difficulty for a quickly mined block", () => {
      expect(
        Block.adjustDifficulty({
          block: block,
          timestamp: timestamp + MINE_RATE - 100,
        })
      ).toEqual(difficulty + 1);
    });

    it("lowers the difficulty for a slowly mined block", () => {
      expect(
        Block.adjustDifficulty({
          block: block,
          timestamp: timestamp + MINE_RATE + 100,
        })
      ).toEqual(difficulty - 1);
    });

    it("has a lower limit for difficulty", () => {
      mineBlock.difficulty = -1;
      expect(
        Block.adjustDifficulty({ block: mineBlock, timestamp: Date.now() })
      ).toEqual(1);
    });
  });
});
