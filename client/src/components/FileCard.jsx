import React, { useState } from "react";
import { FaEllipsisV, FaFolder, FaFileAlt } from "react-icons/fa";
import { useAuth } from './AuthContext'
import { useSnackbar } from "notistack";



function FileCard({ file }) {
import { FaEllipsisV } from "react-icons/fa";
import { Description, Image, PictureAsPdf, VideoFile, AudioFile, InsertDriveFile, Folder, TableChart, Article} from '@mui/icons-material';

function FileCard({ file, onFolderClick }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [displayRenameForm, setDisplayRenameForm] = useState(false);
  const [rename, setRename] = useState("");
  const { user } = useAuth()
  const { enqueueSnackbar } = useSnackbar();

  // Function to determine file icon based on file type and extension
  const getFileIcon = () => {
    // If it's a folder, return folder icon
    if (file.type === "folder" || file.filetype === "folder") {
      return (
        <div 
          onClick={() => onFolderClick && onFolderClick(file.id)} 
          style={{ cursor: 'pointer' }}
        >
          <Folder 
            sx={{ 
              fontSize: 60,
              color: '#5f6368'
            }} 
          />
        </div>
      );
    }

    // Get file extension and type
    const extension = file.name?.split('.').pop()?.toLowerCase() || '';
    const fileType = (file.filetype || file.type || '').toLowerCase();

    // Document types array for checking
    const documentTypes = ['doc', 'docx', 'txt', 'rtf', 'odt', 'text', 'document'];
    const spreadsheetTypes = ['xlsx', 'xls', 'csv', 'ods', 'spreadsheet'];
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'image'];
    const videoTypes = ['mp4', 'mov', 'avi', 'webm', 'mkv', 'video'];
    const audioTypes = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'audio'];
    
    // Check type against arrays and file extension
    const isType = (types) => {
      return types.some(type => 
        fileType.includes(type) || 
        extension === type ||
        (file.mimeType && file.mimeType.includes(type))
      );
    };

    // Determine icon based on type
    if (isType(imageTypes)) {
      return <Image sx={{ fontSize: 60, color: '#4285f4' }} />;
    }
    
    if (isType(['pdf'])) {
      return <PictureAsPdf sx={{ fontSize: 60, color: '#FF4B4B' }} />;
    }
    
    if (isType(videoTypes)) {
      return <VideoFile sx={{ fontSize: 60, color: '#673ab7' }} />;
    }
    
    if (isType(audioTypes)) {
      return <AudioFile sx={{ fontSize: 60, color: '#00c853' }} />;
    }
    
    if (isType(spreadsheetTypes)) {
      return <TableChart sx={{ fontSize: 60, color: '#1D6F42' }} />;
    }
    
    if (isType(documentTypes)) {
      return <Description sx={{ fontSize: 60, color: '#2B579A' }} />;
    }

    // Default file icon
    return <InsertDriveFile sx={{ fontSize: 60, color: '#5f6368' }} />;
  };

  // Function to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleRename = () => {
    fetch(`http://127.0.0.1:5555/api/files/${file.id}`, {
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
    fetch(`http://127.0.0.1:5555/api/files/${file.id}`, {
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

  const handleMove = () => {
    // Show the folder selection card
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
        setShowMoveCard(false); // Close the move card after confirming
        setShowDropdown(false); // Close the dropdown
      })
      .catch((error) => console.error("Move error:", error));
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      try {
        const response = await fetch(`http://127.0.0.1:5555/api/files/${user.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete file');
        }

        enqueueSnackbar('File Deleted!', {
          variant: 'success',
        });

      } catch (error) {
        setError(error);
        enqueueSnackbar(error.message || 'An error occurred. Try again.', {
          variant: 'error' 
        });
      }
    }
  };

  const handleDelete = () => {
    fetch(`http://127.0.0.1:5555/api/files/${file.id}`, { method: "DELETE" })
      .then(() => console.log("File moved to bin"));
  };

  return (
    <div className="file-card" onMouseLeave={() => setShowDropdown(false)}>
      <div className="file-icon">
        <FaFileAlt />
    <div 
      className="file-card" 
      onMouseLeave={() => setShowDropdown(false)}
      style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
        position: 'relative',
        overflow: 'hidden',
        cursor: (file.type === "folder" || file.filetype === "folder") ? 'pointer' : 'default'
      }}
      onClick={() => {
        if (file.type === "folder" || file.filetype === "folder") {
          onFolderClick && onFolderClick(file.id);
        }
      }}
    >
      <div 
        className="file-icon-wrapper"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          backgroundColor: '#f8f9fa'
        }}
      >
        {getFileIcon()}
      </div>
      
      <div 
        className="file-details"
        style={{
          padding: '12px',
          borderTop: '1px solid #eee'
        }}
      >
        <div 
          className="file-name" 
          style={{
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {file.name}
        </div>
        
        <div 
          className="file-info"
          style={{
            fontSize: '12px',
            color: '#666'
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
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        <FaEllipsisV />
      </button>

      {showDropdown && (
        <div 
          className="dropdown-menu"
          onClick={e => e.stopPropagation()}
        >
          <button onClick={() => setDisplayRenameForm(!displayRenameForm)}>
            Rename
          </button>
          <button onClick={handleDownload}>Download</button>
          <button onClick={handleMove}>Move</button>
          <button onClick={handleDelete}>Delete</button>
          <button onClick={handleDelete}>Move to Bin</button>
        </div>
      )}

      {displayRenameForm && (
        <div className="rename-form">
          <label htmlFor="renameInput">New Name:</label>
          <input
          style={{height:'40px'}}
            type="text"
            id="renameInput"
            value={rename}
            onChange={(e) => setRename(e.target.value)}
            placeholder="Enter new name"
          />
          <button onClick={handleRename}>Submit</button>
          <button onClick={() => setDisplayRenameForm(false)}>Cancel</button>
        </div>
      )}
      
      {/* Move to Folder Card */}
      {showMoveCard && (
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
        <div 
          className="rename-form"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px 0 rgb(60 64 67 / 30%), 0 4px 8px 3px rgb(60 64 67 / 15%)',
            width: '300px',
            zIndex: 1000
          }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              fontSize: '16px', 
              marginBottom: '8px',
              color: '#3c4043'
            }}>
              New Name:
            </div>
            <input
              type="text"
              value={rename}
              onChange={(e) => setRename(e.target.value)}
              placeholder="Enter new name"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #dadce0',
                borderRadius: '4px',
                fontSize: '14px',
                outline: 'none'
              }}
              autoFocus
            />
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            gap: '8px'
          }}>
            <button
              onClick={() => setDisplayRenameForm(false)}
              style={{
                padding: '8px 24px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: 'transparent',
                color: '#1a73e8',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleRename}
              style={{
                padding: '8px 24px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#1a73e8',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileCard;