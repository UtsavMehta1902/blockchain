import React, { useState, useEffect } from "react";

const Blocks = () => {
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/blocks", {
      method: "GET",
    })
      .then((res) => res.json())
      .then((json) => setBlocks(json));
  }, []);

  console.log(blocks);

  return (
    <div>
      <h3>Blocks</h3>

      {blocks.map((block, index) => {
        return (
          <a key={index} url="">
            <tr>
              <td>{index}</td>
              <td>{new Date(block.timestamp).toLocaleDateString()}</td>
              <td>
                {block.hash.substring(0, Math.min(10, block.hash.length))}...
              </td>
            </tr>
          </a>
        );
      })}
    </div>
  );
};

export default Blocks;
