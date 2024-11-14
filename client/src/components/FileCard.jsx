import React, { useState } from "react";
import { FaEllipsisV, FaFolder, FaFileAlt } from "react-icons/fa";
import { useAuth } from './AuthContext'
import { useSnackbar } from "notistack";



function FileCard({ file }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [displayRenameForm, setDisplayRenameForm] = useState(false);
  const [rename, setRename] = useState("");
  const { user } = useAuth()
  const { enqueueSnackbar } = useSnackbar();

  const handleRename = () => {
    fetch(`http://localhost:3001/files/${file.id}`, {
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
    fetch(`http://localhost:3001/files/${file.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/octet-stream",
      },
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
    console.log("Moving file...");
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


  return (
    <div className="file-card" onMouseLeave={() => setShowDropdown(false)}>
      <div className="file-icon">
        {file.type === "folder" ? <FaFolder /> : <FaFileAlt />}
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
          <button onClick={handleDelete}>Move to Bin</button>
        </div>
      )}
      {displayRenameForm && (
        <div className="rename-form">
          <label htmlFor="renameInput">New Name:</label>
          <input
            type="text"
            id="renameInput"
            value={rename}
            onChange={(e) => setRename(e.target.value)}
            placeholder="Enter new name"
          />
          <button onClick={handleRename}>Submit</button>
          <button onClick={()=>setDisplayRenameForm(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default FileCard;
