import { useState } from "react";
// import Header from "./components/Header";
// import Header from "./components/Header";
import styled, { ThemeProvider } from "styled-components";
import Sidebar from './components/Sidebar'
import { useMediaQuery } from "@mui/material";
import { AuthProvider, useAuth } from './components/AuthContext'
import Container from "./components/Container";

const lightTheme = {
  background: "#F0F0F3",
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
  const { user, setUser } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <AppContainer>
        <Container toggleTheme={toggleTheme} isDarkMode={isDarkMode} toggleSidebar={toggleSidebar} />
        {!isMobile && <Sidebar />}
        {isMobile && isSidebarOpen && <Sidebar />}
      </AppContainer>

    </ThemeProvider>
  );
}

const WrappedApp = () => (
  <AuthProvider>
      <App />
  </AuthProvider>
);

export default WrappedApp;