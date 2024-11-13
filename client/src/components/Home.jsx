import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaFolder, FaFileAlt, FaEllipsisV } from "react-icons/fa";
import Header from "./Header";
import Sidebar from "./Sidebar";

function Home() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [dropdownId, setDropdownId] = useState(null);
  const [renameId, setRenameId] = useState(null);
  const [rename, setRename] = useState("");

  useEffect(() => {
    const fetchFiles = axios.get("http://localhost:3001/files").then((res) => {
      setFiles(res.data);
      setFilteredFiles(res.data);
    });

    const fetchFolders = axios
      .get("http://localhost:3001/folders")
      .then((res) => {
        setFolders(res.data);
        setFilteredFolders(res.data);
      });

    Promise.all([fetchFiles, fetchFolders]);
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

  const handleRename = (fileId) => {
    fetch(`http://localhost:3001/files/${fileId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: rename }),
    })
      .then((response) => response.json())
      .then((data) => {
        setFiles((prevFiles) =>
          prevFiles.map((file) =>
            file.id === fileId ? { ...file, name: data.name } : file
          )
        );
        setRename("");
        setRenameId(null);
      });
  };

  const handleDownload = (file) => {
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

  const handleDelete = (fileId) => {
    fetch(`http://localhost:3001/files/${fileId}`, { method: "DELETE" })
      .then((response) => response.json())
      .then((data) => setFiles(data));
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

        <div>
          <h3>Folders</h3>
          <div className="content">
            {filteredFolders.map((folder) => (
              <div key={folder.id}>
                <p style={{ display: "inline-block" }}>
                  <FaFolder style={{ color: "burlywood" }} /> {folder.name}
                </p>
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
                    <button onClick={() => handleDownload(file)}>
                      Download
                    </button>
                    <button>Move</button>
                    <button onClick={() => handleDelete(file.id)}>
                      Delete
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
                    <button onClick={() => handleRename(file.id)}>
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
