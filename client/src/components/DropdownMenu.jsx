import React from "react";
import { FaFileAlt } from "react-icons/fa";

const DropdownMenu = ({ onRename, onDownload, isDownloading, onMove }) => {
  return (
    <div className="dropdown-menu">
      <button onClick={onRename}>Rename</button>
      <button onClick={onDownload} disabled={isDownloading}>
        {isDownloading ? "Downloading..." : <><FaFileAlt /> Download</>}
      </button>
      <button onClick={onMove}>Move</button>
    </div>
  );
};

export default DropdownMenu;
