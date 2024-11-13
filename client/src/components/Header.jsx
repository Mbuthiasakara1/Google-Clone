import React, { useState, useEffect } from "react";
import styled from "styled-components";
// import Container from "./Container"
import {
  Search as SearchIcon,
  FormatAlignCenter as FormatAlignCenterIcon,
} from "@mui/icons-material";
import { Avatar, Switch } from "@mui/material";
import { useAuth } from './AuthContext';

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

const HeaderSearch = styled.div`
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

const Dropdown = styled.div`
  position: absolute;
  top: 45px;
  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background-color: ${({ theme }) =>
    theme.background === "#333" ? "#444" : "#fff"};
  border: 1px solid lightgray;
  border-radius: 5px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 100;

  p {
    padding: 8px 12px;
    cursor: pointer;
    &:hover {
      background-color: ${({ theme }) =>
        theme.background === "#333" ? "#555" : "#f0f0f0"};
    }
  }
`;

const HeaderIcons = styled.div`
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
  const { user, setUser,loading } = useAuth();
  const [files, setFiles] = useState([]);

  useEffect(() => { console.log("User state in Header component:", user)}); 

  useEffect(() => {
    fetch("http://localhost:3001/files")
      .then((response) => response.json())
      .then((data) => {
        if (data && Array.isArray(data)) {
          setFiles(data);
        } else {
          setFiles([]);
        }
      })
      .catch(() => setFiles([]));
  }, []);

  const handleLogout = () => {
    fetch("http://127.0.0.1:5555/api/logout", {
      method: "DELETE",
      credentials: "include",
    })
      .then((resp) => {
        if (resp.ok) {
          setUser(null);
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
  const handleAvatarUpload = (e) => {
    e.preventDefault();
    if(!user || !user.id){
      console.error("User is not authenticated or missing user id")
      return ;
    }
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    fetch(`http://127.0.0.1:5555/upload-avatar/${user.id}`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          setUser({ ...user, profile_pic: data.url });
          setShowAvatarForm(false);
        }
      })
      .catch((error) => console.error("Upload error:", error));
  };
  if (loading) {
    return <div>Loading...</div>; 
  }



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
          <StyledAvatar onClick={handleFormAvatar} />
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
                    src="https://via.placeholder.com/150"
                    alt="Placeholder"
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
                  <p className="card-text">
                    <h3>Hi Guest</h3>
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleLogout}
                    style={{
                      marginTop: "10px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "30px",
                      borderRadius: "10px",
                      padding: "10px",
                    }}
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


