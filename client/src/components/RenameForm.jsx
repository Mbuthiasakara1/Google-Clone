import React, { useState } from "react";

const RenameForm = ({ currentName, onRename, onClose }) => {
  const [newName, setNewName] = useState(currentName);

  const handleRename = () => {
    onRename(newName);
    onClose();
  };

  return (
    <div className="rename-form">
      <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New name" />
      <button onClick={handleRename}>Confirm</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default RenameForm;
