import React, { useState, useEffect } from "react";
import FileCard from "./FileCard";


function Container() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:3001/files").then((res) => res.json()),
      fetch("http://localhost:3001/folders").then((res) => res.json()),
    ])
      .then(([files, folders]) => setItems([...files, ...folders]))
      .catch((error) => console.error("Error fetching files and folders:", error));
  }, []);
  

  return (
    <div className="Container" style={{backgroundColor:'white', borderRadius:'10px'}}>
      <h1 style={{colot:'black'}}>Welcome to Drive</h1>
      <div className="content">
        {items.map((item) => (
          <FileCard key={item.id} file={item} />
        ))}
      </div>
    </div>
  );
}

export default Container;
