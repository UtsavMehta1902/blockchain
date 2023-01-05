const bodyParser = require("body-parser");
const express = require("express");
const request = require("request");
const Blockchain = require("./blockchain/blockchain");
const PubSub = require("./app/pubsub");
const TransactionPool = require("./wallet/transaction_pool");
const Wallet = require("./wallet/wallet");
const Miner = require("./app/miner");
const path = require("path");

const app = new express();
const blockchain = new Blockchain();
const DEFAULT_PORT = 3000;
const transactionPool = new TransactionPool();
const wallet = new Wallet();

const pubsub = new PubSub({ blockchain, transactionPool, wallet });
const miner = new Miner({ blockchain, transactionPool, wallet, pubsub });

const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client/dist')));

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
      transaction.updateTransaction({
        senderWallet: wallet,
        amount,
        recipient,
      });
    else
      transaction = wallet.createTransaction({
        recipient,
        amount,
        chain: blockchain.chain,
      });
  } catch (error) {
    return res.status(400).json({ type: "error", message: error.message });
  }

  transactionPool.setTransaction(transaction);
  pubsub.broadcastTransaction(transaction);
  res.json({ type: "success", transaction });
});

app.get("/api/transaction-pool", (req, res) => {
  res.json(transactionPool.transactionMap);
});

app.get("/api/mine-transactions", (req, res) => {
  miner.mine();

  res.redirect("/api/blocks");
});

app.get("/api/wallet-info", (req, res) => {
  const address = wallet.publicKey;

  res.json({
    address,
    balance: Wallet.calculateBalance({ chain: blockchain.chain, address }),
  });
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
      if (!error && response.statusCode === 200) {
        const response_pool = JSON.parse(body);
        console.log("Syncing with existant transaction-pool.");
        transactionPool.setMap(response_pool);
      }
    }
  );
};

app.get('/', (req, res) => {
  res.sendStatus(200);
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// const wallet_temp1 = new Wallet();
// const wallet_temp2 = new Wallet();

// const generateTransaction = ({wallet, recipient, amount}) => {
//   const transaction = wallet.createTransaction({ amount, recipient, chain: blockchain.chain });

//   transactionPool.setTransaction(transaction);
// }

// const transWallet = () => generateTransaction({
//   wallet, recipient: wallet_temp1.publicKey, amount: 10
// });

// const transWallet1 = () => generateTransaction({
//   wallet: wallet_temp1, recipient: wallet_temp2, amount: 21 
// });

// const transWallet2 = () => generateTransaction({
//   wallet: wallet_temp2, recipient: wallet, amount: 13
// });

// for(let i=0; i<10; ++i)
// {
//   if(i%3 === 0){
//     transWallet();
//     transWallet1();
//   }
//   else if(i%3 === 1)
//   {
//     transWallet1();
//     transWallet2();
//   }
//   else
//   {
//     transWallet();
//     transWallet2();
//   }

//   miner.mine();
// }

let PORT = process.env.PORT || DEFAULT_PORT;

if (process.env.GENERATE_PEER_PORT === "TRUE")
  PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);

app.listen(PORT, () => {
  console.log(`listening to port-${PORT}`);

  if (PORT !== DEFAULT_PORT) syncWithCurrentState();
});
