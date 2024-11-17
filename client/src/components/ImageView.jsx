import React from 'react';

const ImageView = ({imageId, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>X</button>
        <img
          src={imageId?.storage_path}  
          alt="Preview"
          className="modal-image"
        />
      </div>
    </div>
  );
};

export default ImageView;
