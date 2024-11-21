import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { FaFileAlt, FaFolder, FaEllipsisV } from "react-icons/fa";
import { useAuth } from "./AuthContext";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import {
  Description,
  Image,
  PictureAsPdf,
  VideoFile,
  AudioFile,
  InsertDriveFile,
  TableChart,
  Article,
  Code,
  InsertDriveFile as FileIcon,
  CloudDownload,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import useStore from "./Store";

function Trash() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [showFolderDropdown, setShowFolderDropdown] = useState(null);
  const[showFileDropdown, setShowFileDropdown]=useState(null)
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: "", id: null });
  // const { user, loading, setLoading } = useAuth();
  const{user,setLoading}=useStore()
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    const fetchFiles = axios
      .get(`http://i27.0.0.1:5555/api/trash/file/${user.id}`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setFiles(res.data);
          setFilteredFiles(res.data);
        } else {
          console.error("Expected an array of files, got:", res.data);
        }
      })
      .catch((error) => console.error("Error fetching files:", error));

    const fetchFolders = axios
      .get(`http://i27.0.0.1:5555/api/trash/folder/${user.id}`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setFolders(res.data);
          setFilteredFolders(res.data);
        } else {
          console.error("Expected an array of folders, got:", res.data);
        }
      })
      .catch((error) => console.error("Error fetching folders:", error));

    Promise.all([fetchFiles, fetchFolders]).finally(() => setLoading(false));
  }, [user, setLoading]);

  const handleFilter = (query) => {
    if (!query) {
      setFilteredFiles(files);
      setFilteredFolders(folders);
    } else {
      setFilteredFiles(
        files.filter((file) =>
          file.name.toLowerCase().includes(query.toLowerCase())
        )
      );
      setFilteredFolders(
        folders.filter((folder) =>
          folder.name.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  };
  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  const getFileIcon = (file) => {
    
      const extension = file.name?.split(".").pop()?.toLowerCase() || "";
      const fileType = (file.filetype || file.type || "").toLowerCase();
      const documentTypes = [
        "doc",
        "docx",
        "txt",
        "rtf",
        "odt",
        "text",
        "document",
      ];
      const spreadsheetTypes = ["xlsx", "xls", "csv", "ods", "spreadsheet"];
      const imageTypes = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "image"];
      const videoTypes = ["mp4", "mov", "avi", "webm", "mkv", "video"];
      const audioTypes = ["mp3", "wav", "ogg", "m4a", "flac", "audio"];
      const articleTypes = ["md", "markdown", "article", "blog", "news"];
      const presentationTypes = ["ppt", "pptx", "presentation"];
      const webTypes = ["html", "htm", "css"];
      const jsonTypes = ["json"];


      const isType = (types) =>
        types.some(
          (type) =>
            fileType.includes(type) ||
            extension === type ||
            (file.mimeType && file.mimeType.includes(type))
        );

      if (isType(imageTypes))
        return <Image sx={{ fontSize: 60, color: "#4285f4" }} />;
      if (isType(["pdf"]))
        return <PictureAsPdf sx={{ fontSize: 60, color: "#FF4B4B" }} />;
      if (isType(videoTypes))
        return <VideoFile sx={{ fontSize: 60, color: "#673ab7" }} />;
      if (isType(audioTypes))
        return <AudioFile sx={{ fontSize: 60, color: "#00c853" }} />;
      if (isType(spreadsheetTypes))
        return <TableChart sx={{ fontSize: 60, color: "#1D6F42" }} />;
      if (isType(documentTypes))
        return <Description sx={{ fontSize: 60, color: "#2B579A" }} />;
      if (isType(presentationTypes))
        return <InsertDriveFile sx={{ fontSize: 60, color: "#FF6D00" }} />;
      if (isType(webTypes))
        return <Code sx={{ fontSize: 60, color: "#4285f4" }} />;
      if (isType(jsonTypes))
        return <FileIcon sx={{ fontSize: 60, color: "#7B7B7B" }} />;
      if (isType(articleTypes))
        return <Article sx={{ fontSize: 60, color: "#FF9100" }} />;
      return <InsertDriveFile sx={{ fontSize: 60, color: "#5f6368" }} />;
  
  };

  const handleFileRestore = (fileId) => {
    axios
      .patch(`http://i27.0.0.1:5555/api/files/${fileId}/move-to-trash`, { bin: false })
      .then(() => {
        setFilteredFiles(filteredFiles.filter((file) => file.id !== fileId));
      })
      .catch((error) => console.error("Error restoring file:", error));
  };

  const handleFolderRestore = (folderId) => {
    axios
      .patch(`http://i27.0.0.1:5555/api/folders/${folderId}`, { bin: false })
      .then(() => {
        setFilteredFolders(
          filteredFolders.filter((folder) => folder.id !== folderId)
        );
      })
      .catch((error) => console.error("Error restoring folder:", error));
  };

  const handleDeleteClick = (type, id) => {
    setDeleteTarget({ type, id });
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    const { type, id } = deleteTarget;
    try {
      if (type === "file") {
        const response = await fetch(`http://i27.0.0.1:5555/api/files/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Failed to delete file");
        setFilteredFiles(filteredFiles.filter((file) => file.id !== id));
        enqueueSnackbar("File deleted successfully", { variant: "success" });
      } else if (type === "folder") {
        const response = await fetch(
          `http://i27.0.0.1:5555/api/folders/${id}`,
          { method: "DELETE", headers: { "Content-Type": "application/json" } }
        );
        if (!response.ok) throw new Error("Failed to delete folder");
        setFilteredFolders(filteredFolders.filter((folder) => folder.id !== id));
        enqueueSnackbar("Folder deleted successfully", { variant: "success" });
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      enqueueSnackbar("Failed to delete item", { variant: "error" });
    } finally {
      setOpenDialog(false);
    }
  };

  return (
    <>
      <Header onFilter={handleFilter} />
      <Sidebar />
      <div className="Container" style={{ borderRadius: "10px" }}>
        <h1 style={{ color: "black" }}>Welcome to Drive</h1>
        <div className="content">
          <div className="files-container">
            <h4>Files</h4>
            <div className="file-list">
             {filteredFiles.length === 0 ? (
              <h3>No files found in trash</h3>
            ):(
              filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="file-card"
                  onMouseLeave={() => setShowFileDropdown(null)}
                >
                  <div className="file-icon">
                    {getFileIcon(file)}
                  </div>
                  <div className="file-name">{file.name}</div>
                  <div className="file-footer">
                  <div>{formatFileSize(file.filesize)}</div>
                  <div>{formatDate(file.updated_at || file.created_at)}</div>
                  </div>
                  <button
                    className="dropdown-btn"
                    onClick={() => setShowFileDropdown(file.id)}
                  >
                    <FaEllipsisV />
                  </button>
                  {showFileDropdown === file.id && (
                    <div className="dropdown-menu">
                      <button onClick={() => handleFileRestore(file.id)}>
                        Restore
                      </button>
                      <button onClick={() => handleDeleteClick("file", file.id)}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )))}
            </div>
          </div>

          <div className="folder-container">
            <h3>Folders</h3>
            <div className="file-list">
              {filteredFolders.map((folder) => (
                <div
                  key={folder.id}
                  className="file-card"
                  onMouseLeave={() => setShowFolderDropdown(null)}
                >
                  <div className="file-icon">
                    <FaFolder style={{ color: "blurywood" }} />
                  </div>
                  <div className="file-name">{folder.name}</div>
                  <div className="file-footer">
                    <p>{folder.size} KB</p>
                    <p>Last modified: {folder.modifiedDate}</p>
                  </div>
                  <button
                    className="dropdown-btn"
                    onClick={() => setShowFolderDropdown(folder.id)}
                  >
                    <FaEllipsisV />
                  </button>
                  {showFolderDropdown === folder.id && (
                    <div className="dropdown-menu">
                      <button onClick={() => handleFolderRestore(folder.id)}>
                        Restore
                      </button>
                      <button onClick={() => handleDeleteClick("folder", folder.id)}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this item? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Trash;
