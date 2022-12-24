import React from "react";

const Transaction = ({ transaction }) => {
  const { transactionData, outputMap } = transaction;
  const recipients = Object.keys(outputMap);

  return (
    <div className="transaction">
      <div>
        From: {`${transactionData.address.substring(0, 20)}...`} | Balance:{" "}
        {transactionData.amount}
      </div>
      {recipients.map(recipient => (
        <div key={recipient}>
          To: {`${recipient.substring(0, 20)}...`} | Sent:{" "}
          {outputMap[recipient]}
        </div>
      ))}
    </div>
  );
};

export default Transaction;
