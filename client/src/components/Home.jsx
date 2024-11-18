import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaFolder, FaFileAlt, FaEllipsisV } from "react-icons/fa";
import { Download as DownloadIcon } from "@mui/icons-material";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "./AuthContext";
import { useSnackbar } from "notistack";
import ImageView from "./ImageView";
import { Dialog, DialogActions, DialogContent, DialogTitle, FormControl,TextField, InputLabel, Select, MenuItem, Button } from '@mui/material';

function Home() {
  const [moveItem, setMoveItem] = useState(null, true)
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [dropdownId, setDropdownId] = useState(null);
  const [renameId, setRenameId] = useState(null);
  const [rename, setRename] = useState("");
  const [showMoveCard, setShowMoveCard] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [currentFolderName, setCurrentFolderName] = useState("");
  const [folderHistory, setFolderHistory] = useState([]);
  const [imageId, setImageId] = useState(0)
  const [showImage, setShowImage] = useState(null)
 


  // NEW: Add download state
  const [isDownloading, setIsDownloading] = useState(false);
  const { user, loading, setLoading } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

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
            `http://127.0.0.1:5555/api/fileuser/${user.id}?folder_id=${currentFolderId || ""}&bin=false`
          );
          fetchedFiles = Array.isArray(fileResponse.data) ? fileResponse.data : [];
          setFiles(fetchedFiles);
          setFilteredFiles(fetchedFiles);
        } catch (error) {
          console.error("Error fetching files:", error);
        }

        // Fetch folders associated with the current folder
        try {
          const folderResponse = await axios.get(
            `http://127.0.0.1:5555/api/folderuser/${user.id}?parent_folder_id=${currentFolderId || ""}&bin=false`
          );
          fetchedFolders = Array.isArray(folderResponse.data) ? folderResponse.data : [];
          setFolders(fetchedFolders);
          setFilteredFolders(fetchedFolders);
        } catch (error) {
          console.error("Error fetching folders:", error);

        }
      }

      setLoading(false);
    };

  
    fetchData();
  }, [user, currentFolderId]);

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

  const handleOpenFolder = (folder) => {
    // Save the current folder ID to history before opening a new one
    setFolderHistory((prevHistory) => [...prevHistory, currentFolderId]);

    // Open the new folder
    setCurrentFolderId(folder.id);
    setCurrentFolderName(folder.name);

    // Filter files and folders inside the clicked folder
    setFilteredFiles(files.filter(file => file.folder_id === folder.id));
    setFilteredFolders(folders.filter(f => f.parent_folder_Id === folder.id));
  };

  const handleBack = () => {
    if (folderHistory.length > 0) {
      // Get the last folder ID from the history
      const previousFolderId = folderHistory[folderHistory.length - 1];

      // Remove the last folder ID from the history
      setFolderHistory((prevHistory) => prevHistory.slice(0, -1));

      // Navigate to the previous folder
      setCurrentFolderId(previousFolderId);
      setCurrentFolderName("");
    } else {
      // If no history, go back to the root
      setCurrentFolderId(null);
      setCurrentFolderName("");
    }
  };


  const handleRenameFile = async (fileId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5555/api/files/${fileId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: rename }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to rename file. Status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      const data =
        contentType && contentType.includes("application/json")
          ? await response.json()
          : {};

      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.id === fileId ? { ...file, name: data.name } : file
        )
      );

      setRename("");
      setRenameId(null);
      enqueueSnackbar("File renamed successfully!", { variant: "success" });
    } catch (error) {
      console.error("Rename error:", error);
      enqueueSnackbar(error.message || "An error occurred while renaming.", {
        variant: "error",
      });
    }
    fetchData()
  };

  const handleRenameFolder = async (folderId) => {
    setFiles((prevFolders) =>
      prevFolders.map((folder) =>
        folder.id === folderId ? { ...folder, name: rename } : folder
      )
    );
    try {
      const response = await fetch(
        `http://127.0.0.1:5555/api/folders/${folderId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: rename }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to rename folder. Status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      const data =
        contentType && contentType.includes("application/json")
          ? await response.json()
          : {};

      setFiles((prevFolders) =>
        prevFolders.map((folder) =>
          folder.id === folderId ? { ...folder, name: data.name } : folder
        )
      );

      setRename("");
      setRenameId(null);
      enqueueSnackbar("Folder renamed successfully!", { variant: "success" });
    } catch (error) {
      console.error("Rename error:", error);
      enqueueSnackbar(error.message || "An error occurred while renaming.", {
        variant: "error",
      });
    }
    fetchData()
  };

  // NEW: File download handler
  const handleFileDownload = async (file) => {
    try {
      setIsDownloading(true);
      enqueueSnackbar("Starting download...", { variant: "info" });

      const response = await fetch(
        `http://127.0.0.1:5555/api/files/${file.id}/download`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      enqueueSnackbar("File downloaded successfully", { variant: "success" });
    } catch (error) {
      console.error("Download error:", error);
      enqueueSnackbar("Failed to download file", { variant: "error" });
    } finally {
      setIsDownloading(false);
    }
  };

  // NEW: Folder download handler
  const handleFolderDownload = async (folder) => {
    try {
      setIsDownloading(true);
      enqueueSnackbar("Preparing folder for download...", { variant: "info" });

      const response = await fetch(
        `http://127.0.0.1:5555/api/folders/${folder.id}/download`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Folder download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${folder.name}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      enqueueSnackbar("Folder downloaded successfully", { variant: "success" });
    } catch (error) {
      console.error("Folder download error:", error);
      enqueueSnackbar("Failed to download folder", { variant: "error" });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleMoveFolderToTrash = (folderId) => {
    fetch(`http://127.0.0.1:5555/api/folders/${folderId}/move-to-trash`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bin: true }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to move folder to trash");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Folder moved to trash:", data);
        enqueueSnackbar("Folder successfully moved to trash", {
          variant: "success",
        });
        setFolders((prevFolders) =>
          prevFolders.filter((f) => f.id !== folderId)
        );
        
      })
      .catch((error) => {
        console.error("Error moving folder to trash:", error);
        enqueueSnackbar("Error moving folder to trash", { variant: "error" });
      });
      fetchData()
  };
  const handleMoveFileToTrash = (fileId) => {
    fetch(`http://127.0.0.1:5555/api/files/${fileId}/move-to-trash`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bin: true }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to move folder to trash");
        }
        return response.json();
      })
      .then((data) => {
        console.log("File moved to trash:", data);
        enqueueSnackbar("File successfully moved to trash", {
          variant: "success",
        });
        setFiles((prevFiles) => prevFiles.filter((f) => f.id !== fileId));
      })
      .catch((error) => {
        // console.error("Error moving folder to trash:", error);
        enqueueSnackbar("Error moving file to trash", { variant: "error" });
      });
      fetchData()
  };

  const handleMove = (item) => {
    setShowMoveCard(true);
    setSelectedFolderId(null);  // Reset folder selection
    setMoveItem(item);  // Set the item to move (file or folder)
  };

  const confirmMove = async () => {
    if (!selectedFolderId) {
      enqueueSnackbar("Please select a folder to move into.", {
        variant: "warning",
      });
      return;
    }

    try {
      let response;
      if (moveItem?.type === "folder") {
        // Moving a folder
        response = await axios.patch(
          `http://127.0.0.1:5555/api/folders/${moveItem.id}/move`,
          { parent_folder_id: selectedFolderId }
        )
      } else {
        // Moving a file
        response = await axios.patch(
          `http://127.0.0.1:5555/api/files/${moveItem.id}/move`,
          { folder_id: selectedFolderId }
        );
      }

      if (response.status !== 200) {
        throw new Error(`Failed to move item. Status: ${response.status}`);
      }
  
      const updatedItem = response.data;
      enqueueSnackbar("Item moved successfully!", { variant: "success" });
      setShowMoveCard(false);

      // Update the local state to reflect the changes
      if (moveItem?.type === "folder") {
        setFolders((prevFolders) =>
          prevFolders.map((folder) =>
            folder.id === moveItem.id
              ? { ...folder, parent_folder_id: selectedFolderId }
              : folder
          )
        );
      } else {
        setFiles((prevFiles) =>
          prevFiles.map((file) =>
            file.id === moveItem.id ? { ...file, folderId: selectedFolderId } : file
          )
        );
      }

    } catch (error) {
      console.error("Error moving item:", error);
      enqueueSnackbar("Failed to move item.", { variant: "error" });
    }
  };
  
  const checkForImage = (file) => {
    const imageTypes = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "image"];
    const extension = file.name?.split(".").pop()?.toLowerCase();
    const fileType = (file.filetype || file.type || "").toLowerCase();
  
    return imageTypes.some(
      (type) =>
        fileType.includes(type) || 
        extension === type || 
        (file.mimeType && file.mimeType.includes(type))
    );
  };

  function handleFileClick(file){
    const isImage = checkForImage(file);
    if (isImage) {
      setImageId(file); 
      console.log(file)
      setShowImage(true); 
      
    }
  }

  return (
    <>
      <Header onFilter={handleFilter} />
      <Sidebar currentFolderId={currentFolderId} />
      <div className="Container" style={{ borderRadius: "10px" }}>
        <h1 style={{ color: "black" }}>Welcome to Drive</h1>

        {/* Display the current folder name and a back button if inside a folder */}
        <div className="current-folder-header">
          {currentFolderId && (
            <>
              <button onClick={handleBack}>&larr; Back</button>
              <h2>{currentFolderName}</h2>
            </>
          )}
        </div>

        <div className="content">
          {/* Folder Container */}
          <div className="folder-container">
            <h3>Folders</h3>
            <div className="folder-list">
              {filteredFolders.length > 0 ? (
                filteredFolders.map((folder) => (
                  <div key={folder.id} className="folder-item">
                    <p onClick={() => handleOpenFolder(folder)}>
                      <span>
                        <FaFolder style={{ color: "burlywood" }} />
                      </span>{" "}
                      <span>{folder.name}</span>
                    </p>

                    <button
                      className="folder-dropdown"
                      onClick={() =>
                        setDropdownId(dropdownId === folder.id ? null : folder.id)
                      }
                    >
                      <FaEllipsisV />
                    </button>
                    {dropdownId === folder.id && (
                      <div className="folder-dropdown-menu">
                        <button onClick={() => setRenameId(folder.id)}>Rename</button>
                        <button
                          className="download-button"
                          onClick={() => handleFolderDownload(folder)}
                          disabled={isDownloading}
                        >
                          {isDownloading ? (
                            <span>Downloading...</span>
                          ) : (
                            <>
                              <span>Download</span>
                            </>
                          )}
                        </button>
                        <button onClick={() => handleMove(folder)}>Move</button>
                        {showMoveCard && (
                         <Dialog open={true} onClose={() => setShowMoveCard(false)}>
                         <DialogTitle>Move to Folder</DialogTitle>
                         <DialogContent>
                           <FormControl fullWidth>
                             <InputLabel>Choose Folder</InputLabel>
                             <Select
                               value={selectedFolderId}
                               onChange={(e) => setSelectedFolderId(e.target.value)}
                               label="Choose Folder"
                             >
                               {filteredFolders.map((folder) => (
                                 <MenuItem key={folder.id} value={folder.id}>
                                   {folder.name}
                                 </MenuItem>
                               ))}
                             </Select>
                           </FormControl>
                         </DialogContent>
                         <DialogActions>
                           <Button onClick={confirmMove} color="primary">
                             Confirm Move
                           </Button>
                           <Button onClick={() => setShowMoveCard(false)} color="secondary">
                             Cancel
                           </Button>
                         </DialogActions>
                       </Dialog>
                        )}
                         <button onClick={() => handleMoveFolderToTrash(folder.id)}> Move to Trash</button>
  
                      </div>
                    )}
                    {renameId === folder.id && (
                      <Dialog open={true} onClose={() => setRenameId(null)}>
                      <DialogTitle>Rename Folder</DialogTitle>
                      <DialogContent>
                        <TextField
                          id="renameInput"
                          label="New Name"
                          value={rename}
                          onChange={(e) => setRename(e.target.value)}
                          fullWidth
                          placeholder="Enter new name"
                        />
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={() => handleRenameFolder(folder.id)} color="primary">
                          Submit
                        </Button>
                        <Button onClick={() => setRenameId(null)} color="secondary">
                          Cancel
                        </Button>
                      </DialogActions>
                    </Dialog>
                    )}
                  </div>
                ))
              ): (
                <p>No folders found</p>)}
            </div>
          </div>

          <div className="file-container">
            <h3>Files</h3>
            <div className="file-list">
              {filteredFiles.length === 0 ? (
                <h3>No files found</h3>
              ) : (
                filteredFiles.map((file) => (
                  <div
                    className="file-card "
                    key={file.id}
                    onMouseLeave={() => setDropdownId(null)}
                    onDobleClick={()=>handleFileClick(file)}
                    // onDoubleClick={}
                  >
                    <div className="file-icon">
                      <FaFileAlt />
                    </div>
                    <div className="file-name">{file.name}</div>
                    <div className="file-footer">
                      <p>{file.size} KB</p>
                      <p>Last modified: {file.modifiedDate}</p>
                    </div>
                    <button
                      className="dropdown-btn"
                      onClick={() => setDropdownId(dropdownId === file.id ? null : file.id)}
                    >
                      <FaEllipsisV />
                    </button>
                    {dropdownId === file.id && (
                      <div className="dropdown-menu">
                        <button onClick={() => setRenameId(file.id)}>Rename</button>
                        <button
                          className="download-button"
                          onClick={() => handleFileDownload(file)}
                          disabled={isDownloading}
                        >
                          {isDownloading ? (
                            <span>Downloading...</span>
                          ) : (
                            <>
                              <span >Download</span>
                            </>
                          )}
                        </button>
                        <button onClick={() => handleMove(file)}>Move</button>
                        {showMoveCard && (
                           <Dialog open={true} onClose={() => setShowMoveCard(false)}>
                           <DialogTitle>Move to Folder</DialogTitle>
                           <DialogContent>
                             <FormControl fullWidth>
                               <InputLabel>Choose Folder</InputLabel>
                               <Select
                                 value={selectedFolderId}
                                 onChange={(e) => setSelectedFolderId(e.target.value)}
                                 label="Choose Folder"
                               >
                                 {filteredFolders.map((folder) => (
                                   <MenuItem key={folder.id} value={folder.id}>
                                     {folder.name}
                                   </MenuItem>
                                 ))}
                               </Select>
                             </FormControl>
                           </DialogContent>
                           <DialogActions>
                             <Button onClick={confirmMove} color="primary">
                               Confirm Move
                             </Button>
                             <Button onClick={() => setShowMoveCard(false)} color="secondary">
                               Cancel
                             </Button>
                           </DialogActions>
                         </Dialog>
                        )}
                        <button onClick={() => handleMoveFileToTrash(file.id)}>
                          Move to Trash
                        </button>
                      </div>
                    )}
                    {renameId === file.id && (
                     <Dialog open={true} onClose={() => setRenameId(null)}>
                     <DialogTitle>Rename File</DialogTitle>
                     <DialogContent>
                       <TextField
                         id="renameInput"
                         label="New Name"
                         value={rename}
                         onChange={(e) => setRename(e.target.value)}
                         fullWidth
                         placeholder="Enter new name"
                       />
                     </DialogContent>
                     <DialogActions>
                       <Button onClick={() => handleRenameFile(file.id)} color="primary">
                         Submit
                       </Button>
                       <Button onClick={() => setRenameId(null)} color="secondary">
                         Cancel
                       </Button>
                     </DialogActions>
                   </Dialog>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          {showImage && <ImageView  imageId={imageId} onClose={() => setShowImage(false)} />}
        </div>

      </div>
    </>
  );
}

export default Home;
