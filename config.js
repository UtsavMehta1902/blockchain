const MINE_RATE = 1000;
const INIT_BALANCE = 1000;

const GENESIS_DATA = {
  timestamp: "gen-timestamp",
  lastHash: "gen-lastHash",
  hash: "gen-hash",
  nonce: 0,
  difficulty: 3,
  data: [],
};

module.exports = { GENESIS_DATA, MINE_RATE, INIT_BALANCE };
