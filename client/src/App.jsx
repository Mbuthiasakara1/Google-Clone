import './App.css'

import React, { useState } from "react";
import Header from "./components/Header";
import styled, { ThemeProvider } from "styled-components";

const lightTheme = {
  background: "#fff",
  color: "#000",
};
const darkTheme = {
  background: "#333",
  color: "#fff",
};
const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.color};
`;
function App() {

  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };
  return (
    <div>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <AppContainer>
          <div style={{ flex: 1 }}>
            <Header toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
          </div>
        </AppContainer>
      </ThemeProvider>
    </div>
  );
}

export default App;
