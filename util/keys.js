const EC = require("elliptic").ec;
const cryptoHash = require("./crypto_hash");

const ec = new EC("secp256k1");

const verifySignature = ({ publicKey, data, signature }) => {
  const ec_temp = ec.keyFromPublic(publicKey, "hex");
  return ec_temp.verify(cryptoHash(data), signature);
};

module.exports = { ec, verifySignature };
