import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaFolder, FaFileAlt, FaEllipsisV } from "react-icons/fa";
import Header from "./Header";
import Sidebar from "./Sidebar";
import FileCard from "./FileCard";
import { useAuth } from "./AuthContext";
import { useSnackbar } from "notistack";
import FolderCard from "./FolderCard";

function Home() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [dropdownId, setDropdownId] = useState(null);
  const [renameId, setRenameId] = useState(null);
  const [rename, setRename] = useState("");
  const {user,loading,setLoading} = useAuth()
  const {enqueueSnackbar}=useSnackbar()
  
  

  

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user && user.id) {
          const fileResponse = await axios.get(
            `http://localhost:5173/api/fileuser/${user.id}`
          );
          setFiles(Array.isArray(fileResponse.data) ? fileResponse.data : []);
          setFilteredFiles(
            Array.isArray(fileResponse.data) ? fileResponse.data : []
          );

          const folderResponse = await axios.get(
            `http://localhost:5173/api/folderuser/${user.id}`
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
      const response = await fetch(`http://localhost:5173/api/files/${fileId}`, {
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

  const handleDownload = (file) => {
    fetch(`http://localhost:3001/files/${file.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
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

  const handleDelete = async (fileId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this file? This action cannot be undone."
      )
    ) {
      try {
        const response = await fetch(
          `http://localhost:5173/api/files/${fileId}`,
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

  return (
    <>
      <Header onFilter={handleFilter} /*toggleTheme={toggleTheme}*/ />
      <Sidebar />
      <div
        className="Container"
        style={{ backgroundColor: "white", borderRadius: "10px" }}
      >
        <h1 style={{ color: "black" }}>Welcome to Drive</h1>
      {/* <FileCard />
      <FolderCard /> */}
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
                    <button onClick={() => handleDownload(folder)}>
                      Download
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
            {/* <FileCard /> */}
            {/* <FileCard /> */}

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
                    <button onClick={() => handleDownload(file)}>
                      Download
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
