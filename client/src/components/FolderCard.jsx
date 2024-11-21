import React, { useState, useEffect } from "react";
import { FaEllipsisV, FaFolder } from "react-icons/fa";
import { useSnackbar } from "notistack";
import { MdDownload, MdDriveFileRenameOutline, MdDriveFileMoveOutline, MdDelete} from "react-icons/md";
import { Dialog, DialogActions,TextField, DialogContent, DialogTitle, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import useStore from "./Store";

function FolderCard({ folder, onFolderClick}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [displayRenameForm, setDisplayRenameForm] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [showMoveCard, setShowMoveCard] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const{filteredFolders, rename, setRename, setMoveItem, renameId, setRenameId} = useStore()
  const { enqueueSnackbar } = useSnackbar();

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };  
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
      
      setRename("");
      setDisplayRenameForm(false)
      enqueueSnackbar("Folder renamed successfully!", { variant: "success" });
    } catch (error) {
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
  

  const handleMove = () => {
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
        `http://localhost:5555/api/folders/${folder.id}/move`,
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

    } catch (error) {
      console.error("Error moving file:", error);
      enqueueSnackbar("Failed to move file.", { variant: "error" });
    }
  };

  // Function to handle moving a folder to trash
  const handleMoveToTrash = (item) => {
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
        setMoveItem(item)
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
      <div>{formatDate(folder.created_at)}</div>
      <div>{formatDate(folder.updated_at)}</div>
      </div>
      <button className="dropdown-btn" onClick={() => setShowDropdown((prev) => (prev === folder.id ? null : folder.id))}
      >
        <FaEllipsisV />
      </button>
      {showDropdown === folder.id && (
        <div className="folder-dropdown-menu">
        <div className="menu-item">
          <MdDriveFileRenameOutline />
          <button onClick={() => {
            setRenameId(folder.id);
            setDisplayRenameForm(true);
            }}
            >
              Rename
            </button>
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
          <button onClick={() => handleMoveToTrash(folder.id)}>Move to Trash</button>
        </div>
        </div>
      )}
      {displayRenameForm && (
        <Dialog open={displayRenameForm} onClose={() => setDisplayRenameForm(false)}>
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
          <Button onClick={() => handleRenameFolder(renameId)} color="primary">
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