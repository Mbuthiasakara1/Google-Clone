import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageView from '../components/ImageView';

describe('ImageView Component', () => {
    const mockImageId = {
        id: 1,
        storage_path: 'http://example.com/test-image.jpg',
        name: 'test-image.jpg'
    };
    const mockOnClose = jest.fn();

    beforeEach(() => {
        mockOnClose.mockClear();
    });

    test('renders image with correct source', () => {
        render(<ImageView imageId={mockImageId} onClose={mockOnClose} />);
        const image = screen.getByAltText('Preview');
        expect(image).toHaveAttribute('src', mockImageId.storage_path);
    });

    test('calls onClose when close button is clicked', () => {
        render(<ImageView imageId={mockImageId} onClose={mockOnClose} />);
        const closeButton = screen.getByText('X');
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('does not close when clicking image', () => {
        render(<ImageView imageId={mockImageId} onClose={mockOnClose} />);
        const image = screen.getByAltText('Preview');
        fireEvent.click(image);
        expect(mockOnClose).not.toHaveBeenCalled();
    });
});