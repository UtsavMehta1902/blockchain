const bodyParser = require("body-parser");
const express = require("express");
const request = require("request");
const Blockchain = require("./blockchain/blockchain");
const PubSub = require("./app/pubsub");
const TransactionPool = require("./wallet/transaction_pool");
const Wallet = require("./wallet/wallet");

const app = new express();
const blockchain = new Blockchain();
const DEFAULT_PORT = 3000;
const transactionPool = new TransactionPool();
const wallet = new Wallet();

const pubsub = new PubSub({ blockchain, transactionPool, wallet });

const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

app.use(bodyParser.json());

app.get("/api/blocks", (req, res) => {
  res.json(blockchain.chain);
});

app.post("/api/mine", (req, res) => {
  const { data } = req.body;
  blockchain.addBlock({ data });
  pubsub.broadcastChain();
  res.redirect("/api/blocks");
});

app.post("/api/transact", (req, res) => {
  const { recipient, amount } = req.body;

  let transaction = transactionPool.existingTransaction({
    inputAddress: wallet.publicKey,
  });

  try {
    if (transaction)
      transaction.updateTransaction({ senderWallet: wallet, amount, recipient });
    else 
      transaction = wallet.createTransaction({ recipient, amount });
  } catch (error) {
    return res.status(400).json({ type: "error", message: error.message });
  }
  
  transactionPool.setTransaction(transaction);
  pubsub.broadcastTransaction(transaction);
  res.json({ type: "success", transaction });
});

app.get('/api/transaction-pool', (req, res) => {
  res.json(transactionPool.transactionMap);
});

const syncWithCurrentState = () => {
  request(
    { url: `${ROOT_NODE_ADDRESS}/api/blocks` },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const response_chain = JSON.parse(body);
        console.log("Syncing with existant blockchain.");
        blockchain.updateChain(response_chain);
      }
    }
  );

  request(
    { url: `${ROOT_NODE_ADDRESS}/api/transaction-pool` }, 
    (error, response, body) => {
      if(!error && response.statusCode === 200) {
        const response_pool = JSON.parse(body);
        console.log("Syncing with existant transaction-pool.");
        transactionPool.setMap(response_pool);
      }
    }
  )
};

let PORT = DEFAULT_PORT;

if (process.env.GENERATE_PEER_PORT === "TRUE")
  PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);

app.listen(PORT, () => {
  console.log(`listening to port-${PORT}`);

  if (PORT !== DEFAULT_PORT) syncWithCurrentState();
});
