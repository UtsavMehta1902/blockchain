import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Transaction from "./Transaction";

const Block = ({ block }) => {
  const hashDisplay =
    block.hash.length > 15 ? `${block.hash.substring(0, 15)}...` : block.hash;
  const lastHashDisplay =
    block.lastHash.length > 15
      ? `${block.lastHash.substring(0, 15)}...`
      : block.lastHash;

  let dateDisplay = new Date(block.timestamp).toLocaleString();
  if (dateDisplay === "Invalid Date") {
    dateDisplay = block.timestamp;
  }

  const tempStringData = JSON.stringify(block.data);
  const stringData =
    "Data: " +
    (tempStringData.length > 35
      ? `${tempStringData.substring(0, 35)}...`
      : tempStringData);

  const [displayTransaction, setDisplayTransaction] = useState(false);

  const toggleTransaction = () => {
    setDisplayTransaction(!displayTransaction);
  };

  return (
    <div className="block">
      <div>Hash: {hashDisplay}</div>
      <div>Last Hash: {lastHashDisplay}</div>
      <div>Timestamp: {dateDisplay}</div>
      <div>
        {displayTransaction
          ? block.data.map((transaction) => (
              <div key={transaction.id}>
                <hr />
                <Transaction transaction={transaction} />
              </div>
            ))
          : stringData}
      </div>
      <Button variant="danger" size="sm" onClick={toggleTransaction}>
        {displayTransaction ? "Hide" : "Show"} Transactions
      </Button>
    </div>
  );
};

export default Block;
