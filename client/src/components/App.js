import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const App = () => {
  const [walletInfo, setWalletInfo] = useState({ balance: 0, address: "-" });

  useEffect(() => {
    fetch(`${document.location.origin}/api/wallet-info`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((json) => {
        setWalletInfo(json);
      });
  }, []);

  return (
    <div className="app">
      <img className="logo" src={logo} alt="logo" />
      <br />
      Welcome
      <br />
      <div><Link to='/blocks'>Blocks</Link></div>
      <div><Link to='/conduct-transaction'>Conduct a Transaction</Link></div>
      <div><Link to='/transaction-pool'>Transaction Pool</Link></div>
      <div className="wallet-info">
        <div>Balance: {walletInfo.balance} </div>
        <div>Address: {walletInfo.address} </div>
      </div>
    </div>
  );
};

export default App;
