import React, { useState } from "react";
import { FaEllipsisV, FaFileAlt } from "react-icons/fa";
import { useAuth } from './AuthContext'
import { useSnackbar } from "notistack";
import { Description, Image, PictureAsPdf, VideoFile, AudioFile, InsertDriveFile, Folder, TableChart, Article } from '@mui/icons-material';

function FileCard({ file, files, setFiles, onFolderClick, folders }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [displayRenameForm, setDisplayRenameForm] = useState(false);
  const [rename, setRename] = useState("");
  const [showMoveCard, setShowMoveCard] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const { user } = useAuth()
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

  // const handleMove = () => {
  //   Show the folder selection card
  //   setShowMoveCard(true);
  // };

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
      })
  // const confirmMove = () => {
  //   if (selectedFolderId) {
  //     fetch(`http://localhost:3001/files/${file.id}`, {
  //       method: "PATCH",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ folderId: selectedFolderId }),
  //     })
  //     .then((response) => response.json())
  //     .then((updatedFile) => {
  //       console.log("File moved to folder:", updatedFile.folderId);
  //       setShowMoveCard(false); 
  //       setShowDropdown(false); 
  //     })
  //     .catch((error) => console.error("Move error:", error));
  //   }
  // };
  
  const handleMoveToBin = () => {
    if (!file || !file.id) {
      enqueueSnackbar("No file selected", { variant: "error" });
      return;
    }
  
    fetch(`http://localhost:3001/files/${file.id}`, {
      method: 'PATCH',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bin: true }),
    })
      .then((r) => r.json())
      .then((data) => {
        console.log("File moved to bin:", data);
        setFiles(files.filter(f => f.id !== file.id)); 
      })
      .catch((error) => console.error("Move error:", error));
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
        setError(error)
        enqueueSnackbar(error.message || 'An error occurred. Try again.', { 
          variant: 'error' 
        });
      }
    }
  };
  
  console.log(file.url)

  return (
    <div className="file-card" onMouseLeave={() => setShowDropdown(false)}>
      <div 
        className="file-card" 
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
          position: 'relative',
          overflow: 'hidden',
          cursor: file.type === "folder" || file.filetype === "folder" ? 'pointer' : 'default'
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
          <div className="dropdown-menu">
            <button onClick={() => setDisplayRenameForm(true)}>Rename</button>
            <button onClick={handleDownload}>Download</button>
            <button onClick={handleDelete}>Delete</button>
          </div>
        )}
      </div>
      
      <div className="file-icon" >
       <img  style={{width:'30%'}} src={file.url} alt=""/>
      </div>
      <div className="file-name">{file.name}</div>
      <div className="file-footer">
        <p>{file.size} KB</p>
        <p>Last modified: {file.modifiedDate}</p>
      </div>
      <button
        className="dropdown-btn"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <FaEllipsisV />
      </button>
      {showDropdown && (
        <div className="dropdown-menu">
          <button onClick={() => setDisplayRenameForm(!displayRenameForm)}>
            Rename
          </button>
          <button onClick={handleDownload}>Download</button>
          <button onClick={handleMove}>Move</button>
          <button onClick={handleMoveToBin}>Move to Bin</button>
        </div>
      )}
      {displayRenameForm && (
        <div className="rename-form">
          <input 
            value={rename} 
            onChange={(e) => setRename(e.target.value)} 
            placeholder="Enter new name"
          />
          <button onClick={handleRename}>Confirm</button>
          <button onClick={() => setDisplayRenameForm(false)}>Cancel</button>
        </div>
      )}
    
      {showMoveCard && (
        <div className="move-card">
          <h4>Choose a Folder</h4>
          <select
          value={selectedFolderId} 
            onChange={(e) => setSelectedFolderId(e.target.value)}
          >
            <option value="">Select Folder</option>
            {folders.map(folder => (
              <option key={folder.id} value={folder.id}>{folder.name}</option>
            ))}
          </select>
          <button onClick={confirmMove}>Move</button>
          <button onClick={() => setShowMoveCard(false)}>Cancel</button>
        </div>
      )} 
    </div>
  );
}
}
export default FileCard;
