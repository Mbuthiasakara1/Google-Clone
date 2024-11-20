import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaFolder, FaFileAlt } from "react-icons/fa";
import FileCard from "./FileCard";
import Header from "./Header";
import FolderCard from "./FolderCard";
import Sidebar from "./Sidebar";
import { useAuth } from "./AuthContext";
import ImageView from "./ImageView";
import useStore from "./Store";

function Drive({ toggleTheme }) {
  const { user, setLoading } = useAuth();

  const {
    rename,
    setRename,
    files,
    setFiles,
    folders,
    filteredFolders,
    setFilteredFolders,
    currentFolderId,
    setCurrentFolderId,
    setFolders,
    viewType,
    setViewType,
    folderName,
    setFolderName,
    setImageId,
    imageId,
    showImage,
    setShowImage,
    setFolderHistory,
    filePage,
    setFilePage,
    folderPage,
    setFolderPage,
    itemsPerPage,
    isCreatingFolder,
    isUploading,
    moveItem
  } = useStore();
  
  const [filteredFiles, setFilteredFiles] = useState([]);
  
  // Fetch data function
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Ensure that files and folders render independently
      let fetchedFiles = [];
      let fetchedFolders = [];

      if (user && user.id) {
        // Fetch files associated with the current folder
        try {
          const fileResponse = await axios.get(
            `http://127.0.0.1:5555/api/fileuser/${user.id}?folder_id=${
              currentFolderId || ""
            }&bin=false`
          );
          fetchedFiles = Array.isArray(fileResponse.data)
            ? fileResponse.data
            : [];
          setFiles(fetchedFiles);
          setFilteredFiles(fetchedFiles);
        } catch (error) {
          console.error("Error fetching files:", error);
        }

        // Fetch folders associated with the current folder
        try {
          const folderResponse = await axios.get(
            `http://127.0.0.1:5555/api/folderuser/${user.id}?parent_folder_id=${
              currentFolderId || ""
            }&bin=false`
          );
          fetchedFolders = Array.isArray(folderResponse.data)
            ? folderResponse.data
            : [];
          setFolders(fetchedFolders);
          setFilteredFolders(fetchedFolders);
        } catch (error) {
          console.error("Error fetching folders:", error);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [user, currentFolderId, rename, isCreatingFolder, isUploading, moveItem]);

  const handleFolderClick = (folderId) => {
    setFolderHistory((prevHistory) => [...prevHistory, currentFolderId]);
    setCurrentFolderId(folderId);
    const selectedFolder = folders.find((f) => f.id === folderId);
    setFolderName(selectedFolder ? selectedFolder.name : "Folder");
    setFilteredFiles(files.filter((file) => file.folder_id === folderId));
    setFilteredFolders(folders.filter((f) => f.parent_folder_Id === folderId));
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
  
  // console.log(filteredFiles)
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
      <Sidebar currentFolderId={currentFolderId} />

      <div className="Container">
        <div>
          {currentFolderId && (
            <button
              onClick={() => setCurrentFolderId(null)}
              style={{
                padding: "5px 10px",
                background: "none",
                border: "none",
                color: "#4285f4",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              ← Back to Drive
            </button>
          )}
          <h1 style={{ color: "black" }}>
            {currentFolderId ? folderName : "Welcome to Drive"}
          </h1>
        </div>
        <div className="viewtype-btn">
          <button onClick={() => setViewType("folders")}>
            <FaFolder />
          </button>
          <button onClick={() => setViewType("files")}>
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
                        onFolderClick={handleFolderClick}
                        filteredFolders={filteredFolders}
                        rename={rename}
                        setRename={setRename}
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
                        filteredFolders={filteredFolders}
                        onFileClick={handleFileClick}
                        setFilteredFiles={setFilteredFiles}
                        filteredFiles={filteredFiles}
                        rename={rename}
                        setRename={setRename}
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
              {showImage && (
                <ImageView
                  imageId={imageId}
                  onClose={() => setShowImage(false)}
                />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Drive;
