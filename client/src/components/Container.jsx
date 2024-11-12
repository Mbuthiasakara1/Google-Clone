import React, { useState, useEffect } from "react";
import FileCard from "./FileCard";
import Header from "./Header";

function Container({toggleTheme}) {
  const [items, setItems] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]); 

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:3001/files").then((res) => res.json()),
      fetch("http://localhost:3001/folders").then((res) => res.json()),
    ])
      .then(([files, folders]) => {
        const allItems = [...files, ...folders];
        setItems(allItems);
        setFilteredFiles(allItems); 
      })
      .catch((error) =>
        console.error("Error fetching files and folders:", error)
      );
  }, []);

  const handleFilter = (query) => {
    if (!query) {
      setFilteredFiles(items);
    } else {
      const filtered = items.filter((file) =>
        file.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredFiles(filtered);
    }
  };

  return (
    <>
      <Header onFilter={handleFilter} toggleTheme={toggleTheme} />
      <div
        className="Container"
        style={{ backgroundColor: "white", borderRadius: "10px" }}
      >
        <h1 style={{ color: "black" }}>Welcome to Drive</h1>
        <div className="content">
          {filteredFiles.length > 0 ? (
            filteredFiles.map((item) => (
              <FileCard key={item.id} file={item} />
            ))
          ) : (
            <h2 style={{ color: "gray" }}>No files found</h2>
          )}
        </div>
      </div>
    </>
  );
}

export default Container;
