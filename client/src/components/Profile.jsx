// import React, { useState } from 'react';
// import { useAuth } from "./AuthContext";
// import { useNavigate } from 'react-router-dom';
// import { useSnackbar } from 'notistack';
// import {
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
//   Button
// } from '@mui/material';

// const UserProfile = () => {
//   const [error, setError] = useState(null);
//   const [openDialog, setOpenDialog] = useState(false);
//   const { user, loading } = useAuth();
//   const { enqueueSnackbar } = useSnackbar();
//   const navigate = useNavigate();

//   const handleDeleteAccount = async () => {
//     try {
//       const response = await fetch(`http://127.0.0.1:5555/api/users/${user.id}`, {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (!response.ok) {
//         throw new Error('Failed to delete account');
//       }

//       enqueueSnackbar('Account Deleted!', {
//         variant: 'success',
//       });
//       navigate('/signup');
//     } catch (error) {
//       setError(error);
//       enqueueSnackbar(error.message || 'An error occurred. Try again.', {
//         variant: 'error',
//       });
//     }
//   };

//   const handleOpenDialog = () => {
//     setOpenDialog(true);
//   };

//   const handleCloseDialog = () => {
//     setOpenDialog(false);
//   };

//   const handleConfirmDelete = async () => {
//     await handleDeleteAccount();
//     handleCloseDialog();
//   };

//   if (loading) {
//     return <p>Loading user information...</p>;
//   }

//   if (!user) {
//     return <p>No user information available.</p>;
//   }

//   return (
//     <div className="card-container">
//       <div className="card">
//         <h1 className="card-title">User Profile</h1>
//         <div className="card-content">
//           <div className="img-container">
//             <div className="card-img">
//               <img src={user.profile_pic} alt="profile pic" />
//             </div>
//           </div>
//           <p>
//             <strong>Name:</strong> <span>{user.first_name}</span> <span>{user.last_name}</span>
//           </p>
//           <p>
//             <strong>Birthday:</strong> <span>{user.birthday}</span>
//           </p>
//           <p>
//             <strong>Gender:</strong> <span>{user.gender}</span>
//           </p>
//           <p>
//             <strong>Email:</strong> <span>{user.email}</span>
//           </p>
//           <button className="card-button" onClick={handleOpenDialog}>
//             Delete Account
//           </button>
//         </div>
//       </div>

//       {/* Confirmation Dialog */}
//       <Dialog open={openDialog} onClose={handleCloseDialog}>
//         <DialogTitle>Confirm Account Deletion</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Are you sure you want to delete your account? This action cannot be undone.
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseDialog} color="secondary">
//             Cancel
//           </Button>
//           <Button onClick={handleConfirmDelete} color="error" autoFocus>
//             Delete
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };

// export default UserProfile;


import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Typography
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';


const UserProfile = () => {
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { user, loading } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
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

      enqueueSnackbar('Account Deleted!', { variant: 'success' });
      navigate('/signup');
    } catch (error) {
      setError(error);
      enqueueSnackbar(error.message || 'An error occurred. Try again.', { variant: 'error' });
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmDelete = async () => {
    await handleDeleteAccount();
    handleCloseDialog();
  };

  const handleGoBack = () => {
    navigate(-1); // Navigates back to the last visited page
  };

  if (loading) {
    return (
      <div className="loading-container">
        <CircularProgress />
      </div>
    );
  }

  if (!user) {
    return <p>No user information available.</p>;
  }

  return (
    <div className="user-profile-container">
      {/* Back Button */}
      <IconButton onClick={handleGoBack} className="back-button">
        <ArrowBackIcon fontSize="large" />
      </IconButton>

      {/* User Profile Card */}
      <Card className="profile-card">
        <CardMedia
          component="img"
          height="200"
          image={user.profile_pic || 'https://via.placeholder.com/150'}
          alt="profile pic"
          className="profile-img"
        />
        <CardContent>
          <Typography variant="h4" className="profile-title">User Profile</Typography>
          <Typography variant="body1" className='profile-p'><strong>Name:</strong> {user.first_name} {user.last_name}</Typography>
          <Typography variant="body1" className='profile-p'><strong>Birthday:</strong> {user.birthday}</Typography>
          <Typography variant="body1" className='profile-p'><strong>Gender:</strong> {user.gender}</Typography>
          <Typography variant="body1" className='profile-p'><strong>Email:</strong> {user.email}</Typography>
        </CardContent>
        <div className='button-container'>
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleOpenDialog}
          className="delete-button"
        >
          Delete Account
        </Button>
        </div>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserProfile;
