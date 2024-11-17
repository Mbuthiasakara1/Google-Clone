import React, { useEffect, useRef } from "react";
import axios from 'axios';
import { useAuth } from "./AuthContext";
import { useSnackbar } from "notistack";

function UploadWidget({ currentFolderId, onUpload }) {
  const cloudinaryRef = useRef();
  const widgetRef = useRef();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();


  useEffect(() => {
    if (window.cloudinary) {
      cloudinaryRef.current = window.cloudinary;
      widgetRef.current = cloudinaryRef.current.createUploadWidget(
        {
          cloudName: "da5ereqrh",
          uploadPreset: "google_drive_presets",
          sources: ["local", "url", "camera", "google_drive", "dropbox"],
          resourceType: "auto",
          multiple: true,
          showPoweredBy: false,
          cropping: false,
          maxFiles: 5,
          clientAllowedFormats: ["image", "video", "pdf", "docx"],
        },
        async (error, result) => {
          if (error) {
            console.error("Upload Widget Error:", error);
          } else if (result.event === "success") {
            console.log("File uploaded successfully:", result.info);

            // Extract necessary details from the Cloudinary response
            const { original_filename, format, bytes, secure_url, created_at, thumbnail_url } = result.info;
            
            const fileData = {
              name: original_filename,
              filetype: format,
              filesize: bytes,
              storage_path: secure_url,
              thumbnail_path: thumbnail_url || null,
              created_at: created_at,
              folder_id: currentFolderId || null,
              user_id: user?.id,
            };

            try {
              // Post the uploaded file data to the Flask backend
              const response = await axios.post('http://127.0.0.1:5555/api/files', fileData, {
                withCredentials: true,
              });

              if (response.status === 201) {
                console.log('File data saved to database:', response.data);
                onUpload(secure_url); // Trigger the onUpload callback
                enqueueSnackbar('File uploaded successfully!', { variant: 'success' });
              }
            } catch (err) {
              console.error('Error saving file data:', err);
              enqueueSnackbar('Error saving file data, please try again.', { variant: 'error' });
            }
          }
        }
      );
    }
  }, [user, currentFolderId, enqueueSnackbar, onUpload]);

  const handleOpenWidget = () => {
    if (widgetRef.current) {
      widgetRef.current.open();
    }
  };

  return <button className = "upload-btn" onClick={handleOpenWidget}>Upload File</button>;
}

export default UploadWidget;
