import React, { useState } from "react";
import { FaEllipsisV, FaFileAlt } from "react-icons/fa";
import { useAuth } from './AuthContext';
import { useSnackbar } from "notistack";
import { Description, Image, PictureAsPdf, VideoFile, AudioFile, InsertDriveFile, Folder, TableChart, Article } from '@mui/icons-material';

function FileCard({ file, files, setFiles, onFolderClick, folders }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [displayRenameForm, setDisplayRenameForm] = useState(false);
  const [rename, setRename] = useState("");
  const [showMoveCard, setShowMoveCard] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const getFileIcon = () => {
    if (file.type === "folder" || file.filetype === "folder") {
      return (
        <div onClick={() => onFolderClick && onFolderClick(file.id)} style={{ cursor: 'pointer' }}>
          <Folder sx={{ fontSize: 60, color: '#5f6368' }} />
        </div>
      );
    }

    const extension = file.name?.split('.').pop()?.toLowerCase() || '';
    const fileType = (file.filetype || file.type || '').toLowerCase();
    const documentTypes = ['doc', 'docx', 'txt', 'rtf', 'odt', 'text', 'document'];
    const spreadsheetTypes = ['xlsx', 'xls', 'csv', 'ods', 'spreadsheet'];
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'image'];
    const videoTypes = ['mp4', 'mov', 'avi', 'webm', 'mkv', 'video'];
    const audioTypes = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'audio'];

    const isType = (types) => types.some(type => fileType.includes(type) || extension === type || (file.mimeType && file.mimeType.includes(type)));

    if (isType(imageTypes)) return <Image sx={{ fontSize: 60, color: '#4285f4' }} />;
    if (isType(['pdf'])) return <PictureAsPdf sx={{ fontSize: 60, color: '#FF4B4B' }} />;
    if (isType(videoTypes)) return <VideoFile sx={{ fontSize: 60, color: '#673ab7' }} />;
    if (isType(audioTypes)) return <AudioFile sx={{ fontSize: 60, color: '#00c853' }} />;
    if (isType(spreadsheetTypes)) return <TableChart sx={{ fontSize: 60, color: '#1D6F42' }} />;
    if (isType(documentTypes)) return <Description sx={{ fontSize: 60, color: '#2B579A' }} />;

    return <InsertDriveFile sx={{ fontSize: 60, color: '#5f6368' }} />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleRename = () => {
    fetch(`http://localhost:5555/api/files/${file.id}`, {
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

  const handleDownload = () => {
    fetch(`http://localhost:5555/api/files/${file.id}`, {
      method: "GET",
      headers: { "Content-Type": "application/octet-stream" },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        const extension = file.name.split(".").pop();
        link.setAttribute("download", `${file.id}.${extension}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => console.error("Download error:", error));
  };

  const handleMoveToTrash = () => {
    if (!file || !file.id) {
      console.error("No file selected or file id is missing");
      enqueueSnackbar("No file selected or file ID is missing", { variant: 'error' });
      return;
    }

    fetch(`http://127.0.0.1:5555/api/files/${file.id}/move-to-trash`, {
      method: 'PATCH',
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
        enqueueSnackbar("file successfully moved to bin", { variant: 'success' });
        setFiles((prevFiles) => prevFiles.filter((f) => f.id !== file.id));
      })
      .catch((error) => {
        console.error("Error moving file to bin:", error);
        enqueueSnackbar("Error moving file to bin", { variant: 'error' });
      });
  }
  
  const handleMove = () => {
    setShowMoveCard(true);
  };

  const confirmMove = () => {
    if (selectedFolderId) {
      fetch(`http://localhost:3001/files/${file.id}`, {
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

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      try {
        const response = await fetch(`http://localhost:5555/api/files/${user.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Failed to delete file');
        }
      } catch (error) {
        enqueueSnackbar(error.message || 'An error occurred. Try again.', { variant: 'error' });
      }
    }
  };

  return (
    <div className="file-card" onMouseLeave={() => setShowDropdown(false)}>
      <div className="file-card-inner">
        <div onClick={() => (file.type === "folder" || file.filetype === "folder") && onFolderClick(file.id)}>
          {getFileIcon()}
        </div>

        <div className="file-details">
          <div className="file-name">{file.name}</div>
          <div className="file-info">
            <div>{formatFileSize(file.filesize)}</div>
            <div>{formatDate(file.updated_at || file.created_at)}</div>
          </div>
        </div>

        <button className="dropdown-btn" onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}>
          <FaEllipsisV />
        </button>

        {showDropdown && (
          <div className="dropdown-menu">
            <button onClick={() => setDisplayRenameForm(true)}>Rename</button>
            <button onClick={handleDownload}>Download</button>
            <button onClick={handleMove}>Move</button>
            <button onClick={handleMoveToTrash}>Move to Trash</button>
          </div>
        )}

        {displayRenameForm && (
          <div className="rename-form">
            <input value={rename} onChange={(e) => setRename(e.target.value)} placeholder="Enter new name" />
            <button onClick={handleRename}>Confirm</button>
            <button onClick={() => setDisplayRenameForm(false)}>Cancel</button>
          </div>
        )}

        {showMoveCard && (
          <div className="move-card">
            <select value={selectedFolderId} onChange={(e) => setSelectedFolderId(e.target.value)}>
              <option value="">Select Folder</option>
              {folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
            </select>
            <button onClick={confirmMove}>Move</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileCard;
