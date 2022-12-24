import React, { useState } from "react";
import { FormGroup, FormControl, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import history from "../history.js";

const ConductTransaction = () => {
  const [transactInfo, setTransactInfo] = useState({
    recipient: "",
    amount: 0,
  });

  const updateAmount = (event) => {
    setTransactInfo({
      ...transactInfo,
      amount: Number(event.target.value),
    });
  };

  const updateRecipient = (event) => {
    setTransactInfo({
      ...transactInfo,
      recipient: event.target.value,
    });
  };

  const conductTransaction = () => {
    const { recipient, amount } = transactInfo;
    fetch(`${document.location.origin}/api/transact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recipient, amount }),
    })
      .then((res) => res.json())
      .then((json) => {
        alert(json.messge || json.type);  
        history.push("/transaction-pool");
      });
  };

  return (
    <div className="conduct-transaction">
      <Link to="/">Home</Link>
      <h3>Conduct a Transaction</h3>
      <FormGroup>
        <FormControl
          input="text"
          placeholder="recipient"
          value={transactInfo.recipient}
          onChange={updateRecipient}
        />
      </FormGroup>
      <FormGroup>
        <FormControl
          input="number"
          placeholder="recipient"
          value={transactInfo.amount}
          onChange={updateAmount}
        />
      </FormGroup>
      <Button variant="danger" size="sm" onClick={conductTransaction}>
        Submit
      </Button>
    </div>
  );
};

export default ConductTransaction;
