import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the AuthContext
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5555/api/session`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const { user } = await response.json();
                    setUser(user); // store user details
                } else {
                    throw new Error('Failed to fetch session');
                }
            } catch (error) {
                console.error('Error:', error);
            } finally{
                setLoading(false);
            }
        };

        fetchSession();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
