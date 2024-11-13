
import React, { useState, useEffect } from 'react';
import { useAuth } from "./AuthContext"
const UserProfile = () => {
  const [error, setError] = useState(null);
  const { user,loading } = useAuth()


  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await fetch('http://127.0.0.1:3001/users', {
          method: 'DELETE', 
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete account');
        }

        alert('Your account has been deleted.');
        setUserInfo(null); 
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Failed to delete account. Please try again.');
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



