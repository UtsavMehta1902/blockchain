import React from "react";
import {render} from "react-dom";
import './index.css';
import App from "./components/App";
import { Route, Router, Switch } from "react-router-dom";
import history from "./history";
import Blocks from "./components/Blocks";
import ConductTransaction from "./components/Conduct-Transaction";
import TransactionPool from "./components/Transaction-Pool";

render(
  <Router history={history}>
    <Switch>
      <Route path='/blocks' component={Blocks} />
      <Route path='/conduct-transaction' component={ConductTransaction} />
      <Route path='/transaction-pool' component={TransactionPool} />
      <Route path='/' component={App}/>
    </Switch>
  </Router>,
  document.getElementById("root")
);
