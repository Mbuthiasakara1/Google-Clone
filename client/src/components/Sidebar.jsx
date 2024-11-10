import { useState } from "react";
import { FaFolderPlus } from "react-icons/fa6";
import { MdUploadFile, MdOutlineDriveFolderUpload } from "react-icons/md";

function Sidebar() {
  const [dropDown, setDropDown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [folderName, setFolderName] = useState("");

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
    console.log("Folder Name:", folderName);
    setFolderName("");
    setShowForm(false);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      console.log("File Selected:", file.name);
    }
  }
  function handleFolderChange(e) {
    const folder = e.target.files;
    if (folder.length) {
      console.log(
        "Folder Selected:",
        folder[0].webkitRelativePath.split("/")[0]
      );
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
            <i className="fa-solid fa-house" style={{ color: "#393b3c;" }}></i>{" "}
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
