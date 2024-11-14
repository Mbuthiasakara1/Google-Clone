import React, { useState } from 'react';
import { useAuth } from "./AuthContext"
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from "./AuthContext"

const UserProfile = () => {
  const [error, setError] = useState(null);
  const { user, loading } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()



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

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!user) {
    return <p>No user information available.</p>;
  }

  return (
    <div className="card-container">
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

        </div>
      </div>
    </div>
  );
};


export default UserProfile;


