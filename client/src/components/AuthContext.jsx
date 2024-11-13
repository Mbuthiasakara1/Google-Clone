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
              console.error('Error checking session:', error);
              setUser(null);
            } finally {
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



// import React, { createContext, useContext, useState, useEffect } from "react";

// const AuthContext = createContext(null);

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchSession = async () => {
//       try {
//         const response = await fetch(`http://127.0.0.1:5555/api/session`, {
//           method: "GET",
//           credentials: "include",
//           headers: {
//             Accept: "application/json",
//             "Content-Type": "application/json",
//           },
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();
//         setUser(data.user);
//         setError(null);
//       } catch (error) {
//         console.error("Session fetch error:", error);
//         setError(error.message);
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSession();
//   }, []);

//   const handleLogout = async () => {
//     try {
//       const response = await fetch("http://127.0.0.1:5555/api/logout", {
//         method: "DELETE",
//         credentials: "include",
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.ok) {
//         throw new Error("Logout failed");
//       }

//       setUser(null);
//       setError(null);
//     } catch (error) {
//       console.error("Logout error:", error);
//       setError(error.message);
//     }
//   };

//   const handleUpdateAvatar = async (file, userId) => {
//     try {
//       const formData = new FormData();
//       formData.append("file", file);

//       const response = await fetch(
//         `http://127.0.0.1:5555/upload-avatar/${userId}`,
//         {
//           method: "POST",
//           credentials: "include",
//           body: formData,
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Avatar upload failed");
//       }

//       const data = await response.json();
//       setUser((prevUser) => ({
//         ...prevUser,
//         profile_pic: data.url,
//       }));

//       return data.url;
//     } catch (error) {
//       console.error("Avatar upload error:", error);
//       setError(error.message);
//       throw error;
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         setUser,
//         loading,
//         error,
//         isAuthenticated: !!user,
//         handleLogout,
//         handleUpdateAvatar,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };
