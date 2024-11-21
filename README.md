

# Google Drive Clone - Frontend (React)

## Overview

This is the frontend application of a **Google Drive Clone**, built with **React**. The application allows users to interact with a cloud storage system, manage files and folders, and perform actions such as uploading, deleting, restoring, and searching files and folders in their trash. The frontend communicates with a backend API to manage file storage, user authentication, and other operations.

## Features

- **User Authentication**: Users can sign in and authenticate using their credentials.
- **File and Folder Management**: Users can upload, view, restore, and permanently delete files and folders.
- **File Search**: Ability to search files and folders in trash based on names.
- **Responsive Design**: Fully responsive UI to provide a seamless experience on desktops and mobile devices.
- **Snackbar Notifications**: Real-time notifications for file operations such as uploads, deletions, and restorations.
- **Cloud Integration**: Upload files from local storage or Google Drive using Cloudinary for file management.
- **Modern UI**: A clean and user-friendly interface with Material UI and React Icons.
- **Dynamic File Previews**: Display file details such as name, size, and last modified date.
- **Folder and File Deletion**: Option to delete or restore files and folders from the trash.

## Technologies Used

- **React**: A JavaScript library for building user interfaces.
- **Axios**: For making HTTP requests to the backend API.
- **Material UI**: A React UI framework for creating modern, responsive, and accessible interfaces.
- **React Router**: For navigating between different views (Dashboard, Trash, etc.).
- **Cloudinary**: For managing file uploads from local storage, Google Drive, Dropbox, etc.
- **Notistack**: A library for displaying notifications (Snackbar) in the app.

## Setup

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)

### Installation

1. **Clone the repository**:
  
   git clone git@github.com:ngugilovesyou/Google-Drive.git
  

2. **Navigate to the project directory**:

   cd google-drive-clone-client
  

3. **Install dependencies**:
 
   npm install
  

4. **Start the development server**:
  
   npm start
  

   This will start the development server and open the app in your default web browser. The app will automatically reload if you make changes to the code.

### Configuration

The frontend expects the backend API to be running locally on ``. Ensure that your backend is set up and running before using this frontend application.

### Environment Variables

The frontend uses **Cloudinary** for file uploads. Make sure to set up a Cloudinary account and configure your environment variables for API keys.


REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset


## File Structure

- **src/**: Contains all the React components, pages, and hooks.
  - **components/**: Reusable UI components (e.g., Header, Sidebar, FileCard).
  - **pages/**: Different views such as Dashboard, Trash, etc.
  - **hooks/**: Custom hooks (e.g., useAuth, useSnackbar).
  - **utils/**: Utility functions for handling API requests and file operations.

## Usage

Once the app is set up and running, you will be able to:

1. **Login**: Enter your credentials to log in.
2. **Upload Files**: Click the "Upload File" button to select and upload files.
3. **View Files and Folders**: Browse files and folders, including those in trash.
4. **Restore Files/Folders**: Restore deleted files or folders to their original location.
5. **Delete Files/Folders**: Permanently delete files or folders from the trash.

### Pages

- **Home**: The main page where users can view files and folders.
- **MyDrive**: View and manage files and folders that have been deleted.
- **Trash**: An interface to upload files from your local device or cloud storage services.

### Components

- **Header**: The top navigation bar that includes search functionality.
- **Sidebar**: A navigation menu for accessing different parts of the application.
- **FileCard**: Represents individual files in the file listing section.
- **Upload Widget**: Handles file uploads via Cloudinary.

BACKEND


A backend API for managing users, files, and folders, supporting file organization, relationships, and user authentication.

## **Table of Contents**
1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Setup Instructions](#setup-instructions)
5. [API Endpoints](#api-endpoints)
6. [Project Structure](#project-structure)
7. [Contributing](#contributing)
8. [License](#license)

---

## **Overview**
This backend API provides functionality to:
- Manage users and their associated files and folders.
- Support hierarchical folder structures with parent-child relationships.
- Handle file attributes like type, size, and storage path.
- Securely manage user authentication and file/folder permissions.

---

## **Features**
- **User Management**:
  - Create, update, and delete user accounts.
  - Secure password storage.
  - Profile picture support.
- **File & Folder Management**:
  - CRUD operations for files and folders.
  - Support for hierarchical folder structures.
  - Soft deletion (bin functionality).
- **Serialization**:
  - Customized serialization rules to prevent circular references in nested relationships.
- **Database**:
  - Relational database with SQLAlchemy.
  - Cascading deletes for related data.

---

## **Tech Stack**
- **Programming Language**: Python
- **Framework**: Flask
- **Database**: PostgreSQL / SQLite (depending on the environment)
- **Libraries**:
  - SQLAlchemy: ORM for database operations
  - Flask-Marshmallow: Serialization and deserialization
  - Other dependencies in `requirements.txt`

---

## **Setup Instructions**

### **Prerequisites**
- Python 3.9+ installed
- A database like PostgreSQL or SQLite
- `pip` for managing Python packages

### **Steps**


1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set Up Environment Variables**:
   Create a `.env` file in the project root with the following:
   ```env
   FLASK_ENV=development
   DATABASE_URI=postgresql://<user>:<password>@localhost/<database>
   SECRET_KEY=your_secret_key
   ```

3. **Initialize the Database**:
   Run the following commands:
  
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
  

4. **Run the Server**:
  
   flask run
   ```
   Access the API at ``/``.

---

## **API Endpoints**

| **Method** | **Endpoint**          | **Description**                  |
|------------|-----------------------|----------------------------------|
| `POST`     | `/users`              | Create a new user               |
| `GET`      | `/users/<id>`         | Retrieve a user by ID           |
| `PUT`      | `/users/<id>`         | Update user information         |
| `DELETE`   | `/users/<id>`         | Delete a user                   |
| `POST`     | `/folders`            | Create a new folder             |
| `GET`      | `/folders/<id>`       | Retrieve folder details         |
| `PUT`      | `/folders/<id>`       | Update folder information       |
| `DELETE`   | `/folders/<id>`       | Delete a folder                 |
| `POST`     | `/files`              | Upload a new file               |
| `GET`      | `/files/<id>`         | Retrieve file details           |
| `PUT`      | `/files/<id>`         | Update file information         |
| `DELETE`   | `/files/<id>`         | Delete a file                   |

---

