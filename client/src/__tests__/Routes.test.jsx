import React from 'react';
import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../components/AuthContext';
import { SnackbarProvider } from 'notistack';
import routes from '../components/Routes';

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(null),
  })
);

describe('Routes Configuration', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    const renderWithRouter = (initialEntry = '/') => {
        const router = createMemoryRouter(routes, {
            initialEntries: [initialEntry],
        });

        return render(
            <AuthProvider>
                <SnackbarProvider>
                    <RouterProvider router={router} />
                </SnackbarProvider>
            </AuthProvider>
        );
    };

    test('contains all required routes', () => {
        const paths = routes.map(route => route.path);
        expect(paths).toContain('/');
        expect(paths).toContain('/signup');
        expect(paths).toContain('/login');
        expect(paths).toContain('/profile');
        expect(paths).toContain('/my-drive');
        expect(paths).toContain('/trash');
    });

    test('routes are properly configured with components', () => {
        routes.forEach(route => {
            expect(route).toHaveProperty('path');
            expect(route).toHaveProperty('element');
            expect(React.isValidElement(route.element)).toBeTruthy();
        });
    });

    test('home route renders Home component', async () => {
        renderWithRouter('/');
        expect(await screen.findByText(/Welcome to Drive/i)).toBeInTheDocument();
    });

    test('signup route renders Signup component', async () => {
        renderWithRouter('/signup');
        expect(await screen.findByRole('heading', { name: /Sign Up/i })).toBeInTheDocument();
    });

    // Clean up after all tests
    afterAll(() => {
        jest.restoreAllMocks();
    });
});