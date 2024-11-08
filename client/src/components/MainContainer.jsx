import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  IconButton,
  Typography,
  Breadcrumbs,
  Link,
  Snackbar,
  Alert
} from '@mui/material';
import {
  MoreVert,
  Download,
  DriveFileRenameOutline,
  Delete,
  FolderCopy,
  InsertDriveFile,
  Folder,
  Image,
  PictureAsPdf,
  TableChart,
  Home,
  Description,
  VideoFile
} from '@mui/icons-material';

const MainContainer = () => {
  // State management
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPath, setCurrentPath] = useState('/');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [folders, setFolders] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch items on component mount and path change
  useEffect(() => {
    fetchItems();
  }, [currentPath]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:3001/files');
      const files = await response.json();
      const foldersResponse = await fetch('http://localhost:3001/folders');
      const foldersData = await foldersResponse.json();
      
      setItems([...files, ...foldersData].filter(item => item.path === currentPath));
      setFolders(foldersData);
      setError(null);
    } catch (error) {
      setError('Failed to fetch items');
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Icon helper function
  const getItemIcon = (type) => {
    const iconProps = { sx: { fontSize: 40 } };
    switch (type.toLowerCase()) {
      case 'folder':
        return <Folder {...iconProps} sx={{ ...iconProps.sx, color: '#FFA000' }} />;
      case 'image':
        return <Image {...iconProps} sx={{ ...iconProps.sx, color: '#4CAF50' }} />;
      case 'pdf':
        return <PictureAsPdf {...iconProps} sx={{ ...iconProps.sx, color: '#F44336' }} />;
      case 'document':
        return <Description {...iconProps} sx={{ ...iconProps.sx, color: '#2196F3' }} />;
      case 'spreadsheet':
        return <TableChart {...iconProps} sx={{ ...iconProps.sx, color: '#0F9D58' }} />;
      case 'video':
        return <VideoFile {...iconProps} sx={{ ...iconProps.sx, color: '#9C27B0' }} />;
      default:
        return <InsertDriveFile {...iconProps} sx={{ ...iconProps.sx, color: '#607D8B' }} />;
    }
  };

  // Menu handlers
  const handleMenuClick = (event, item) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Action handlers
  const handleDownload = async () => {
    try {
      if (!selectedItem?.url) {
        throw new Error('Download URL not available');
      }
      window.open(selectedItem.url, '_blank');
      showSnackbar('Download started', 'success');
    } catch (error) {
      showSnackbar('Download failed', 'error');
      console.error('Download error:', error);
    }
    handleMenuClose();
  };

  const handleRenameClick = () => {
    setNewName(selectedItem.name);
    setIsRenameDialogOpen(true);
    handleMenuClose();
  };

  const handleRenameSubmit = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`http://localhost:3001/${selectedItem.type}s/${selectedItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) throw new Error('Failed to rename item');

      setItems(items.map(item =>
        item.id === selectedItem.id ? { ...item, name: newName } : item
      ));
      showSnackbar('Item renamed successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to rename item', 'error');
      console.error('Rename error:', error);
    }
    setIsRenameDialogOpen(false);
  };

  const handleMoveClick = () => {
    setIsMoveDialogOpen(true);
    handleMenuClose();
  };

  const handleMove = async (targetFolderId) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`http://localhost:3001/${selectedItem.type}s/${selectedItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folderId: targetFolderId }),
      });

      if (!response.ok) throw new Error('Failed to move item');

      setItems(items.filter(item => item.id !== selectedItem.id));
      showSnackbar('Item moved successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to move item', 'error');
      console.error('Move error:', error);
    }
    setIsMoveDialogOpen(false);
  };

  const handleDelete = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`http://localhost:3001/${selectedItem.type}s/${selectedItem.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete item');

      setItems(items.filter(item => item.id !== selectedItem.id));
      showSnackbar('Item moved to trash', 'success');
    } catch (error) {
      showSnackbar('Failed to delete item', 'error');
      console.error('Delete error:', error);
    }
    handleMenuClose();
  };

  // Navigation handlers
  const handleFolderClick = (folder) => {
    setCurrentPath(folder.path + folder.name + '/');
  };

  const handleBreadcrumbClick = (path) => {
    setCurrentPath(path);
  };

  // Helper functions
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getBreadcrumbs = () => {
    const paths = currentPath.split('/').filter(Boolean);
    return (
      <Breadcrumbs className="drive-breadcrumb">
        <Link
          component="button"
          onClick={() => handleBreadcrumbClick('/')}
          className="drive-breadcrumb-link"
        >
          <Home sx={{ mr: 0.5, fontSize: 20 }} /> Home
        </Link>
        {paths.map((path, index) => (
          <Link
            key={path}
            component="button"
            onClick={() => handleBreadcrumbClick('/' + paths.slice(0, index + 1).join('/') + '/')}
            className="drive-breadcrumb-link"
          >
            {path}
          </Link>
        ))}
      </Breadcrumbs>
    );
  };

  if (loading) {
    return (
      <div className="drive-loading">
        <CircularProgress className="drive-loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="drive-error">
        <Alert severity="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="drive-container">
      <div className="drive-header">
        <Typography className="drive-header-title">
          My Drive
        </Typography>
      </div>

      {getBreadcrumbs()}

      <Grid container className="drive-grid">
        {items.length === 0 ? (
          <div className="drive-empty">
            <InsertDriveFile className="drive-empty-icon" />
            <Typography>No items in this folder</Typography>
          </div>
        ) : (
          items.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <div 
                className={`drive-card ${selectedItem?.id === item.id ? 'drive-card-selected' : ''}`}
                onClick={() => item.type === 'folder' && handleFolderClick(item)}
              >
                <div className="drive-card-content">
                  <div className="drive-item-icon">
                    {getItemIcon(item.type)}
                  </div>
                  <div className="drive-item-details">
                    <Typography className="drive-item-name">
                      {item.name}
                    </Typography>
                    <Typography className="drive-item-info">
                      Last opened: {item.lastOpened}
                    </Typography>
                    {item.size && (
                      <Typography className="drive-item-info">
                        Size: {item.size}
                      </Typography>
                    )}
                  </div>
                </div>
                <div className="drive-card-actions">
                  <IconButton
                    className="drive-action-button"
                    onClick={(e) => handleMenuClick(e, item)}
                  >
                    <MoreVert />
                  </IconButton>
                </div>
              </div>
            </Grid>
          ))
        )}
      </Grid>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        className="drive-menu"
      >
        <MenuItem 
          onClick={handleDownload} 
          disabled={!selectedItem?.url || selectedItem?.type === 'folder'}
          className="drive-menu-item"
        >
          <Download className="drive-menu-item-icon" /> Download
        </MenuItem>
        <MenuItem 
          onClick={handleRenameClick}
          className="drive-menu-item"
        >
          <DriveFileRenameOutline className="drive-menu-item-icon" /> Rename
        </MenuItem>
        <MenuItem 
          onClick={handleMoveClick}
          className="drive-menu-item"
        >
          <FolderCopy className="drive-menu-item-icon" /> Move
        </MenuItem>
        <MenuItem 
          onClick={handleDelete}
          className="drive-menu-item"
        >
          <Delete className="drive-menu-item-icon" /> Move to trash
        </MenuItem>
      </Menu>

      {/* Rename Dialog */}
      <Dialog 
        open={isRenameDialogOpen} 
        onClose={() => setIsRenameDialogOpen(false)}
        className="drive-dialog"
      >
        <DialogTitle className="drive-dialog-title">
          Rename {selectedItem?.type}
        </DialogTitle>
        <DialogContent className="drive-dialog-content">
          <TextField
            autoFocus
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="drive-input"
          />
        </DialogContent>
        <DialogActions className="drive-dialog-actions">
          <Button 
            onClick={() => setIsRenameDialogOpen(false)}
            className="drive-button-secondary"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRenameSubmit}
            className="drive-button-primary"
            disabled={!newName.trim()}
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>

      {/* Move Dialog */}
      <Dialog 
        open={isMoveDialogOpen} 
        onClose={() => setIsMoveDialogOpen(false)}
        className="drive-dialog"
      >
        <DialogTitle className="drive-dialog-title">
          Move to folder
        </DialogTitle>
        <DialogContent className="drive-dialog-content">
          {folders.length === 0 ? (
            <Typography className="drive-menu-item">No folders available</Typography>
          ) : (
            folders.map((folder) => (
              <MenuItem
                key={folder.id}
                onClick={() => handleMove(folder.id)}
                className="drive-menu-item"
                disabled={folder.id === selectedItem?.id}
              >
                <Folder className="drive-menu-item-icon" /> {folder.name}
              </MenuItem>
            ))
          )}
        </DialogContent>
        <DialogActions className="drive-dialog-actions">
          <Button 
            onClick={() => setIsMoveDialogOpen(false)}
            className="drive-button-secondary"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default MainContainer;