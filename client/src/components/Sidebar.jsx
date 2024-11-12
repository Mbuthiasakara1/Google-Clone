import React from "react";
import { useState } from "react";
import { FaFolderPlus } from "react-icons/fa6";
import { MdUploadFile, MdOutlineDriveFolderUpload } from "react-icons/md";
import axios from "axios";
function Sidebar() {
  const [dropDown, setDropDown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [files, setFiles] = useState([]);
  const [folder, setFolder] = useState([])
  

  function handleClick() {
    setDropDown(!dropDown);
    setShowForm(false);
  }

  function handleCreateFolderClick() {
    setShowForm(true);
    setDropDown(false);
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    fetch("http://localhost:3001/folders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: folderName }),
    })
    .then((response) => response.json())
    .then((data) => setFolderName(data))
    .catch((error) => console.error("Error:", error));
     setFolderName("");
     setShowForm(false);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
  
      fetch("http://localhost:3001/files", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          const url = URL.createObjectURL(file);  
          setFiles((prevFiles) => [...prevFiles, url]); 
        })
        .catch((error) => console.error("File upload failed:", error));
    } else {
      console.log("No file selected");
    }
  }
    
  function handleFolderChange(e) {
    const folder = e.target.files;
    const formData = new FormData();
    
    if (folder) {
      formData.append("folder", folder);
  
      axios.post("http://localhost:3001/folders", formData)
        .then((response) => {
          const url = URL.createObjectURL(folder);
          setFolder((prevFold) => [...prevFold, url]);
        })
        .catch((error) => console.error("File upload failed:", error));
    }
  }
  return (
    <div id="sidebar-container">
      <div id="sidebar-content">
        <div id="new-btn" role="button" onClick={handleClick}>
          <h3 style={{ color: "black" }}>
            <i className="fa-solid fa-plus" style={{ color: "#030303" }}></i>{" "}
            New
          </h3>
        </div>
        {dropDown && (
          <>
            <div className="overlay" onClick={() => setDropDown(false)}></div>
            <ul className="dropdown">
              <li onClick={handleCreateFolderClick}>
                <FaFolderPlus className="dropdown-icons"/> Create Folder
              </li>
              <li>
                <label htmlFor="fileInput" style={{ cursor: "pointer" }}>
                  <MdUploadFile className="dropdown-icons"/> Upload File
                </label>
                <input
                  type="file"
                  id="fileInput"
                  style={{ display: "none" }}
                  accept="*/*"
                  onChange={handleFileChange}
                />
              
              </li>
              <li>
              <label htmlFor="folderInput" style={{ cursor: "pointer" }}>
                <MdOutlineDriveFolderUpload className="dropdown-icons"/> Upload Folder
              </label>
              <input
                type="file"
                id="folderInput"
                style={{ display: "none" }}
                webkitdirectory="true"
                onChange={handleFolderChange}
              />
              </li>
            </ul>
          </>
        )}
        {showForm && (
          <>
            <div
              className="form-overlay"
              onClick={() => setShowForm(false)}
            ></div>
            <form onSubmit={handleFormSubmit} className="folder-form">
              <label htmlFor="folderName">New Folder</label>
              <input
                type="text"
                id="folderName"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                required
              />
              <button type="submit">Create</button>
              <button type="button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </form>
          </>
        )}
        <div id="hmd" style={{ cursor: "pointer" }}>
          <p>
            <i className="fa-solid fa-house" style={{ color: "#393b3c" }}></i>{" "}
            Home
          </p>
        </div>
        <div id="hmd" style={{ cursor: "pointer" }}>
          <p>
            <i className="fa-brands fa-google-drive"></i> My Drive
          </p>
        </div>
        <div id="hmd" style={{ cursor: "pointer" }}>
          <p>
            <i className="fa-solid fa-trash" style={{ color: "#0c0d0d" }}></i>{" "}
            Trash
          </p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
