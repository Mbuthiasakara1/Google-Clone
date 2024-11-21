import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileCard from '../components/FileCard';
import { SnackbarProvider } from 'notistack';

// Mock the Auth hook directly
jest.mock('../components/AuthContext', () => ({
    useAuth: () => ({
        user: {
            id: 1,
            first_name: 'Test',
            last_name: 'User'
        }
    })
}));

describe('FileCard Component', () => {
    const mockFile = {
        id: 1,
        name: 'test.pdf',
        filetype: 'pdf',
        filesize: 1024,
        storage_path: 'http://example.com/test.pdf',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
    };

    const mockSetFilteredFiles = jest.fn();

    beforeEach(() => {
        global.fetch = jest.fn(() => 
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: 'Success' })
            })
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const renderFileCard = () => {
        render(
            <SnackbarProvider>
                <FileCard 
                    file={mockFile}
                    setFilteredFiles={mockSetFilteredFiles}
                />
            </SnackbarProvider>
        );
    };

    test('renders file information correctly', () => {
        renderFileCard();
        expect(screen.getByText('test.pdf')).toBeInTheDocument();
        expect(screen.getByText('1 KB')).toBeInTheDocument();
    });

    test('shows dropdown menu on button click', () => {
        renderFileCard();
        const dropdownButton = screen.getByRole('button', { name: '' });
        fireEvent.click(dropdownButton);

        expect(screen.getByText('Rename')).toBeInTheDocument();
        expect(screen.getByText('Download')).toBeInTheDocument();
        expect(screen.getByText('Move')).toBeInTheDocument();
        expect(screen.getByText('Move to Trash')).toBeInTheDocument();
    });

    test('handles move to trash action', async () => {
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: 'File moved to trash' })
            })
        );

        renderFileCard();
        
        const dropdownButton = screen.getByRole('button', { name: '' });
        fireEvent.click(dropdownButton);
        fireEvent.click(screen.getByText('Move to Trash'));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                `http://127.0.0.1:5555/api/files/${mockFile.id}/move-to-trash`,
                expect.objectContaining({
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bin: true })
                })
            );
        });
    });

    test('shows loading state during download', async () => {
        fetch.mockImplementationOnce(() => 
            new Promise(resolve => setTimeout(() => resolve({
                ok: true,
                blob: () => Promise.resolve(new Blob(['test content'], { type: 'application/pdf' }))
            }), 100))
        );

        renderFileCard();
        
        const dropdownButton = screen.getByRole('button', { name: '' });
        fireEvent.click(dropdownButton);
        
        const downloadButton = screen.getByText('Download');
        fireEvent.click(downloadButton);
        
        await waitFor(() => {
            expect(screen.getByText('Downloading...')).toBeInTheDocument();
        });
    });
});