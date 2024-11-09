import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Search as SearchIcon,
  FormatAlignCenter as FormatAlignCenterIcon,
} from "@mui/icons-material";
import { Avatar, Switch } from "@mui/material";

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

  @media( max-width:768px){
  display: flex;
  justify-content:space-between;
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
    theme.background === "#333" ? "#555" : "whitesmoke"};
  padding: 10px;
  border-radius: 20px;

  input {
    background-color: transparent;
    border: 0;
    outline: 0;
    flex: 1;
    color: ${({ theme }) => theme.color};
  }

  @media(max-width: 768px){
  display:none;
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
   @media(max-width: 768px){
  display:none;
  }
`;

const AvatarForm = styled.div`
  position: absolute;
  top: 60px;
  right: 0;
  background-color: #ffffff;
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

function Header({ toggleTheme }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showAvatarForm, setShowAvatarForm] = useState(false);
  

  useEffect(() => {
    fetch("http://localhost:4000/files") // Fetch the list of files and store it in files state
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

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query) {
      const filtered = files.filter((file) =>
        file.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredFiles(filtered);
      setShowResults(true);
    } else {
      setFilteredFiles([]);
      setShowResults(false);
    }
  };

  const handleResultClick = (file) => {
    setSearchQuery(file.name); // Show the selected file in the search input
    setShowResults(false); // Hide the results
  };

  const handleFormAvatar = () => {
    setShowAvatarForm(!showAvatarForm);
  };
  const handleDisplay = () => {
    console.log("i was clicked")
    const menu = document.querySelector(".burger-menu");

    const headerIcons = document.querySelector(".header-icons");
    const headerSearch = document.querySelector(".header-search");
  
    if (window.innerWidth <= 768) {
      headerIcons.style.display = headerIcons.style.display === "none" ? "flex" : "none";
      headerSearch.style.display = headerSearch.style.display === "none" ? "flex" : "none";
    } else {
      headerIcons.style.display = "flex";
      headerSearch.style.display = "flex";
    }
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
      <HeaderSearch>
        <SearchIcon />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search in Drive"
        />
        <FormatAlignCenterIcon />
        {showResults && (
          <Dropdown>
            {filteredFiles.map((file, index) => (
              <p key={index} onClick={() => handleResultClick(file)}>
                {file.name}
              </p>
            ))}
          </Dropdown>
        )}
      </HeaderSearch>
      <div className="burger-menu" onClick={handleDisplay}>
  <div className="btn-line"></div>
  <div className="btn-line"></div>
  <div className="btn-line"></div>
  </div>

      <HeaderIcons>
        <span onClick={toggleTheme}>
          <Switch />
        </span>
        <span>
          <Avatar onClick={handleFormAvatar} />
          {showAvatarForm && (
            <AvatarForm>
              <h1>Upload Avatar</h1>
              <form>
                <input type="file" />
                <input type="submit" />
              </form>
            </AvatarForm>
          )}
        </span>
      </HeaderIcons>
    </HeaderContainer>
  );
}

export default Header;
