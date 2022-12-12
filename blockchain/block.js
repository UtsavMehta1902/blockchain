const hexToBinary = require("hex-to-binary");
const { GENESIS_DATA, MINE_RATE } = require("../config");
const cryptoHash = require("../util/crypto_hash");

class Block {
  constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty;
  }

  static genesis = () => {
    return new this(GENESIS_DATA);
  };

  static mineBlock = ({ lastBlock, data }) => {
    let timestamp, hash;
    const lastHash = lastBlock.hash;
    let difficulty = lastBlock.difficulty;
    let nonce = 0;

    do {
      timestamp = Date.now();
      nonce++;
      difficulty = Block.adjustDifficulty({ block: lastBlock, timestamp });
      hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
    } while (
      hexToBinary(hash).substring(0, difficulty) !== "0".repeat(difficulty)
    );

    return new this({
      timestamp,
      lastHash,
      data,
      nonce,
      difficulty,
      hash,
    });
  };

  static adjustDifficulty({ block, timestamp }) {
    if (block.difficulty < 1) return 1;

    if (timestamp - block.timestamp > MINE_RATE) return block.difficulty - 1;

    return block.difficulty + 1;
  }
}

module.exports = Block;
