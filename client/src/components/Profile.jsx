<<<<<<< HEAD
import React, { useState } from 'react';
=======
<<<<<<< HEAD

import React, { useState, useEffect } from 'react';
>>>>>>> 74fb506 (resolved conflicts from merge)
import { useAuth } from "./AuthContext"
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';


const UserProfile = () => {
  const [error, setError] = useState(null);
  const { user, loading } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

<<<<<<< HEAD
  const navigate = useNavigate()
=======
=======
// import React, { useState, useEffect } from 'react';

// const UserProfile = () => {
//   const [userInfo, setUserInfo] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const response = await fetch('http://127.0.0.1:3001/users');
        
//         if (!response.ok) {
//           throw new Error('Network response was not ok');
//         }

//         const userData = await response.json();
//         setUserInfo(userData);
//       } catch (error) {
//         console.error('Error fetching user data:', error);
//         setError(error.message); 
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserData();
//   }, []);

//   const handleDeleteAccount = async () => {
//     if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
//       try {
//         const response = await fetch('http://127.0.0.1:3001/users', {
//           method: 'DELETE', 
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });

//         if (!response.ok) {
//           throw new Error('Failed to delete account');
//         }

//         alert('Your account has been deleted.');
//         setUserInfo(null); 
//       } catch (error) {
//         console.error('Error deleting account:', error);
//         alert('Failed to delete account. Please try again.');
//       }
//     }
//   };

//   if (loading) {
//     return <p>Loading user information...</p>;
//   }

//   if (error) {
//     return <p>Error: {error}</p>;
//     }

//   if (!userInfo) {
//     return <p>No user information available.</p>;
//   }

//   return (
//     <div>
//       <h1>User Profile</h1>
//       <p><strong>FirstName:</strong> {userInfo.firstname}</p>
//       <p><strong>LastName:</strong> {userInfo.lastname}</p>
//       <p><strong>Gender:</strong> {userInfo.gender}</p>
//       <p><strong>Email:</strong> {userInfo.email}</p>
//       <button onClick={handleDeleteAccount}>Delete Account</button>
//     </div>
//   );
// };

// export default UserProfile;
import React, { useState, useEffect } from 'react';
import { useAuth } from "./AuthContext"
const UserProfile = () => {
//   const [userInfo, setUserInfo] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  const { user,loading } = useAuth()

  console.log(user)

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const response = await fetch(`http://127.0.0.1:5555/users/${user.id}`);
        
//         if (!response.ok) {
//           throw new Error('Network response was not ok');
//         }

//         const userData = await response.json();
//         setUserInfo(userData);
//       } catch (error) {
//         console.error('Error fetching user data:', error);
//         setError(error.message); 
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserData();
//   }, []);
>>>>>>> 12c4b17 (resolved conflicts from merge)
>>>>>>> 74fb506 (resolved conflicts from merge)

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await fetch(`http://127.0.0.1:5555/api/users/${user.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete account');
        }

        enqueueSnackbar('Account Deleted!', {
          variant: 'success',
        });
        navigate('/signup');

      } catch (error) {
        setError(error);
        enqueueSnackbar(error.message || 'An error occurred. Try again.', {
          variant: 'error' 
        });
      }
    }
  };

  if (loading) {
    return <p>Loading user information...</p>;
  }

<<<<<<< HEAD
  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!user) {
    return <p>No user information available.</p>;
  }
=======
//   if (error) {
//     return <p>Error: {error}</p>;
//   }

//   if (!userInfo) {
//     return <p>No user information available.</p>;
//   }
>>>>>>> 12c4b17 (resolved conflicts from merge)

  return (
    <div className="card-container">
<<<<<<< HEAD
      <div className="card">
        <h1 className="card-title">User Profile</h1>
        <div className="card-content">
          <div className='img-container'>
            <div className='card-img'>
              <img src={user.profile_pic} alt="profile pic" />
            </div>
          </div>
          <p><strong>Name:</strong><span>{user.first_name}</span><span>{user.last_name}</span> </p>
          <p><strong>Birthday:</strong> <span>{user.birthday}</span></p>
          <p><strong>Gender:</strong> <span>{user.gender}</span></p>
          <p><strong>Email:</strong> <span>{user.email}</span> </p>
          <button className="card-button" onClick={handleDeleteAccount}>Delete Account</button>
=======
    <div className="card">
      <h1 className="card-title">User Profile</h1>
      <div className="card-content">
        <div className='img-container'>
        <div className='card-img'>
<<<<<<< HEAD
            <img src={user.profile_pic} alt="profile pic" />
=======
            <img src="" alt="profile pic" />
>>>>>>> 12c4b17 (resolved conflicts from merge)
>>>>>>> 74fb506 (resolved conflicts from merge)
        </div>
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default UserProfile;
=======
export default UserProfile;

<<<<<<< HEAD

=======
// UserProfile.css
>>>>>>> 12c4b17 (resolved conflicts from merge)

>>>>>>> 74fb506 (resolved conflicts from merge)
