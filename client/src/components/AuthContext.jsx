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
              const response = await fetch(' http://localhost:5555/api/session', {
                method: 'GET',
                credentials: 'include',
              });
      
              if (response.ok) {
                const data = await response.json();
                setUser(data);
              } else {
                setUser(null);
              }
            } catch (error) {
              console.error('Error checking session:', error);
              setUser(null);
            } finally {
              setLoading(false);
            }
          };
      
          fetchSession();
        }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading ,setLoading}}>
            {children}
        </AuthContext.Provider>
    );
};



