const Block = require('./block');
const cryptoHash = require('../util/crypto_hash');

class Blockchain {
    constructor(){
        this.chain = [Block.genesis()];
    }

    addBlock = ({data}) => {
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length-1],
            data
        });

        this.chain.push(newBlock);
    }

    static isValidChain(chain){
        if(JSON.stringify(chain[0])!==JSON.stringify(Block.genesis()))
            return false;
        
        for(let i=1; i<chain.length; ++i)
        {
            const {timestamp, lastHash, hash, data, nonce, difficulty} = chain[i];
            if(lastHash !== chain[i-1].hash)
                return false;
            
            if(Math.abs(difficulty - chain[i-1].difficulty) > 1)
                return false;
            
            const actualHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
            if(actualHash !== hash)
                return false;
        }

        return true;
    }

    updateChain(chain) {
        if(chain.length <= this.chain.length)
            return;
        
        if(!Blockchain.isValidChain(chain))
            return;
            
        this.chain = chain;
    }
}

module.exports = Blockchain;