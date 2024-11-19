import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileCard from '../components/FileCard';
import { SnackbarProvider } from 'notistack';

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

  const renderFileCard = () => {
    render(
      <SnackbarProvider>
        <FileCard file={mockFile} />
      </SnackbarProvider>
    );
  };

  test('renders file information correctly', () => {
    renderFileCard();
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    expect(screen.getByText(/1 KB/)).toBeInTheDocument();
  });

  test('shows dropdown menu on button click', () => {
    renderFileCard();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/Rename/i)).toBeInTheDocument();
    expect(screen.getByText(/Download/i)).toBeInTheDocument();
    expect(screen.getByText(/Move/i)).toBeInTheDocument();
    expect(screen.getByText(/Move To Trash/i)).toBeInTheDocument();
  });

  test('handles rename action', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ name: 'renamed.pdf' })
      })
    );

    renderFileCard();
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText(/Rename/i));

    const input = screen.getByPlaceholderText(/Enter new name/i);
    fireEvent.change(input, { target: { value: 'renamed.pdf' } });
    fireEvent.click(screen.getByText(/Submit/i));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:5555/api/files/${mockFile.id}`,
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'renamed.pdf' })
        })
      );
    });
  });

  test('handles move to trash action', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'File moved to trash' })
      })
    );

    renderFileCard();
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText(/Move To Trash/i));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:5555/api/files/${mockFile.id}/move-to-trash`,
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bin: true })
        })
      );
    });
  });
});