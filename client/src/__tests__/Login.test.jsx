import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import Login from '../components/Login';
import { act } from 'react';

// Mock the AuthContext module
jest.mock('../components/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    setUser: jest.fn(),
    user: null
  })
}));

// Mock the react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Login Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
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

  test('renders login form', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  test('handles successful login', async () => {
    global.fetch.mockImplementationOnce(() =>
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

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Email/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText(/Password/i), {
        target: { value: 'Password123' }
      });
    });

    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        ' http://127.0.0.1:5555/api/login',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'Password123'
          })
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('handles login failure', async () => {
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

  test('shows sign up link', () => {
    renderLogin();
    expect(screen.getByText(/Sign Up/i).closest('a')).toHaveAttribute('href', '/signup');
  });
});