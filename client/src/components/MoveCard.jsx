import React from "react";

const MoveCard = ({ folders, selectedFolderId, setSelectedFolderId, onMoveConfirm }) => {
  return (
    <div className="move-card">
      <select value={selectedFolderId} onChange={(e) => setSelectedFolderId(e.target.value)}>
        {folders.map((folder) => (
          <option key={folder.id} value={folder.id}>
            {folder.name}
          </option>
        ))}
      </select>
      <button onClick={onMoveConfirm}>Confirm Move</button>
    </div>
  );
};

export default MoveCard;
