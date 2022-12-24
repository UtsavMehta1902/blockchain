import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Block from "./Block";

const Blocks = () => {
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    fetch(`${document.location.origin}/api/blocks`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((json) => setBlocks(json));
  }, []);

  return (
    <div>
      <div><Link to='/'>Home</Link></div>
      <h3>Blocks</h3>
      {blocks.map((block) => (
        <Block block={block} />
      ))}
    </div>
  );
};

export default Blocks;
