import React, { useState, useEffect } from "react";
import Blocks from "./Blocks";

const App = () => {
  const [walletInfo, setWalletInfo] = useState({ balance: 0, address: "-" });

  useEffect(() => {
    fetch("http://localhost:3000/api/wallet-info", {
      method: "GET",
    })
      .then((res) => res.json())
      .then((json) => {
        setWalletInfo(json);
      });
  }, []);

  return (
    <div>
      Welcome
      <div>Balance: {walletInfo.balance} </div>
      <div>Address: {walletInfo.address} </div>

      <br />
      <Blocks />
    </div>
  );
};

export default App;
