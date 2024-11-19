import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../components/AuthContext';
import { SnackbarProvider } from 'notistack';
import Header from "../components/Header";

describe("Header Component", () => {
    const mockToggleTheme = jest.fn();
    const mockOnFilter = jest.fn();

    const renderHeader = () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <SnackbarProvider>
                        <Header toggleTheme={mockToggleTheme} onFilter={mockOnFilter} />
                    </SnackbarProvider>
                </AuthProvider>
            </BrowserRouter>
        );
    };

    beforeEach(() => {
        mockToggleTheme.mockClear();
        mockOnFilter.mockClear();
    });

    test("renders logo and Drive text", () => {
        renderHeader();
        const logo = screen.getByAltText("Google Drive");
        const driveText = screen.getByText("Drive");
        
        expect(logo).toBeInTheDocument();
        expect(driveText).toBeInTheDocument();
    });

    test("renders search input", () => {
        renderHeader();
        const searchInput = screen.getByPlaceholderText("Search in Drive");
        expect(searchInput).toBeInTheDocument();
    });

    test("calls onFilter when searching", () => {
        renderHeader();
        const searchInput = screen.getByPlaceholderText("Search in Drive");
        
        fireEvent.change(searchInput, { target: { value: "test" } });
        expect(mockOnFilter).toHaveBeenCalledWith("test");
    });

    test("handles theme toggle", () => {
        renderHeader();
        const themeToggle = screen.getByRole("checkbox");
        fireEvent.click(themeToggle);
        expect(mockToggleTheme).toHaveBeenCalled();
    });
});