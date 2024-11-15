import { useEffect, useRef } from "react";
import axios from 'axios';
import { useAuth } from "./AuthContext";

function UploadWidget({ onUpload }) {
  const cloudinaryRef = useRef();
  const widgetRef = useRef();
  const { user } = useAuth()

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

            // Send the uploaded files to the server
            try{
              const response = await axios.post('http://127.0.0.1:5555/api/files', {
                name: original_filename,
                filetype: original_extension,
                filesize: w,
                storage_path: secure_url,
                created_at: created_at,
                updated_at: d,
                user_id: user.id,
              })
              if (response.status === 201) {
                console.log('File data saved to database:', response.data);
                onUpload(secure_url); // Trigger the onUpload callback
              }
            } catch (err) {
              console.error('Error saving file data:', err);
            }
          }
        }
      );
    }
  }, [user, onUpload]);

  const handleOpenWidget = () => {
    if (widgetRef.current) {
      widgetRef.current.open();
    }
  };

  return <button onClick={handleOpenWidget}>Upload File</button>;
}

export default UploadWidget;
