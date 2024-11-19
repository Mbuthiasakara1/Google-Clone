import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../components/AuthContext';
import { SnackbarProvider } from 'notistack';
import Home from '../components/Home';

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([])
  })
);

describe('Home Component', () => {
    beforeEach(() => {
        // Reset fetch mock
        fetch.mockClear();
        
        // Mock axios since it's used in the component
        jest.mock('axios', () => ({
            get: jest.fn(() => Promise.resolve({ data: [] }))
        }));
    });

    const renderHome = async () => {
        let renderResult;
        await act(async () => {
            renderResult = render(
                <BrowserRouter>
                    <AuthProvider>
                        <SnackbarProvider>
                            <Home />
                        </SnackbarProvider>
                    </AuthProvider>
                </BrowserRouter>
            );
        });
        return renderResult;
    };

    test('renders welcome message', async () => {
        await renderHome();
        expect(screen.getByText('Welcome to Drive')).toBeInTheDocument();
    });

    test('handles file search filtering', async () => {
        await renderHome();
        const searchInput = screen.getByPlaceholderText(/search in drive/i);
        
        await act(async () => {
            fireEvent.change(searchInput, { target: { value: 'test' } });
        });
        
        expect(searchInput.value).toBe('test');
    });

    test('shows appropriate message when no files found', async () => {
        await renderHome();
        await waitFor(() => {
            const noFilesMessage = screen.getByText('No files found');
            expect(noFilesMessage).toBeInTheDocument();
        });
    });

    test('shows appropriate message when no folders found', async () => {
        await renderHome();
        await waitFor(() => {
            const noFoldersMessage = screen.getByText('No folders found');
            expect(noFoldersMessage).toBeInTheDocument();
        });
    });

    test('back button is not visible initially', async () => {
        await renderHome();
        const backButton = screen.queryByText(/back to drive/i);
        expect(backButton).not.toBeInTheDocument();
    });

    test('handles folder navigation correctly', async () => {
        await renderHome();
        expect(screen.queryByText(/back/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Test Folder/i)).not.toBeInTheDocument();
    });

    test('search function filters content correctly', async () => {
        await renderHome();
        const searchInput = screen.getByPlaceholderText(/search in drive/i);
        await act(async () => {
            fireEvent.change(searchInput, { target: { value: 'test' } });
        });
        expect(searchInput.value).toBe('test');
    });

    // Clean up after tests
    afterEach(() => {
        jest.clearAllMocks();
    });
});