import React, { useState, useEffect } from "react";
import { FaEllipsisV, FaFolder } from "react-icons/fa";
import { useSnackbar } from "notistack";
// NEW: Import Download icon
import { Download as DownloadIcon } from '@mui/icons-material';
import useStore from "./Store";

function FolderCard({ folder, onFolderClick}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [displayRenameForm, setDisplayRenameForm] = useState(false);
  const [rename, setRename] = useState(folder.name);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [showMoveCard, setShowMoveCard] = useState(false);
  // NEW: Add download state
  const [isDownloading, setIsDownloading] = useState(false);
  const{folders, setFolders, filteredFolders, setFilteredFolders} = useStore()
  const { enqueueSnackbar } = useSnackbar();

  
  // Function to handle renaming a folder
  const handleRenameFolder = async (folderId) => {
    console.log("Renaming folder with ID:", folderId); 
    try {
      const response = await fetch(`http://localhost:5555/api/folders/${folderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: rename }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to rename folder. Status: ${response.status}`);
      }
      const data = await response.json();
      setFolders((prevFolders) =>
        prevFolders.map((folder) =>
          folder.id === folderId ? { ...folder, name: data.name } : folder
        )  
      );
  
      setRename("");
      enqueueSnackbar("Folder renamed successfully!", { variant: "success" });
    } catch (error) {
      console.error("Rename error:", error);
      enqueueSnackbar(error.message || "An error occurred while renaming.", {
        variant: "error",
      });
    }
  };

  // NEW: Add folder download handler
  const handleFolderDownload = async () => {
    setIsDownloading(true);
    enqueueSnackbar("Preparing folder for download...", { variant: "info" });
  
    try {
      const response = await fetch(`http://localhost:5555/api/folders/${folder.id}/download`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Folder download failed");
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
  
      const link = document.createElement("a");
      link.href = url;
      link.download = `${folder.name}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
  
      enqueueSnackbar("Folder downloaded successfully!", { variant: "success" });
    } catch (error) {
      console.error("Folder download error:", error);
      enqueueSnackbar("Failed to download folder", { variant: "error" });
    } finally {
      setIsDownloading(false);
    }
  };
  

  // Function to handle showing the move card
  const handleMove = () => {
    setShowMoveCard(true);
  };

  // Function to confirm moving a folder
  const confirmMove = () => {
    if (selectedFolderId) {
      fetch(`http://localhost:5555/folders/${folder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId: selectedFolderId }),
      })
        .then((response) => response.json())
        .then((updatedFolder) => {
          console.log("Folder moved to:", updatedFolder.folderId);
          setShowMoveCard(false);
          setShowDropdown(false);
        })
        .catch((error) => console.error("Move error:", error));
    }
  };

  // Function to handle moving a folder to trash
  const handleMoveToTrash = () => {
    if (!folder || !folder.id) {
      console.error("No folder selected or folder id is missing");
      enqueueSnackbar("No folder selected or folder ID is missing", { variant: 'error' });
      return;
    }

    fetch(`http://localhost:5555/api/folders/${folder.id}/move-to-trash`, {
      method: 'PATCH',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bin: true }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to move folder to bin");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Folder moved to bin:", data);
        enqueueSnackbar("Folder successfully moved to bin", { variant: 'success' });
        setFolders((prevFolders) => prevFolders.filter((f) => f.id !== folder.id));
      })
      .catch((error) => {
        console.error("Error moving folder to bin:", error);
        enqueueSnackbar("Error moving folder to bin", { variant: 'error' });
      });
  }; 

  return (
    <div className="file-card" onMouseLeave={() => setShowDropdown(false)} onClick={() => onFolderClick(folder.id)}>
      <div className="file-icon">
        <FaFolder />
      </div>
      <div className="file-name">{folder.name}</div>
      <div className="file-footer">
      <p>{folder.size != null ? `${folder.size} KB` : "N/A"}</p>
        <p>Last modified: {folder.modifiedDate || "N/A"}</p>
      </div>
      <button className="dropdown-btn" onClick={() => setShowDropdown((prev) => (prev === folder.id ? null : folder.id))}
      >
        <FaEllipsisV />
      </button>
      {showDropdown === folder.id && (
        <div className="dropdown-menu">
          <button onClick={() => setDisplayRenameForm(!displayRenameForm)}>
            Rename
          </button>
          {/* NEW: Add download button with icon and loading state */}
          <button 
            className="download-button"
            onClick={handleFolderDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <span>Downloading...</span>
            ) : (
              <>
                <DownloadIcon className="dropdown-icon" />
                <span>Download</span>
              </>
            )}
          </button>
          <button onClick={handleMove}>Move</button>
          <button onClick={handleMoveToTrash}>Move to Trash</button>
        </div>
      )}
      {displayRenameForm && (
        <div className="rename-form">
          <label htmlFor="renameInput">New Name:</label>
          <input
            style={{ height: '40px' }}
            type="text"
            id="renameInput"
            value={rename}
            onChange={(e) => setRename(e.target.value)}
            placeholder="Enter new name"
          />
          <button onClick={() => handleRenameFolder(folder.id)}>Submit</button>
          <button onClick={() => setDisplayRenameForm(false)}>Cancel</button>
        </div>
      )}
      {showMoveCard  && (
        <div className="move-card">
          <h4>Choose a Folder</h4>
          <select
            onChange={(e) => setSelectedFolderId(e.target.value)}
            value={selectedFolderId || ""}
          >
            <option value="">Select Folder</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
          <button onClick={confirmMove}>Move</button>
          <button onClick={() => setShowMoveCard(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
} 

export default FolderCard;