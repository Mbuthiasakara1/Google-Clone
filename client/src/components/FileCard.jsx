import React, { useState } from "react";
import { FaEllipsisV, FaFileAlt } from "react-icons/fa";
import { useAuth } from "./AuthContext";
import { useSnackbar } from "notistack";
import {
  Dialog,
  DialogActions,
  TextField,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";

import {
  Description,
  Image,
  PictureAsPdf,
  VideoFile,
  AudioFile,
  InsertDriveFile,
  Folder,
  TableChart,
  Article,
} from "@mui/icons-material";
import useStore from "./Store";

function FileCard({
  file,
  setFiles,
  setFilteredFiles,
  filteredFolders,
  filteredFiles,
  folders,
  onFileClick,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [displayRenameForm, setDisplayRenameForm] = useState(false);
  const [rename, setRename] = useState("");
  const [showMoveCard, setShowMoveCard] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  // NEW: Add state for download status
  const [isDownloading, setIsDownloading] = useState(false);
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();


  if (!file) {
    return null;
  }

  const getFileIcon = () => {
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

  const handleRename = (fileId) => {
    fetch(`http://localhost:5555/api/files/${fileId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: rename }),
    })
      .then((response) => response.json())
      .then((data) => {
        setRename(data.name);
        setDisplayRenameForm(false);
      });

  };

  // UPDATED: Enhanced download handler with progress feedback
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      enqueueSnackbar("Starting download...", { variant: "info" });

      const response = await fetch(
        `http://localhost:5555/api/files/${file.id}/download`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const contentDisposition = response.headers.get("Content-Disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : file.name;

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
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

  const handleMoveToTrash = (fileId) => {
    console.log(fileId);
    if (!fileId) {
      console.error("No file selected or file id is missing");
      enqueueSnackbar("No file selected or file ID is missing", {
        variant: "error",
      });
      return;
    }

    fetch(`http://localhost:5555/api/files/${fileId}/move-to-trash`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bin: true }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to move file to bin");
        }
        return response.json();
      })
      .then((data) => {
        console.log("File moved to bin:", data);
        enqueueSnackbar("file successfully moved to bin", {
          variant: "success",
        });
        setFilteredFiles((prevFiles) =>
          prevFiles.filter((f) => f.id !== file.id)
        );
      })
      .catch((error) => {
        console.error("Error moving file to bin:", error);
        enqueueSnackbar("Error moving file to bin", { variant: "error" });
        enqueueSnackbar("Error moving file to bin", { variant: "error" });
      });
      
  };

  const handleMove = () => {
    setShowMoveCard(true);
  };

  const confirmMove = () => {
    if (selectedFolderId) {
      fetch(`/files/${file.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId: selectedFolderId }),
      })
        .then((response) => response.json())
        .then((updatedFile) => {
          console.log("File moved to folder:", updatedFile.folderId);
          setShowMoveCard(false);
          setShowDropdown(false);
        });
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
      onFileClick(file.id);
    } else {
      console.log("This is not an image file.");
    }
  }

  return (
    <div className="file-card">
      <div
        className="file-card"
        onDoubleClick={() => handleFileClick(file)}
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
          transition: "all 0.3s cubic-bezier(.25,.8,.25,1)",
          position: "relative",
        }}
        onMouseLeave={() => setShowDropdown(false)}
      >
        <div
          className="file-icon-wrapper"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            backgroundColor: "#f8f9fa",
          }}
        >
          {getFileIcon()}
        </div>

        <div
          className="file-details"
          style={{
            padding: "12px",
            borderTop: "1px solid #eee",
          }}
        >
          <div
            className="file-name"
            style={{
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "4px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {file.name}
          </div>

          <div
            className="file-info"
            style={{
              fontSize: "12px",
              color: "#666",
            }}
          >
            <div>{formatFileSize(file.filesize)}</div>
            <div>{formatDate(file.updated_at || file.created_at)}</div>
          </div>
        </div>
        <button
          className="dropdown-btn"
          onClick={(e) => {
            e.stopPropagation();
            setShowDropdown(!showDropdown);
          }}
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <FaEllipsisV />
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="dropdown-menu">
            <button onClick={() => setDisplayRenameForm(true)}>Rename</button>
            <button
              
              onClick={handleDownload}
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
            <button onClick={handleMove}>Move</button>
            <button onClick={() => handleMoveToTrash(file.id)}>
              Move To Trash
            </button>
          </div>
        )}
      </div>

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
            <Button onClick={()=>handleRename(file.id)} color="primary">
              Submit
            </Button>
            <Button
              onClick={() => setDisplayRenameForm(false)}
              color="secondary"
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {showMoveCard && (
        <>
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
        </>
      )}
    </div>
  );
}

export default FileCard;
