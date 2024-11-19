import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../components/AuthContext';

describe('AuthContext', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    const TestComponent = () => {
        const { user, loading } = useAuth();
        if (loading) return <div>Loading...</div>;
        return <div>{user ? user.email : 'No user'}</div>;
    };

    test('provides initial loading state', () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('checks session on mount', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    id: 1,
                    email: 'test@example.com'
                })
            })
        );

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('test@example.com')).toBeInTheDocument();
        });
    });

    test('handles session check failure', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: false
            })
        );

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('No user')).toBeInTheDocument();
        });
    });

    test('handles network error during session check', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.reject(new Error('Network error'))
        );

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('No user')).toBeInTheDocument();
        });
    });
});