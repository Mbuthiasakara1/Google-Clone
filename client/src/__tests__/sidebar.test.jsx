import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../components/AuthContext';
import { SnackbarProvider } from 'notistack';
import Sidebar from '../components/Sidebar';

// Mock the useStore hook
jest.mock('../components/Store', () => ({
  __esModule: true,
  default: () => ({
    isCreatingFolder: false,
    setIsCreatingFolder: jest.fn(),
    isUploading: false,
    setIsUploading: jest.fn()
  })
}));

// Mock user authentication context
jest.mock('../components/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    user: { id: 1 }
  })
}));

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ id: 1, name: 'New Test Folder' })
  })
);

describe('Sidebar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderSidebar = () => {
    render(
      <BrowserRouter>
        <SnackbarProvider>
          <AuthProvider>
            <Sidebar />
          </AuthProvider>
        </SnackbarProvider>
      </BrowserRouter>
    );
  };

  test('renders sidebar navigation elements', () => {
    renderSidebar();
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/My Drive/i)).toBeInTheDocument();
    expect(screen.getByText(/Trash/i)).toBeInTheDocument();
  });

  test('shows create folder dialog when Create Folder is clicked', async () => {
    renderSidebar();
    
    // Click the New button to open dropdown
    fireEvent.click(screen.getByRole('button', { name: /new/i }));
    
    // Click Create Folder in the dropdown
    fireEvent.click(screen.getByText(/Create Folder/i));
    
    // Check if dialog is shown
    expect(screen.getByText(/Create New Folder/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Folder Name/i)).toBeInTheDocument();
  });

  // test('handles folder creation submission', async () => {
  //   renderSidebar();
    
  //   Open the create folder dialog
  //   fireEvent.click(screen.getByRole('button', { name: /new/i }));
  //   fireEvent.click(screen.getByText(/Create Folder/i));
    
  //   Fill and submit the form
  //   const input = screen.getByLabelText(/Folder Name/i);
  //   fireEvent.change(input, { target: { value: 'New Test Folder' } });
    
  //   const createButton = screen.getByRole('button', { name: /^Create$/i });
  //   fireEvent.click(createButton);
    
  //   // Wait for the dialog to close
  //   await waitFor(() => {
  //     expect(fetch).toHaveBeenCalledWith(
  //       '/api/folders',
  //       expect.objectContaining({
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: expect.any(String)
  //       })
  //     );
  //   });
  // });

  test('navigation links have correct hrefs', () => {
    renderSidebar();
    
    // Check navigation link hrefs
    const homeLink = screen.getByText(/Home/i).closest('a');
    const myDriveLink = screen.getByText(/My Drive/i).closest('a');
    const trashLink = screen.getByText(/Trash/i).closest('a');
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(myDriveLink).toHaveAttribute('href', '/my-drive');
    expect(trashLink).toHaveAttribute('href', '/trash');
  });
});