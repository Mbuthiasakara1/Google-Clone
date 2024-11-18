import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaFolder, FaFileAlt } from "react-icons/fa";
import FileCard from "./FileCard";
import Header from "./Header";
import FolderCard from "./FolderCard";
import Sidebar from "./Sidebar";
import { useAuth } from "./AuthContext";
import ImageView from "./ImageView";

function Drive({ toggleTheme }) {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [viewType, setViewType] = useState("folders");
  const { user, loading, setLoading } = useAuth();

  // New state variables for folder navigation
  const [items, setItems] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderName, setFolderName] = useState("Drive");
  const [folderHistory, setFolderHistory] = useState([]);
  const [imageId, setImageId] = useState(0);
  const [showImage, setShowImage] = useState(null);

  const [filePage, setFilePage] = useState(1);
  const [folderPage, setFolderPage] = useState(1);
  const itemsPerPage = 12;

  // Fetch data function
  const fetchData = async () => {
    if (!user || !user.id) {
      setFiles([]);
      setFolders([]);
      return;
    }
  
    try {
      const fileResponse = await axios.get(
       `http://127.0.0.1:5555/api/fileuser/${user.id}?folder_id=${currentFolderId || ""}&bin=false`)
      const folderResponse = await axios.get(`http://127.0.0.1:5555/api/folderuser/${user.id}?parent_folder_id=${currentFolderId || ""}&bin=false`);
  
      const fetchedFiles = Array.isArray(fileResponse.data) ? fileResponse.data : [];
      const fetchedFolders = Array.isArray(folderResponse.data) ? folderResponse.data : [];
  
      setFiles(fetchedFiles);
      setFilteredFiles(fetchedFiles);
      setFolders(fetchedFolders);
      setFilteredFolders(fetchedFolders);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, currentFolderId]);


  
  const handleFolderClick = (folderId) => {
    setFolderHistory((prevHistory) => [...prevHistory, currentFolderId]);
    setCurrentFolderId(folderId);
    const selectedFolder = folders.find((f) => f.id === folderId);
    setFolderName(selectedFolder ? selectedFolder.name : "Folder");
    setFilteredFiles(files.filter(file => file.folder_id === folderId));
    setFilteredFolders(folders.filter(f => f.parent_folder_Id === folderId));
  };


  const handleBack = () => {
    if (folderHistory.length > 0) {
      // Get the last folder ID from the history
      const previousFolderId = folderHistory[folderHistory.length - 1];

      // Remove the last folder ID from the history
      setFolderHistory((prevHistory) => prevHistory.slice(0, -1));

      // Navigate to the previous folder
      setCurrentFolderId(previousFolderId);
      setFolderName("");
    } else {
      // If no history, go back to the root
      setCurrentFolderId(null);
      setFolderName("Drive");
    }
  };

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

 

  const handleFileClick = (fileId) => {
    const selectedFile = files.find((file) => file.id === fileId);
    if (selectedFile) {
      setImageId(selectedFile);
      setShowImage(true);
    }
  };

  return (
    <>
      <Header onFilter={handleFilter} toggleTheme={toggleTheme} />
      <Sidebar currentFolderId={currentFolderId}/>

      <div
        className="Container"
      >
       
        <div>
          {currentFolderId && (
            <button
              onClick={handleBack}
              style={{
                padding: "5px 10px",
                background: "none",
                border: "none",
                color: "#4285f4",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              ← Back to {folderHistory.length > 0 ? "Previous Folder" : "Drive"}
            </button>
          )}
          <h1 style={{ color: "black" }}>
            {currentFolderId ? folderName : "Welcome to Drive"}
          </h1>
        </div>
        <div className="viewtype-btn">
        <button
          onClick={() => setViewType("folders")}
          
        >
          <FaFolder />
        </button>
        <button
          onClick={() => setViewType("files")}
        >
          <FaFileAlt />
        </button>

        </div>

        {viewType === "folders" && (
          <>
            <div className="content">
              <div className="folder-container">
                <h3>Folders</h3>
                <div className="folder-list">
                  {displayedFolders.length === 0 ? (
                    <h3>No folders found</h3>
                  ) : (
                    displayedFolders.map((folder) => (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        folders={folders}
                        setFolders={setFolders}
                        onFolderClick={handleFolderClick} // Updated to use handleOpenFolder
                      />
                    ))
                  )}

                  {filteredFolders.length > displayedFolders.length && (
                    <button onClick={handleViewMoreFolders}>View More</button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {viewType === "files" && (
          <>
            <div className="content">
              <div className="file-container">
                <h3>Files</h3>
                <div className="file-list">
                  {displayedFiles.length === 0 ? (
                    <h3>No files Found</h3>
                  ) : (
                    displayedFiles.map((file) => (
                      <FileCard
                        key={file.id}
                        file={file}
                        files={files}
                        onFileClick={handleFileClick}
                        setFilteredFiles={setFilteredFiles}
                        filteredFiles={filteredFiles}
                        filteredFolders={filteredFolders}
                      />
                    ))
                  )}
                  {filteredFiles.length > displayedFiles.length && (
                    <button
                      style={{
                        backgroundColor: "inherit",
                        border: "none",
                        color: "black",
                      }}
                      onClick={handleViewMoreFiles}
                    >
                      View More
                    </button>
                  )}
                </div>
              </div>
              {showImage && <ImageView imageId={imageId} onClose={() => setShowImage(false)} />}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Drive;
