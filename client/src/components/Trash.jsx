import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { FaFileAlt, FaFolder, FaEllipsisV } from "react-icons/fa";
import { useAuth } from "./AuthContext";

function Trash() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [showDropdown, setShowDropdown] = useState(null);
  const { user, loading, setLoading } = useAuth()

  useEffect(() => {
    setLoading(true);
  
    const fetchFiles = axios
      .get(`http://127.0.0.1:5555/api/trash/file/${user.id}`) // Corrected URL
      .then((res) => {
        if (Array.isArray(res.data)) {
          setFiles(res.data);
          setFilteredFiles(res.data);
        } else {
          console.error("Expected an array of files, got:", res.data);
          setFiles([]);
          setFilteredFiles([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching files:", error);
        setFiles([]);
        setFilteredFiles([]);
      });
  
    const fetchFolders = axios
      .get(`http://127.0.0.1:5555/api/trash/folder/${user.id}`) // Make sure this URL is correct
      .then((res) => {
        if (Array.isArray(res.data)) {
          setFolders(res.data);
          setFilteredFolders(res.data);
        } else {
          console.error("Expected an array of folders, got:", res.data);
          setFolders([]);
          setFilteredFolders([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching folders:", error);
        setFolders([]);
        setFilteredFolders([]);
      });
  
    Promise.all([fetchFiles, fetchFolders])
      .finally(() => setLoading(false));
  }, []);
  

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

  const handleFileRestore = (fileId) => {
    axios
      .patch(`http://127.0.0.1:5555/api/files/${fileId}`, { bin: false })
      .then(() => {
        setFilteredFiles(filteredFiles.filter((file) => file.id !== fileId));
      })
      .catch((error) => console.error("Error restoring file:", error));
  };

  const handleFolderRestore = (folderId) => {
    axios
      .patch(`http://localhost:3001/folders/${folderId}`, { bin: false })
      .then(() => {
        setFilteredFolders(filteredFolders.filter((folder) => folder.id !== folderId));
      })
      .catch((error) => console.error("Error restoring folder:", error));
  };

  const handleFileDelete = async (fileId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this file? This action cannot be undone."
      )
    ) {
      try {
        const response = await fetch(
          `http://127.0.0.1:5555/api/files/${fileId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete file ");
        }

        enqueueSnackbar("File Deleted!", {
          variant: "success",
        });
      } catch (error) {
        setError(error);
        enqueueSnackbar(error.message || "An error occurred. Try again.", {
          variant: "error",
        });
      }
    }
  };

  const handleFolderDelete = async (folderId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this folder? This action cannot be undone."
      )
    ) {
      try {
        const response = await fetch(
          `http://127.0.0.1:5555/api/folders/${folderId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete folder ");
        }

        enqueueSnackbar("Folder Deleted!", {
          variant: "success",
        });
      } catch (error) {
        setError(error);
        enqueueSnackbar(error.message || "An error occurred. Try again.", {
          variant: "error",
        });
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <>
      <Header  onFilter={handleFilter}/>
      <Sidebar />
      <div className="Container" style={{ backgroundColor: "white", borderRadius: "10px" }}>
        <h1 style={{ color: "black" }}>Welcome to Drive</h1>
       
        <div className="files-div">
          <div className="content">
            <h3>Files</h3>
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="file-card"
                onMouseLeave={() => setShowDropdown(null)}
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
                  onClick={() => setShowDropdown(file.id)}
                >
                  <FaEllipsisV />
                </button>
                {showDropdown === file.id && (
                  <div className="dropdown-menu">
                    <button onClick={() => handleFileRestore(file.id)}>Restore</button>
                    <button onClick={()=>handleFileDelete}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="folders-div">
          <div className="content">
            <h3>Folders</h3>
            {filteredFolders.map((folder) => (
              <div
                key={folder.id}
                className="file-card"
                onMouseLeave={() => setShowDropdown(null)}
              >
                <div className="file-icon">
                  <FaFolder style={{color:'blurywood'}}/>
                </div>
                <div className="file-name">{folder.name}</div>
                <div className="file-footer">
                  <p>{folder.size} KB</p>
                  <p>Last modified: {folder.modifiedDate}</p>
                </div>
                <button
                  className="dropdown-btn"
                  onClick={() => setShowDropdown(folder.id)}
                >
                  <FaEllipsisV />
                </button>
                {showDropdown === folder.id && (
                  <div className="dropdown-menu">
                    <button onClick={() => handleFolderRestore(folder.id)}>Restore</button>
                    <button onClick={()=>handleFolderDelete}>Delete</button>
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

export default Trash;
