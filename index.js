const bodyParser = require("body-parser");
const express = require("express");
const request = require("request");
const Blockchain = require("./blockchain/blockchain");
const PubSub = require("./app/pubsub");

const app = new express();
const blockchain = new Blockchain();
const pubsub = new PubSub(blockchain);
const DEFAULT_PORT = 3000;

const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

// setTimeout(() => {
//   pubsub.broadcastChain();
// }, 1000);

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

const syncChain = () => {
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
};

let PORT = DEFAULT_PORT;

if (process.env.GENERATE_PEER_PORT === "TRUE")
  PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);

app.listen(PORT, () => {
  console.log(`listening to port-${PORT}`);

  if (PORT !== DEFAULT_PORT) syncChain();
  // setTimeout(() => {
  //     console.log(blockchain.chain)
  // }, 1000);
});
