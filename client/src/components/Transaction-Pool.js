import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Transaction from "./Transaction";
import history from "../history.js";

const PULL_INTERVAL = 10000;

const TransactionPool = () => {
  const [transactionPool, setTransactionPool] = useState({});

  const fetchPool = () => {
    fetch(`${document.location.origin}/api/transaction-pool`)
      .then((res) => res.json())
      .then((json) => setTransactionPool(json));
  };

  const mineTransactions = () => {
    fetch(`${document.location.origin}/api/mine-transactions`).then((res) => {
      if (res.status === 200) {
        alert("success");
        history.push("/blocks");
      } else {
        alert(
          "The mine-transactions block request did not complete successfully."
        );
      }
    });
  };

  useEffect(() => {
    fetchPool();

    const interval = setInterval(() => fetchPool(), PULL_INTERVAL);

    return () => clearInterval(interval);
  });

  return (
    <div className="transaction-pool">
      <div>
        <Link to="/">Home</Link>
      </div>
      <h3>Transaction Pool</h3>
      {Object.values(transactionPool).map((transaction) => {
        return (
          <div key={transaction.id}>
            <hr />
            <Transaction transaction={transaction} />
          </div>
        );
      })}
      <div>
        <Button variant="danger" size="sm" onClick={mineTransactions}>
          Mine the Transactions
        </Button>
      </div>
    </div>
  );
};

export default TransactionPool;
