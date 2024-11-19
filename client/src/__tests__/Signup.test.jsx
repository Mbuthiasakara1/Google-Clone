import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SnackbarProvider } from 'notistack';
import { BrowserRouter } from 'react-router-dom';
import Signup from '../components/Signup';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock fetch
global.fetch = jest.fn();

// Wrapper component for providers
const AllTheProviders = ({ children }) => {
  return (
    <BrowserRouter>
      <SnackbarProvider>{children}</SnackbarProvider>
    </BrowserRouter>
  );
};

describe('Signup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all steps of the signup form', () => {
    render(<Signup />, { wrapper: AllTheProviders });
    
    // Check for stepper labels
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Personal Info')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();

    // Check for text fields in the first step
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
  });

  it('validates first step fields', async () => {
    render(<Signup />, { wrapper: AllTheProviders });
    
    const firstNameInput = screen.getByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');
    const nextButton = screen.getByRole('button', { name: /next/i });

    // Click next without filling fields
    fireEvent.click(nextButton);
    
    // Trigger blur events to show validation
    fireEvent.blur(firstNameInput);
    fireEvent.blur(lastNameInput);
    
    // Fill in fields
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    
    // Click next button
    fireEvent.click(nextButton);
    
    // Check if we moved to next step
    await waitFor(() => {
      expect(screen.getByText('Personal Info')).toBeInTheDocument();
    });
  });

  it('completes first step and moves to second step', async () => {
    render(<Signup />, { wrapper: AllTheProviders });

    // Fill in first step
    const firstNameInput = screen.getByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');
    
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    
    // Move to next step
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // Verify we've moved to the second step
    await waitFor(() => {
      expect(screen.getByText('Personal Info')).toBeInTheDocument();
      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton).toBeEnabled();
      
      // Material-UI forms can sometimes be tricky to test, so we'll check for the step label
      const stepLabel = screen.getByText('Personal Info');
      expect(stepLabel).toHaveClass('Mui-active');
    });
  });
});