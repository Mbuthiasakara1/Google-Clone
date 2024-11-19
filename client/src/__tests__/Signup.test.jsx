import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Signup from '../components/Signup';
import { SnackbarProvider } from 'notistack';

describe('Signup Component', () => {
    beforeEach(() => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: 'User created successfully' }),
            })
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders the Signup form on the screen', () => {
        render(
            <Router>
                <SnackbarProvider>
                    <Signup />
                </SnackbarProvider>
            </Router>
        );

        // Check for the presence of form elements
        expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    });

    test('displays validation errors on blur', async () => {
        render(
            <Router>
                <SnackbarProvider>
                    <Signup />
                </SnackbarProvider>
            </Router>
        );

        // Leave first name empty and blur the field to trigger validation
        const firstNameInput = screen.getByLabelText(/First Name/i);
        fireEvent.blur(firstNameInput);

        // Expect validation error for the required first name
        await waitFor(() =>
            expect(screen.getByText(/First name is required/i)).toBeInTheDocument()
        );
    });

    test('navigates to the next step when fields are valid', async () => {
        render(
            <Router>
                <SnackbarProvider>
                    <Signup />
                </SnackbarProvider>
            </Router>
        );

        // Fill out the first step fields
        fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });

        // Click "Next" button
        fireEvent.click(screen.getByText(/Next/i));

        // Wait for the second step to appear
        await waitFor(() => {
            expect(screen.getByLabelText(/Birthday/i)).toBeInTheDocument();
        });
    });

    test('displays validation errors on blur', async () => {
        render(
            <Router>
                <SnackbarProvider>
                    <Signup />
                </SnackbarProvider>
            </Router>
        );

        // Leave names empty and blur the field to trigger validation
        const firstNameInput = screen.getByLabelText(/First Name/i);
        fireEvent.blur(firstNameInput);

        const lastNameInput = screen.getByLabelText(/Last Name/i);
        fireEvent.blur(lastNameInput);

        // Expect validation error for the required fields
        await screen.findByText(/First name is required/i);
        await screen.findByText(/First name is required/i);  // Use findByText
    });


    test('displays an error message if API request fails', async () => {
        // Mock failed API response
        global.fetch.mockImplementationOnce(() =>
            Promise.reject(new Error('Network Error'))
        );

        render(
            <Router>
                <SnackbarProvider>
                    <Signup />
                </SnackbarProvider>
            </Router>
        );

        // Fill out all steps
        fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
        fireEvent.click(screen.getByText(/Next/i));

        fireEvent.change(screen.getByLabelText(/Birthday/i), { target: { value: '1990-01-01' } });
        fireEvent.change(screen.getByLabelText(/Gender/i), { target: { value: 'Male' } });
        fireEvent.click(screen.getByText(/Next/i));

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
        fireEvent.click(screen.getByText(/Next/i));

        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Password123' } });
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'Password123' } });
        fireEvent.click(screen.getByText(/Finish/i));

        // Wait for the error message to show
        await waitFor(() => {
            expect(screen.getByText(/Network Error/i)).toBeInTheDocument();
        });
    });

    test('submits the form successfully', async () => {
        render(
            <Router>
                <SnackbarProvider>
                    <Signup />
                </SnackbarProvider>
            </Router>
        );

        // Fill all steps to complete the form
        fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
        fireEvent.click(screen.getByText(/Next/i)); // Move to Personal Info step

        fireEvent.change(screen.getByLabelText(/Birthday/i), { target: { value: '1990-01-01' } });
        fireEvent.change(screen.getByLabelText(/Gender/i), { target: { value: 'Male' } });
        fireEvent.click(screen.getByText(/Next/i)); // Move to Email step

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
        fireEvent.click(screen.getByText(/Next/i)); // Move to Password step

        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Password123' } });
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'Password123' } });
        fireEvent.click(screen.getByText(/Finish/i));

        // Expect the success message after submission
        await waitFor(() => {
            expect(screen.getByText(/Signed up successfully!/i)).toBeInTheDocument();
        });

        // Ensure fetch was called with correct data
        expect(global.fetch).toHaveBeenCalledWith(
            'http://127.0.0.1:3001/users',
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: 'John',
                    lastName: 'Doe',
                    birthday: '1990-01-01',
                    gender: 'Male',
                    email: 'test@example.com',
                    password: 'Password123',
                }),
            })
        );
    });

});
