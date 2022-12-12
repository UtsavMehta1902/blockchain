const PubNub = require("pubnub");

const credentials = {
  publishKey: "pub-c-b26cbef7-3f83-46ee-8dde-a2d5db1a0b67",
  subscribeKey: "sub-c-58859ffe-cbf7-47c3-a685-6a69b2fbefd2",
  secretKey: "sec-c-MjUwY2EyZGEtYjk3OS00ZTYzLTg3NGUtMTc4NzIyMzIyMjA5",
};

const CHANNELS = {
  TEST: "TEST-CHANNEL",
  BLOCKCHAIN: "BLOCKCHAIN-CHANNEL",
};

class PubSub {
  constructor(blockchain) {
    this.blockchain = blockchain;
    this.pubnub = new PubNub(credentials);
    this.pubnub.subscribe({ channels: Object.values(CHANNELS) });

    this.pubnub.addListener(this.listener());
  }

  listener() {
    return {
      message: (messageObject) => {
        const { message, channel } = messageObject;
        console.log(
          `Message recieved on channel: ${channel} and msg: ${message}`
        );

        const parsedMsg = JSON.parse(message);

        if (channel === CHANNELS.BLOCKCHAIN) {
          this.blockchain.updateChain(parsedMsg);
        }
      },
    };
  }

  publish({ channel, message }) {
    this.pubnub.publish({ channel, message });
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain),
    });
  }
}

// const pubsub = new PubSub();
// pubsub.publish({ channel: CHANNELS.TEST, message: "jskvj" });

module.exports = PubSub;
