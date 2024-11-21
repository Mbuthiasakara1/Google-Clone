import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import Login from '../components/Login';
import { act } from 'react';

jest.mock('../components/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    setUser: jest.fn(),
    user: null
  })
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Login Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    global.fetch = jest.fn();
  });

  const renderLogin = () => {
    render(
      <BrowserRouter>
        <SnackbarProvider>
          <Login />
        </SnackbarProvider>
      </BrowserRouter>
    );
  };

  test('renders login form with all expected elements', () => {
    renderLogin();
    
    // Check for form elements
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    
    // Check for logo and links
    expect(screen.getByAltText(/login/i)).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
  });

  test('displays validation errors for empty fields', async () => {
    renderLogin();
    
    // Get form elements
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    
    // Trigger validation by focusing and blurring inputs
    await act(async () => {
      fireEvent.focus(emailInput);
      fireEvent.blur(emailInput);
      fireEvent.focus(passwordInput);
      fireEvent.blur(passwordInput);
    });

    // Check for validation error messages
    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });
  });

  test('validates email format', async () => {
    renderLogin();
    
    // Get email input
    const emailInput = screen.getByPlaceholderText(/Email/i);
    
    // Enter invalid email
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);
    });

    // Check for email format validation error
    await waitFor(() => {
      expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
    });
  });

  test('handles login failure with error message', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid email or password' })
      })
    );

    renderLogin();

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Email/i), {
        target: { value: 'wrong@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText(/Password/i), {
        target: { value: 'wrongpassword' }
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
    });
  });

  test('handles network error during login', async () => {
    global.fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );

    renderLogin();

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Email/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText(/Password/i), {
        target: { value: 'password123' }
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/An error occurred during login/i)).toBeInTheDocument();
    });
  });

  test('disables login button when form is invalid or submitting', async () => {
    renderLogin();
    
    const loginButton = screen.getByRole('button', { name: /Login/i });
    
    // Initially disabled because form is empty
    expect(loginButton).toBeDisabled();
    
    // Still disabled with invalid email
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Email/i), {
        target: { value: 'invalid-email' }
      });
    });
    expect(loginButton).toBeDisabled();
    
    // Enabled with valid inputs
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Email/i), {
        target: { value: 'valid@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText(/Password/i), {
        target: { value: 'validPassword123' }
      });
    });
    expect(loginButton).not.toBeDisabled();
  });

  test('shows sign up link with correct navigation', () => {
    renderLogin();
    const signUpLink = screen.getByText(/Sign Up/i).closest('a');
    expect(signUpLink).toHaveAttribute('href', '/signup');
  });
});