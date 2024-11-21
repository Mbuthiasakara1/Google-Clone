import React, { createContext, useContext, useState, useEffect } from 'react';
import useStore from './Store';

// Create the AuthContext
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};

// AuthProvider component
export const AuthProvider = ({ children }) => { 
    const {user,setUser, loading, setLoading}=useStore()
    

    useEffect(() => {
        const fetchSession = async () => {
            try {
              const response = await fetch('http://127.0.0.1:5555/api/session', {
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
              // console.error('Error checking session:', error);
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



