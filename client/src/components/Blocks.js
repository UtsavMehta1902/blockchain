import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Block from "./Block";

const Blocks = () => {
  const [blocks, setBlocks] = useState([]);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    fetch(`${document.location.origin}/api/blocks/length`)
      .then((res) => res.json())
      .then((json) => setPageCount(Math.ceil(json/5)));

    fetchPages(1);
  }, []);

  fetchPages = (page) => {
    fetch(`${document.location.origin}/api/blocks/${page}`)
      .then((res) => res.json())
      .then((json) => setBlocks(json));
  };

  return (
    <div>
      <div>
        <Link to="/">Home</Link>
      </div>
      <h3>Blocks</h3>
      <div>
        {[...Array(pageCount).keys()].map((key) => {
          const pageID = key + 1;

          return (
            <span key={key} onClick={() => {fetchPages(pageID)}}>
              <Button variant="danger" size="sm">
                {pageID}
              </Button>
            </span>
          );
        })}
      </div>
      {blocks.map((block) => (
        <Block block={block} />
      ))}
    </div>
  );
};

export default Blocks;
