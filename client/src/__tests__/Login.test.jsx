// src/__tests__/Login.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import Login from '../components/Login';

describe('Login Component', () => {
  // Mock useNavigate
  const mockNavigate = jest.fn();
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
  }));

  beforeEach(() => {
    fetch.mockClear();
    mockNavigate.mockClear();
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

  // Original test - renders login form
  test('renders login form', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  // New test - validates form fields
  test('validates empty form fields', async () => {
    renderLogin();
    const loginButton = screen.getByRole('button', { name: /Login/i });
    
    // Attempt to submit empty form
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });
  });

  // New test - validates email format
  test('validates email format', async () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText(/Email/i);
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
    });
  });

  // Original test - handles successful login
  test('handles successful login', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'test@example.com'
        })
      })
    );

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5555/api/login',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123'
          })
        })
      );
      // New assertion - verify navigation after successful login
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  // Original test - handles login failure
  test('handles login failure', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid email or password' })
      })
    );

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: 'wrong@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'wrongpassword' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
    });
  });

  // New test - handles network error
  test('handles network error during login', async () => {
    fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByText(/An error occurred during login/i)).toBeInTheDocument();
    });
  });

  // New test - verifies loading state
  test('shows loading state during login attempt', async () => {
    fetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ id: 1 })
      }), 100))
    );

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    expect(screen.getByText(/Logging in.../i)).toBeInTheDocument();
  });

  // New test - verifies "Sign Up" link
  test('renders and navigates to sign up link', () => {
    renderLogin();
    const signUpLink = screen.getByText(/Sign Up/i);
    
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink.closest('a')).toHaveAttribute('href', '/signup');
  });
});