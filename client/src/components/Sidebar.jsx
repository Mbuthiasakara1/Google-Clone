import React, { useState, useEffect, useRef } from "react";
import { FaFolderPlus } from "react-icons/fa";
import { MdUploadFile } from "react-icons/md";
import { useAuth } from "./AuthContext";
import { NavLink } from "react-router-dom";
import UploadWidget from "./UploadWidget";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import useStore from "./Store";

function Sidebar({ currentFolderId }) {
  // const { user } = useAuth();
  const [dropDown, setDropDown] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const {isCreatingFolder, setIsCreatingFolder, user} = useStore();
  const dropdownRef = useRef(null);
  const{isUploading, setIsUploading}= useStore()
  // Handle dropdown visibility
  function handleClick() {
    setDropDown((prev) => !prev);
  }

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropDown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Handle folder creation dialog opening
  function handleCreateFolderClick() {
    setOpenCreateDialog(true);
    setDropDown(false); // Close the dropdown when opening the dialog
  }

  // Handle form submission to create a folder via the dialog
  function handleCreateFolder() {
    if (!folderName.trim()) return;

    setIsCreatingFolder(true);

    const parentId = currentFolderId || null; // If there's no folderId, send null



    fetch("/api/folders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: folderName,
        user_id: user.id,
        parent_id: parentId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Folder created:", data);
        setFolderName("");
        setOpenCreateDialog(false); // Close the dialog after folder creation
      })
      .catch((error) => console.error("Error:", error))
      .finally(() => setIsCreatingFolder(false));
  }
  // Function to handle successful file uploads
  const handleFileUpload = (newFile) => {
    // Handle file upload here
    console.log("File uploaded:", newFile);
    setIsUploading(true);
  };
  // Handle 'Enter' key for creating folder
  const handleKeyDown = (e) => {
    if (e.key === "Enter") { 
      handleCreateFolder();
    }
  };

  return (
    <div id="sidebar-container">
      <div id="sidebar-content">
        <div id="new-btn" role="button" onClick={handleClick}>
          <h3 style={{ color: "black" }}>
            <i className="fa-solid fa-plus" style={{ color: "#030303" }}></i> New
          </h3>
        </div>
        {dropDown && (
          <>
            <div className="overlay" onClick={() => setDropDown(false)}></div>
            <ul className="dropdown" ref={dropdownRef}>
              <li onClick={handleCreateFolderClick}>
                <FaFolderPlus className="dropdown-icons" /> Create Folder
              </li>
              <li>
                <MdUploadFile className="dropdown-icons"  /> <UploadWidget currentFolderId={currentFolderId} onUpload={handleFileUpload} />
              </li>
            </ul>
          </>
        )}

        {/* Create Folder Dialog */}
        <Dialog
          open={openCreateDialog}
          onClose={() => setOpenCreateDialog(false)}
        >
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Folder Name"
              fullWidth
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder} disabled={isCreatingFolder}>
              {isCreatingFolder ? "Creating..." : "Create"}
            </Button>
          </DialogActions>
        </Dialog>
      </div>

      {/* Navigation Links */}
      <NavLink to={"/"} className="Navlink" style={{ textDecoration: "none" }}>
        <div id="hmd" style={{ cursor: "pointer" }}>
          <p>
            <i className="fa-solid fa-house" style={{ color: "#393b3c" }}></i>{" "}
            Home
          </p>
        </div>
      </NavLink>
      <NavLink to={"/my-drive"} className="Navlink" style={{ textDecoration: "none" }}>
        <div id="hmd" style={{ cursor: "pointer" }}>
          <p>
            <i className="fa-brands fa-google-drive"></i> My Drive
          </p>
        </div>
      </NavLink>
      <NavLink to={"/trash"} className="Navlink" style={{ textDecoration: "none" }}>
        <div id="hmd" style={{ cursor: "pointer" }}>
          <p>
            <i className="fa-solid fa-trash"></i> Trash
          </p>
        </div>
      </NavLink>
    </div>
  );
}

export default Sidebar;
