import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Search as SearchIcon,
  FormatAlignCenter as FormatAlignCenterIcon,
} from "@mui/icons-material";
import { Avatar, Switch } from "@mui/material";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const HeaderContainer = styled.div`
  display: grid;
  grid-template-columns: 300px auto 200px;
  align-items: center;
  padding: 5px 20px;
  height: 60px;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.color};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;

  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
  }
`;

const HeaderLogo = styled.div`
  display: flex;
  align-items: center;
  user-select: none;
  img {
    width: 40px;
  }
  span {
    font-size: 22px;
    margin-left: 10px;
    color: ${({ theme }) => theme.color};
  }
`;

const HeaderSearch = styled.div.attrs(() => ({
  showSearch: undefined,
}))`
  display: flex;
  align-items: center;
  position: relative;
  width: 90%;
  background-color: ${({ theme }) =>
    theme.background === "#333" ? "#555" : "#fff"};
  padding: 10px;
  border-radius: 20px;

  input {
    background-color: transparent;
    border: 0;
    outline: 0;
    flex: 1;
    color: ${({ theme }) => theme.color};
  }

  @media (max-width: 768px) {
    display: ${({ showSearch }) => (showSearch ? "flex" : "none")};
    width: 40%;
    padding: 5px;
  }
`;

const HeaderIcons = styled.div.attrs(() => ({
  showIcons: undefined,
}))`
  display: flex;
  align-items: center;
  span {
    display: flex;
    align-items: center;
    margin-left: 20px;
  }
  svg.MuiSvgIcon-root {
    margin: 0px 10px;
    color: ${({ theme }) => theme.color};
  }
  @media (max-width: 768px) {
    display: ${({ showIcons }) => (showIcons ? "flex" : "none")};
    margin-right: 1em;
  }
`;

const AvatarForm = styled.div`
  position: absolute;
  top: 60px;
  right: 0;

  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2);
  z-index: 200;
  width: 250px;
  font-family: Arial, sans-serif;

  h1 {
    font-size: 18px;
    color: #333;
    margin-bottom: 15px;
    font-weight: 500;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  input[type="file"] {
    font-size: 14px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
  }

  input[type="submit"] {
    background-color: #4285f4;
    color: white;
    padding: 10px;
    border: none;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #357ae8;
    }
  }
`;

const BurgerMenu = styled.div`
  display: none;
  flex-direction: column;
  cursor: pointer;
  span {
    height: 3px;
    width: 25px;
    background-color: ${({ theme }) => theme.color};
    margin-bottom: 5px;
    border-radius: 5px;
  }
  @media (max-width: 768px) {
    display: flex;
  }
`;

const StyledAvatar = styled(Avatar)`
  && {
    width: 40px;
    height: 40px;

    @media (max-width: 768px) {
      width: 30px;
      height: 30px;
    }
  }
`;

function Header({ toggleTheme, onFilter, searchQuery }) {
  const [showAvatarForm, setShowAvatarForm] = useState(false);
  const [showSearch, setShowSearch] = useState(true); // Control visibility of search bar
  const [showIcons, setShowIcons] = useState(true); // Control visibility of icons
  const { user, loading, setUser } = useAuth();
  

  console.log(user);

  const navigate = useNavigate();

  if (loading) return <div>Loading...</div>;

 

  const handleLogout = () => {
    fetch("http://127.0.0.1:5555/api/logout", {
      method: "DELETE",
      credentials: "include",
    })
      .then((resp) => {
        if (resp.ok) {
          setUser(null);
          navigate("/login");
        } else {
          throw new Error("Failed to logout");
        }
      })
      .catch((error) => console.error("Logout error:", error));
  };

  const handleFormAvatar = () => {
    setShowAvatarForm(!showAvatarForm);
  };

  const handleFileInputClick = () => {
    document.getElementById("avatar").click(); // Trigger file input click when camera icon is clicked
  };
 
  const handleAvatarUpload = async (e) => {
    e.preventDefault();

    if (!user || !user.id) {
      console.error("User is not authenticated or missing user id");
      return;
    }

    const file = e.target.files[0];
    if (!file) {
      console.error("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    // Log the request details for debugging
    console.log(
      "Attempting upload to:",
      `http://127.0.0.1:5555/upload-avatar/${user.id}`
    );
    console.log("File:", file);

    try {
      const response = await fetch(
        `http://127.0.0.1:5555/upload-avatar/${user.id}`,
        {
          method: "POST",
          credentials: "include",
          // Remove the Content-Type header - let the browser set it with the boundary
          headers: {
            Accept: "application/json",
          },
          body: formData,
        }
      );

      // Log the response status and headers
      console.log("Response status:", response.status);
      console.log("Response headers:", [...response.headers.entries()]);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Upload failed with status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Upload successful:", data);

      if (data.url) {
        setUser({ ...user, profile_pic: data.url });
        setShowAvatarForm(false);
      }
    } catch (error) {
      console.error("Upload error details:", {
        message: error.message,
        stack: error.stack,
      });
      alert(`Failed to upload avatar: ${error.message}`);
    }
  };
 
  const handleBurgerClick = () => {
    setShowSearch(!showSearch);
    setShowIcons(!showIcons);
  };
 

  return (
    <HeaderContainer>
      <HeaderLogo>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo.png"
          alt="Google Drive"
        />
        <span>Drive</span>
      </HeaderLogo>
      <HeaderSearch showSearch={showSearch}>
        <SearchIcon />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onFilter(e.target.value)}
          placeholder="Search in Drive"
        />
          
        <FormatAlignCenterIcon />
      </HeaderSearch>
      <HeaderIcons showIcons={showIcons}>
        <span onClick={toggleTheme}>
          <Switch />
        </span>
        <span>
          <StyledAvatar
            onClick={handleFormAvatar}
            src={user?.profile_pic || undefined}
            alt={user?.first_name || "User"}
          />
          {showAvatarForm && (
            <AvatarForm>
              <div
                className="card"
                style={{
                  width: "18rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    borderRadius: "50%",
                    position: "relative",
                  }}
                >
                  <img
                    className="card-img-top"
                    style={{ width: "60%", borderRadius: "50%" }}
                    src={user?.profile_pic || "https://via.placeholder.com/150"}
                    alt={user?.first_name || "Placeholder"}
                  />
                  <input
                    type="file"
                    id="avatar"
                    name="file" //matches the key expected in backend
                    accept="image/*"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      opacity: 0,
                      cursor: "pointer",
                    }}
                    onChange={handleAvatarUpload}
                  />
                  <span
                    style={{
                      position: "absolute",
                      bottom: "5px",
                      right: "60px",
                      backgroundColor: "#fff",
                      borderRadius: "50%",
                      padding: "5px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 0 5px rgba(0, 0, 0, 0.3)",
                    }}
                    onClick={handleFileInputClick}
                  >
                    <i
                      className="fa fa-camera"
                      style={{ fontSize: "14px", color: "#000" }}
                    ></i>
                  </span>
                </div>

                <div className="card-body">
                  <div className="card-text">
                    {user ? (
                      <h3>Hi, {user.first_name}!</h3>
                    ) : (
                      <h3>Hi, Guest</h3>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigate("/profile")}
                  >
                    Your Profile
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleLogout}
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </AvatarForm>
          )}
        </span>
      </HeaderIcons>
      <BurgerMenu onClick={handleBurgerClick}>
        <span></span>
        <span></span>
        <span></span>
      </BurgerMenu>
    </HeaderContainer>
  );
}

export default Header;
