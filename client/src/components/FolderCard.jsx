import React, { useState, useEffect } from "react";
import { FaEllipsisV, FaFolder } from "react-icons/fa";
import { useSnackbar } from "notistack";
import { MdDownload, MdDriveFileRenameOutline, MdDriveFileMoveOutline, MdDelete} from "react-icons/md";
import { Dialog, DialogActions,TextField, DialogContent, DialogTitle, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import useStore from "./Store";

function FolderCard({ folder, onFolderClick}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [displayRenameForm, setDisplayRenameForm] = useState(false);
  // const [rename, setRename] = useState(folder.name);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [showMoveCard, setShowMoveCard] = useState(false);
  const [renameId, setRenameId]=useState(null)
  // NEW: Add download state
  const [isDownloading, setIsDownloading] = useState(false);
  const{folders, setFolders, filteredFolders, setFilteredFolders, rename, setRename} = useStore()
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
      setDisplayRenameForm(false)
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
  

  const handleMove = (item) => {
    setShowMoveCard(true);
    setSelectedFolderId(null);  // Reset folder selection
  };

  const confirmMove = async () => {
    if (!selectedFolderId) {
      enqueueSnackbar("Please select a folder to move into.", {
        variant: "warning",
      });
      return;
    }

    try {
      // Moving the file
      const response = await fetch(
        `http://localhost:5555/api/folders/${file.id}/move`,
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

      // Update the local state to reflect the changes
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.id === file.id ? { ...file, folderId: selectedFolderId } : file
        )
      );
    } catch (error) {
      console.error("Error moving file:", error);
      enqueueSnackbar("Failed to move file.", { variant: "error" });
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
    <div className="file-card" onMouseLeave={() => setShowDropdown(false)} onDoubleClick={() => onFolderClick(folder.id)}>
      <div className="file-icon">
        <FaFolder   />
      </div>
      <div className="file-name">{folder.name}</div>
      <div className="file-footer">
        <p>created at: {folder.created_at}</p>
        <p>Last modified: {folder.updated_at || "N/A"}</p>
      </div>
      <button className="dropdown-btn" onClick={() => setShowDropdown((prev) => (prev === folder.id ? null : folder.id))}
      >
        <FaEllipsisV />
      </button>
      {showDropdown === folder.id && (
        <div className="folder-dropdown-menu">
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
          <button onClick={() => handleMove(folder)}>Move</button>
        </div>
        <div className="menu-item">
          <MdDelete />
          <button onClick={() => handleMoveFolderToTrash(folder.id)}>Move to Trash</button>
        </div>
        </div>
      )}
      {displayRenameForm && (
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
          <Button onClick={() => handleRenameFolder(folder.id)} color="primary">
            Submit
          </Button>
          <Button onClick={() => setDisplayRenameForm(false)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      )}
      {showMoveCard  && (
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
    </div>
  );
} 

export default FolderCard;