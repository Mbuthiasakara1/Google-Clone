import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaFolder,  FaEllipsisV } from "react-icons/fa";
import { MdDownload, MdDriveFileRenameOutline, MdDriveFileMoveOutline, MdDelete} from "react-icons/md";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useSnackbar } from "notistack";
import ImageView from "./ImageView";
import { useNavigate } from "react-router-dom";

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  TextField,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import useStore from "./Store";
import {
  Description,
  Image,
  PictureAsPdf,
  VideoFile,
  AudioFile,
  InsertDriveFile,
  TableChart,
} from "@mui/icons-material";
function Home() {
  const {
    filteredFolders,
    isCreatingFolder,
    filteredFiles,
    setFilteredFiles,
    setFilteredFolders,
    currentFolderId,
    setCurrentFolderId,
    isUploading,
    folderHistory,
    setFolderHistory,
    imageId,
    setImageId,
    showImage,
    setShowImage,
    moveItem,
    setMoveItem,
    user,
    loading,
    setLoading
  } = useStore();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [dropdownId, setDropdownId] = useState(null);
  const [folderDropdownId, setFolderDropdownId] = useState(null);
  const [renameId, setRenameId] = useState(null);
  const [rename, setRename] = useState("");
  const [showMoveCard, setShowMoveCard] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [currentFolderName, setCurrentFolderName] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const[moveFolder, setMoveFolder]=useState(null)
  const[moveFile, setMoveFile]=useState(null)
  const { enqueueSnackbar } = useSnackbar();
  
  
  const navigate=useNavigate()
  
  // if(!user){
  //   navigate("/login");
    
  // }

  useEffect(() => {
    const fetchData = async () => {
      // setLoading(true);

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

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  const getFileIcon = (file) => {

    const extension = file.name?.split(".").pop()?.toLowerCase() || "";
    const fileType = (file.filetype || file.type || "").toLowerCase();
    const documentTypes = [
      "doc",
      "docx",
      "txt",
      "rtf",
      "odt",
      "text",
      "document",
    ];
    const spreadsheetTypes = ["xlsx", "xls", "csv", "ods", "spreadsheet"];
    const imageTypes = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "image"];
    const videoTypes = ["mp4", "mov", "avi", "webm", "mkv", "video"];
    const audioTypes = ["mp3", "wav", "ogg", "m4a", "flac", "audio"];

    const isType = (types) =>
      types.some(
        (type) =>
          fileType.includes(type) ||
          extension === type ||
          (file.mimeType && file.mimeType.includes(type))
      );

    if (isType(imageTypes))
      return <Image sx={{ fontSize: 60, color: "#4285f4" }} />;
    if (isType(["pdf"]))
      return <PictureAsPdf sx={{ fontSize: 60, color: "#FF4B4B" }} />;
    if (isType(videoTypes))
      return <VideoFile sx={{ fontSize: 60, color: "#673ab7" }} />;
    if (isType(audioTypes))
      return <AudioFile sx={{ fontSize: 60, color: "#00c853" }} />;
    if (isType(spreadsheetTypes))
      return <TableChart sx={{ fontSize: 60, color: "#1D6F42" }} />;
    if (isType(documentTypes))
      return <Description sx={{ fontSize: 60, color: "#2B579A" }} />;
    return <InsertDriveFile sx={{ fontSize: 60, color: "#5f6368" }} />;

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

  const handleOpenFolder = (folder) => {
    // Save the current folder ID to history before opening a new one
    setFolderHistory((prevHistory) => [...prevHistory, currentFolderId]);

    // Open the new folder
    setCurrentFolderId(folder.id);
    setCurrentFolderName(folder.name);

    // Filter files and folders inside the clicked folder
    setFilteredFiles(files.filter((file) => file.folder_id === folder.id));
    setFilteredFolders(folders.filter((f) => f.parent_folder_Id === folder.id));
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

      setRename("");
      setRenameId(null);
      enqueueSnackbar("File renamed successfully!", { variant: "success" });
    } catch (error) {
      enqueueSnackbar(error.message || "An error occurred while renaming.", {
        variant: "error",
      });
    }
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
        setMoveItem(folderId);
      })
      .catch((error) => {
        console.error("Error moving folder to trash:", error);
        enqueueSnackbar("Error moving folder to trash", { variant: "error" });
      });
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
        setMoveItem(fileId);
      })
      .catch((error) => {
        // console.error("Error moving folder to trash:", error);
        enqueueSnackbar("Error moving file to trash", { variant: "error" });
      });
  };

  const handleMoveFile = (fileId) => {
    const itemToMove = files.find((file) => file.id === fileId)
    //  folders.find((folder) => folder.id === file.id);

    if (!itemToMove) {
      console.error("Item to move not found!");
      return;
    }

    setShowMoveCard(true);
    setSelectedFolderId(null); // Reset folder selection
    setMoveFile(itemToMove); // Set the full item object (file or folder)
  };

  const handleMoveFolder = (folderId) => {
    const folderToMove = folders.find((folder) => folder.id === folderId);

    if (!folderToMove) {
      console.error("Item to move not found!");
      return;
    }

    setShowMoveCard(true);
    setSelectedFolderId(null); // Reset folder selection
    setMoveFolder(folderToMove); // Set the full item object (file or folder)
  };

  const confirmMoveFile = async () => {
    if (!selectedFolderId) {
      enqueueSnackbar("Please select a folder to move into.", {
        variant: "warning",
      });
      return;
    }

    try {
      // Moving the file
      const response = await fetch(
        `http://127.0.0.1:5555/api/files/${moveItem.id}/move`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder_id: selectedFolderId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to move file");
      }

      enqueueSnackbar("File moved successfully!", { variant: "success" });
      setShowMoveCard(false);
      setMoveItem(null)

    } catch (error) {
      enqueueSnackbar("Failed to move file.", { variant: "error" });
    }
  };

  const confirmMoveFolder = async () => {
    if (!selectedFolderId) {
      enqueueSnackbar("Please select a folder to move into.", {
        variant: "warning",
      });
      return;
    }

    try {
      // Moving the file
      const response = await fetch(
        `http://127.0.0.1:5555/api/folders/${moveItem.id}/move`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parent_folder_id: selectedFolderId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to move file");
      }

      enqueueSnackbar("Folder moved successfully!", { variant: "success" });
      setShowMoveCard(false);
      setMoveItem(null)

    } catch (error) {
        console.error("Error during move:", error);
        enqueueSnackbar("Failed to move item. Please try again.", { variant: "error" });
      console.error("Error moving file:", error);
      enqueueSnackbar("Failed to move file.", { variant: "error" });
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

  function handleFileClick(file) {
    const isImage = checkForImage(file);
    if (isImage) {
      setImageId(file);
      setShowImage(true);
    }
  }

  function handleMouseLeave() {
    // Set a short timeout to prevent immediate dropdown closure
    setTimeout(() => {
      if (!document.activeElement.classList.contains("dropdown-item")) {
        setDropdownId(null);
      }
    }, 150);
  }
  

  return (
    <>
      <Header onFilter={handleFilter} />
      <Sidebar currentFolderId={currentFolderId} />
      <div className="Container">
      {loading ? (
          <div className="loader">
            <div className="spinner"></div>
            
          </div>
        ) : (
          <>
        <h1 style={{ color: "black" }}>Welcome to Drive</h1>

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
                      onClick={(e) =>{
                        e.stopPropagation();
                        setFolderDropdownId(
                          folderDropdownId === folder.id ? null : folder.id
                        )
                      }}
                    >
                      <FaEllipsisV />
                    </button>
                    {folderDropdownId === folder.id && (
                      <div className="folder-dropdown-menu" onMouseLeave={() => {
                        handleMouseLeave()
                        }}>
                        <div className="menu-item">
                          <MdDriveFileRenameOutline />
                          <button onClick={() => setRenameId(folder.id)}>Rename</button>
                        </div>
                        <div className="menu-item">
                          <MdDownload />
                          <button onClick={() => handleFolderDownload(folder)} disabled={isDownloading}>
                            {isDownloading ? 'Downloading...' : 'Download'}
                          </button>
                        </div>
                        <div className="menu-item">
                          <MdDriveFileMoveOutline />
                          <button onClick={() => handleMoveFolder(folder.id)}>Move</button>
                        </div>
                        {showMoveCard  && (
                          <Dialog
                            open={true}
                            onClose={() => {
                              setShowMoveCard(false)
                              setSelectedFolderId("")
                            }}
                          >
                            <DialogTitle>Move to Folder</DialogTitle>
                            <DialogContent>
                              <FormControl fullWidth>
                                <InputLabel>Choose Folder</InputLabel>
                                <Select
                                  value={selectedFolderId}
                                  onChange={(e) =>
                                    setSelectedFolderId(e.target.value)
                                  }
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
                              <Button onClick={confirmMoveFolder} color="primary">
                                Confirm Move
                              </Button>
                              <Button
                                onClick={() => setShowMoveCard(false)}
                                color="secondary"
                              >
                                Cancel
                              </Button>
                            </DialogActions>
                          </Dialog>
                        )}
                        <div className="menu-item">
                          <MdDelete />
                          <button onClick={() => handleMoveFolderToTrash(folder.id)}>Move to Trash</button>
                        </div>
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
                          <Button
                            onClick={() => handleRenameFolder(folder.id)}
                            color="primary"
                          >
                            Submit
                          </Button>
                          <Button
                            onClick={() => setRenameId(null)}
                            color="secondary"
                          >
                            Cancel
                          </Button>
                        </DialogActions>
                      </Dialog>
                    )}
                  </div>
                ))
              ) : (
                <p>No folders found</p>
              )}
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
                    onMouseLeave={() => {
                      handleMouseLeave()
                    }}
                    onDoubleClick={() => handleFileClick(file)}
                  >
                    <div className="file-icon">
                      {getFileIcon(file)}
                    </div>
                    <div className="file-name">{file.name}</div>
                    <div className="file-footer">
                      <div>{formatFileSize(file.filesize)}</div>
                      <div>{formatDate(file.updated_at || file.created_at)}</div>
                    </div>
                    <button
                      className="dropdown-btn"
                      onClick={(e) =>{
                        e.stopPropagation();
                        setDropdownId(dropdownId === file.id ? null : file.id)
                      }}
                    >
                      <FaEllipsisV />
                    </button>
                    {dropdownId === file.id && (
                      <div className="file-dropdown-menu">
                        <div className="menu-item">
                          <MdDriveFileRenameOutline className="dropdown-icons" />
                          <button onClick={() => setRenameId(file.id)}>Rename</button>
                        </div>
                        <div className="menu-item">
                          <MdDownload className="dropdown-icons" />
                          <button onClick={() => handleFileDownload(file)} disabled={isDownloading}>
                            {isDownloading ? 'Downloading...' : 'Download'}
                          </button>
                        </div>
                        <div className="menu-item">
                          <MdDriveFileMoveOutline className="dropdown-icons" />
                          <button onClick={() => handleMoveFile(file.id)}>Move</button>
                        </div>
                        {showMoveCard  && (
                          <Dialog
                            open={true}
                            onClose={() => {
                              setShowMoveCard(false)
                              setSelectedFolderId("")
                            }}
                          >
                            <DialogTitle>Move to Folder</DialogTitle>
                            <DialogContent>
                              <FormControl fullWidth>
                                <InputLabel>Choose Folder</InputLabel>
                                <Select
                                  value={selectedFolderId}
                                  onChange={(e) =>
                                    setSelectedFolderId(e.target.value)
                                  }
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
                              <Button onClick={confirmMoveFile} color="primary">
                                Confirm Move
                              </Button>
                              <Button
                                onClick={() => setShowMoveCard(false)}
                                color="secondary"
                              >
                                Cancel
                              </Button>
                            </DialogActions>
                          </Dialog>
                        )}
                        <div className="menu-item">
                          <MdDelete className="dropdown-icons" />
                          <button onClick={() => handleMoveFileToTrash(file.id)}>Move to Trash</button>
                        </div>
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
                          <Button
                            onClick={() => handleRenameFile(file.id)}
                            color="primary"
                          >
                            Submit
                          </Button>
                          <Button
                            onClick={() => setRenameId(null)}
                            color="secondary"
                          >
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
          {showImage && (
            <ImageView imageId={imageId} onClose={() => setShowImage(false)} />
          )}
          
        </div>
        </>
        )}
      </div>
    </>
  );
}

export default Home;
