import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaFolder, FaFileAlt, FaEllipsisV } from "react-icons/fa";
import { Download as DownloadIcon } from '@mui/icons-material';
import Header from "./Header";
import Sidebar from "./Sidebar";
import FileCard from "./FileCard";
import { useAuth } from "./AuthContext";
import { useSnackbar } from "notistack";


function Home() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [dropdownId, setDropdownId] = useState(null);
  const [renameId, setRenameId] = useState(null);
  const [rename, setRename] = useState("");
  // NEW: Add download state
  const [isDownloading, setIsDownloading] = useState(false);
  const {user,loading,setLoading} = useAuth()
  const {enqueueSnackbar}=useSnackbar()

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user && user.id) {
          const fileResponse = await axios.get(
            `http://localhost:5555/api/fileuser/${user.id}`
          );
          setFiles(Array.isArray(fileResponse.data) ? fileResponse.data : []);
          setFilteredFiles(
            Array.isArray(fileResponse.data) ? fileResponse.data : []
          );

          const folderResponse = await axios.get(
            `http://localhost:5555/api/folderuser/${user.id}`
          );
          setFolders(
            Array.isArray(folderResponse.data) ? folderResponse.data : []
          );
          setFilteredFolders(
            Array.isArray(folderResponse.data) ? folderResponse.data : []
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

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

  const handleRenameFile = async (fileId) => {
    try {
      const response = await fetch(`http://localhost:5555/api/files/${fileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: rename }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to rename file. Status: ${response.status}`);
      }
  
      const contentType = response.headers.get("content-type");
      const data = contentType && contentType.includes("application/json")
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
  };

  const handleRenameFolder = async (folderId) => {
    try {
      const response = await fetch(`http://127.0.0.1:5555/api/folders/${folderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: rename }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to rename folder. Status: ${response.status}`);
      }
  
      const contentType = response.headers.get("content-type");
      const data = contentType && contentType.includes("application/json")
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
  const handleDownload = async (file) => {
    try {
      setIsDownloading(true);
      enqueueSnackbar('Starting download...', { variant: 'info' });

      const response = await fetch(`http://127.0.0.1:5555/api/files/${file.id}/download`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      enqueueSnackbar('File downloaded successfully', { variant: 'success' });
    } catch (error) {
      console.error('Download error:', error);
      enqueueSnackbar('Failed to download file', { variant: 'error' });
    } finally {
      setIsDownloading(false);
    }
  };

  // NEW: Folder download handler
  const handleFolderDownload = async (folder) => {
    try {
      setIsDownloading(true);
      enqueueSnackbar('Preparing folder for download...', { variant: 'info' });

      const response = await fetch(`http://127.0.0.1:5555/api/folders/${folder.id}/download`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Folder download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${folder.name}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      enqueueSnackbar('Folder downloaded successfully', { variant: 'success' });
    } catch (error) {
      console.error('Folder download error:', error);
      enqueueSnackbar('Failed to download folder', { variant: 'error' });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleMoveFolderToTrash = (folderId) => {
    fetch(`http://localhost:5555/api/folders/${folderId}/move-to-trash`, {
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
        setFolders((prevFolders) => prevFolders.filter((f) => f.id !== folderId));
      })
      .catch((error) => {
        console.error("Error moving folder to bin:", error);
        enqueueSnackbar("Error moving folder to bin", { variant: 'error' });
      });
  }; 

  return (
    <>
      <Header onFilter={handleFilter} />
      <Header onFilter={handleFilter} />
      <Sidebar />
      <div
        className="Container"
        style={{ backgroundColor: "white", borderRadius: "10px" }}
      >
        <h1 style={{ color: "black" }}>Welcome to Drive</h1>
        <div>
          <h3>Folders</h3>
          <div className="content">
            {filteredFolders.map((folder) => (
              <div key={folder.id}>
                <p style={{ display: "inline-block", border:'1px solid gray', padding:'10px', width:'200px' }}>
                  <FaFolder style={{ color: "burlywood" }} /> {folder.name}
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
                          <DownloadIcon className="dropdown-icon" />
                          <span>Download</span>
                        </>
                      )}
                    </button>
                    <button>Move</button>
                    <button onClick={() => handleMoveToTrash(folder.id)}>
                      Move to Trash
                    </button>
                  </div>
                )}
                {renameId === folder.id && (
                  <div className="rename-form">
                    <label htmlFor="renameInput">New Name:</label>
                    <input
                      type="text"
                      id="renameInput"
                      value={rename}
                      onChange={(e) => setRename(e.target.value)}
                      placeholder="Enter new name"
                    />
                    <button onClick={() => handleRenameFolder(folder.id)}>
                      Submit
                    </button>
                    <button onClick={() => setRenameId(null)}>Cancel</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div>
            <h3>Files</h3>

            
            {filteredFiles.map((file) => (
              <div
                className="file-card"
                key={file.id}
                onMouseLeave={() => setDropdownId(null)}
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
                  onClick={() =>
                    setDropdownId(dropdownId === file.id ? null : file.id)
                  }
                >
                  <FaEllipsisV />
                </button>
                {dropdownId === file.id && (
                  <div className="dropdown-menu">
                    <button onClick={() => setRenameId(file.id)}>Rename</button>
                    <button 
                      className="download-button"
                      onClick={() => handleDownload(file)}
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
                    <button>Move</button>
                    <button onClick={() => handleMoveToTrash(file.id)}>
                      Move to Trash
                    </button>
                  </div>
                )}
                {renameId === file.id && (
                  <div className="rename-form">
                    <label htmlFor="renameInput">New Name:</label>
                    <input
                      type="text"
                      id="renameInput"
                      value={rename}
                      onChange={(e) => setRename(e.target.value)}
                      placeholder="Enter new name"
                    />
                    <button onClick={() => handleRenameFile(file.id)}>
                      Submit
                    </button>
                    <button onClick={() => setRenameId(null)}>Cancel</button>
                  </div>
                )}
              </div>
            ))} 
           
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;