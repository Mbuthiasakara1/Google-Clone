import React, { useState } from "react";
import { FaFolderPlus } from "react-icons/fa6";
import { MdUploadFile } from "react-icons/md";
import { useAuth } from "./AuthContext";
import { Link, useParams } from "react-router-dom";
import UploadWidget from "./UploadWidget";

function Sidebar() {
  const { user } = useAuth();
  const { folderId } = useParams(); // Get folderId from URL params
  const [dropDown, setDropDown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [files, setFiles] = useState([]);
 
  function handleClick() {
    setDropDown(!dropDown);
    setShowForm(false);
  }

  function handleCreateFolderClick() {
    setShowForm(true);
    setDropDown(false);
  }

  // Handle form submission to create a folder
  function handleFormSubmit(e) {
    e.preventDefault();
    const parentId = folderId ? folderId : null; // If there's no folderId, send null

    fetch("http://127.0.0.1:5555/api/folders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: folderName,
        user_id: user.id,
        parent_id: parentId, // Automatically use the folderId from URL as parent_id
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Folder created:", data);
        setFolderName("");
        setShowForm(false);
      })
      .catch((error) => console.error("Error:", error));
  }

  // Function to handle successful file uploads
  const handleFileUpload = (url) => {
    setFiles((prevFiles) => [...prevFiles, url]);
  };

  return (
    <div id="sidebar-container">
      <div id="sidebar-content">
        <div
          id="new-btn"
          role="button"
          onClick={handleClick}
          onMouseLeave={() => setShowForm(false)}
        >
          <h3 style={{ color: "black" }}>
            <i className="fa-solid fa-plus" style={{ color: "#030303" }}></i> New
          </h3>
        </div>
        {dropDown && (
          <>
            <div className="overlay" onClick={() => setDropDown(false)}></div>
            <ul className="dropdown">
              <li onClick={handleCreateFolderClick}>
                <FaFolderPlus className="dropdown-icons" /> Create Folder
              </li>
              <li>
                <MdUploadFile /> <UploadWidget onUpload={handleFileUpload} />
              </li>
            </ul>
          </>
        )}
        {showForm && (
          <>
            <div className="form-overlay" onClick={() => setShowForm(false)}></div>
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
        <Link to={"/home"}>
          <div id="hmd" style={{ cursor: "pointer" }}>
            <p>
              <i className="fa-solid fa-house" style={{ color: "#393b3c" }}></i> Home
            </p>
          </div>
        </Link>
        <Link to={"/my-drive"}>
          <div id="hmd" style={{ cursor: "pointer" }}>
            <p>
              <i className="fa-brands fa-google-drive"></i> My Drive
            </p>
          </div>
        </Link>
        <Link to={"/trash"}>
          <div id="hmd" style={{ cursor: "pointer" }}>
            <p>
              <i className="fa-solid fa-trash"></i> Trash
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;
