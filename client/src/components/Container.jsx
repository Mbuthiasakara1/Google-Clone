import React, { useState, useEffect } from "react";
import FileCard from "./FileCard";
import Header from "./Header";

function Container({toggleTheme}) {
  // State management for files and folders
  const [items, setItems] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  
  // New state variables for folder navigation
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderName, setFolderName] = useState("Drive");

  useEffect(() => {
    if (currentFolderId) {
      // Fetch contents of the current folder
      fetch(`http://127.0.0.1:5555/api/folders/${currentFolderId}`)
        .then(res => res.json())
        .then(data => {
          // Combine files and subfolders into a single array
          const allItems = [
            ...(data.files || []),
            ...(data.subfolders || []).map(folder => ({ 
              ...folder, 
              type: 'folder' // Ensure folders are properly marked
            }))
          ];
          setItems(allItems);
          setFilteredFiles(allItems);
          setFolderName(data.name || "Folder");
        })
        .catch(error => console.error("Error fetching folder contents:", error));
    } else {
      // Fetch root level items (original functionality)
      Promise.all([
        fetch("http://localhost:3001/files").then((res) => res.json()),
        fetch("http://localhost:3001/folders").then((res) => res.json()),
      ])
        .then(([files, folders]) => {
          const allItems = [...files, ...folders];
          setItems(allItems);
          setFilteredFiles(allItems);
          setFolderName("Drive"); // Reset folder name when at root
        })
        .catch((error) =>
          console.error("Error fetching files and folders:", error)
        );
    }
  }, [currentFolderId]); // Re-run when folder ID changes

  // Original search filter functionality
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

  // New handler for folder navigation
  const handleFolderClick = (folderId) => {
    setCurrentFolderId(folderId);
  };

  return (
    <>
      <Header onFilter={handleFilter} toggleTheme={toggleTheme} />
      <div
        className="Container"
        style={{ backgroundColor: "white", borderRadius: "10px" }}
      >
        {/* Added navigation header with back button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {currentFolderId && (
            <button
              onClick={() => setCurrentFolderId(null)}
              style={{
                padding: '5px 10px',
                background: 'none',
                border: 'none',
                color: '#4285f4',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ← Back to Drive
            </button>
          )}
          <h1 style={{ color: "black" }}>
            {currentFolderId ? folderName : "Welcome to Drive"}
          </h1>
        </div>
        
        {/* File/folder grid with empty state handling */}
        <div className="content">
          {filteredFiles.length > 0 ? (
            filteredFiles.map((item) => (
              <FileCard 
                key={item.id} 
                file={item} 
                onFolderClick={handleFolderClick}  // Pass folder click handler
              />
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