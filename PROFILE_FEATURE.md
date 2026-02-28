# Profile Settings Feature

## Overview
Added personal profile settings with user details management and profile image upload functionality.

## Features Implemented

### Backend
1. **Profile Controller** (`backend/src/controllers/profile.controller.js`)
   - Update profile (name, email, password)
   - Upload profile picture

2. **Upload Middleware** (`backend/src/middleware/upload.middleware.js`)
   - Multer configuration for image uploads
   - File type validation (jpeg, jpg, png, gif)
   - File size limit: 5MB

3. **Profile Routes** (`backend/src/routes/profile.route.js`)
   - PUT `/api/profile/update` - Update user profile
   - POST `/api/profile/upload-pic` - Upload profile picture

4. **Server Updates**
   - Added profile routes
   - Static file serving for uploaded images at `/uploads`

### Frontend
1. **ProfilePage Component** (`frontend/src/pages/ProfilePage.jsx`)
   - Update full name
   - Update email
   - Change password (requires current password)
   - Upload profile picture
   - Display current profile picture

2. **Auth Store Updates** (`frontend/src/store/useAuthStore.js`)
   - `updateProfile()` - Update user details
   - `uploadProfilePic()` - Upload profile image

3. **UI Updates**
   - Added profile button in Sidebar
   - Display profile pictures in Sidebar user list
   - Display profile picture in ChatContainer header
   - Profile route at `/profile`

## Usage

### Access Profile Settings
1. Click the profile icon (Person icon) in the sidebar header
2. Or navigate to `/profile`

### Update Profile
- Modify full name or email
- To change password: enter current password and new password
- Click "Update Profile" button

### Upload Profile Picture
- Click "Upload Photo" button
- Select an image file (jpeg, jpg, png, or gif)
- Maximum file size: 5MB
- Image will be displayed immediately after upload

## File Structure
```
backend/
├── src/
│   ├── controllers/
│   │   └── profile.controller.js
│   ├── middleware/
│   │   └── upload.middleware.js
│   └── routes/
│       └── profile.route.js
└── uploads/
    └── profiles/

frontend/
├── src/
│   ├── pages/
│   │   └── ProfilePage.jsx
│   └── styles/
│       └── ProfilePage.scss
```

## API Endpoints

### Update Profile
```
PUT /api/profile/update
Headers: Cookie (JWT token)
Body: {
  fullName?: string,
  email?: string,
  currentPassword?: string,
  newPassword?: string
}
```

### Upload Profile Picture
```
POST /api/profile/upload-pic
Headers: Cookie (JWT token)
Content-Type: multipart/form-data
Body: FormData with 'profilePic' field
```
