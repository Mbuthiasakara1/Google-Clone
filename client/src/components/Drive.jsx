import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaFolder, FaFileAlt } from "react-icons/fa";
import FileCard from "./FileCard";
import Header from "./Header";
import FolderCard from "./FolderCard";
import Sidebar from "./Sidebar";
import { useAuth } from "./AuthContext";

  
function Drive({ toggleTheme }) {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [viewType, setViewType] = useState("folders");
  const { user, loading, setLoading } = useAuth();
  const [items, setItems] = useState([]);  
  // New state variables for folder navigation
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderName, setFolderName] = useState("Drive");

  

  // Pagination states
  const [filePage, setFilePage] = useState(1);
  const [folderPage, setFolderPage] = useState(1);
  const itemsPerPage = 12;


  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user && user.id) {
          const fileResponse = await axios.get(
            `http://127.0.0.1:5555/api/fileuser/${user.id}`
          );
          setFiles(Array.isArray(fileResponse.data) ? fileResponse.data : []);
          setFilteredFiles(
            Array.isArray(fileResponse.data) ? fileResponse.data : []
          );

          const folderResponse = await axios.get(
            `http://127.0.0.1:5555/api/folderuser/${user.id}`
          );
          setFolders(
            Array.isArray(folderResponse.data) ? folderResponse.data : []
          );
          setFilteredFolders(
            Array.isArray(folderResponse.data) ? folderResponse.data : []
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (currentFolderId) {
      // Fetch contents of the current folder
      fetch(`http://127.0.0.1:5555/api/content/${currentFolderId}`)
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

  const handleFilter = (query) => {
    if (!query) {
      setFilteredFiles(files);
      setFilteredFolders(folders);
    } else {
      const filteredFiles = files.filter((file) =>
        file.name.toLowerCase().includes(query.toLowerCase())
      );
      const filteredFolders = folders.filter((folder) =>
        folder.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredFiles(filteredFiles);
      setFilteredFolders(filteredFolders);
    }
  };

  const handleViewMoreFiles = () => setFilePage(filePage + 1);
  const handleViewMoreFolders = () => setFolderPage(folderPage + 1);

  const displayedFiles = filteredFiles.slice(0, filePage * itemsPerPage);
  const displayedFolders = filteredFolders.slice(0, folderPage * itemsPerPage);

  // New handler for folder navigation
  const handleFolderClick = (folderId) => {
    setCurrentFolderId(folderId);
  };

  return (
    <>
      <Header onFilter={handleFilter} toggleTheme={toggleTheme} />
      <Sidebar />
      <div
        className="Container"
        style={{ backgroundColor: "white", borderRadius: "10px" }}
      >
      
        <div style={{ display: "flex", marginRight: "10px" }}>
          <button
            onClick={() => setViewType("folders")}
            style={{
              marginRight: "10px",
              border: "none",
              backgroundColor: "inherit",
            }}
          >
            <FaFolder />
          </button>
          <button
            onClick={() => setViewType("files")}
            style={{ border: "none", backgroundColor: "inherit" }}
          >
            <FaFileAlt />
          </button>
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

        {viewType === "folders" && displayedFolders.length > 0 && (
          <>
            <h3>Folders</h3>
            <div className="content">
              {displayedFolders.map((folder) => (
                <FolderCard 
                key={folder.id} 
                folder={folder} 
                folders={folders} 
                setFolders={setFolders}
                onFolderClick={handleFolderClick}
                />
              ))}
            </div>
            {filteredFolders.length > displayedFolders.length && (
              <button onClick={handleViewMoreFolders}>View More</button>
            )}
          </>
        )}

        {viewType === "files" && displayedFiles.length > 0 && (
          <>
            <h3>Files</h3>
            <div className="content">
              {displayedFiles.map((file) => (
                <FileCard key={file.id} file={file} files={files} setFiles={setFiles} />
              ))}
            </div>
            {filteredFiles.length > displayedFiles.length && (
              <button onClick={handleViewMoreFiles}>View More</button>
            )}
          </>
        )}
      </div>
      </div>
    </>
  );
}

export default Drive;