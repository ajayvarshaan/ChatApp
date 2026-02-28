import { useState, useEffect } from 'react';
import { Box, TextField, Button, Avatar, Typography, Alert, IconButton } from '@mui/material';
import { PhotoCamera, ArrowBack } from '@mui/icons-material';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfilePage.scss';

const ProfilePage = () => {
    const { authUser, updateProfile, uploadProfilePic } = useAuthStore();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        currentPassword: '',
        newPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (authUser) {
            setFormData({
                fullName: authUser.fullName || '',
                email: authUser.email || '',
                currentPassword: '',
                newPassword: ''
            });
        }
    }, [authUser]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await updateProfile(formData);
            setSuccess('Profile updated successfully');
            setFormData({ ...formData, currentPassword: '', newPassword: '' });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setError('');
        setSuccess('');
        try {
            await uploadProfilePic(file);
            setSuccess('Profile picture updated successfully');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Box className="profile-page">
            <Box className="profile-page__container">
                <Box className="profile-page__header">
                    <IconButton onClick={() => navigate('/')} className="profile-page__back-btn">
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h4" className="profile-page__title">Profile Settings</Typography>
                </Box>
                
                <Box className="profile-page__avatar-section">
                    <Avatar 
                        src={authUser?.profilePic} 
                        alt={authUser?.fullName}
                        className="profile-page__avatar"
                    />
                    <Button
                        variant="contained"
                        component="label"
                        startIcon={<PhotoCamera />}
                        className="profile-page__upload-btn"
                    >
                        Upload Photo
                        <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                    </Button>
                </Box>

                {error && <Alert severity="error" className="profile-page__alert">{error}</Alert>}
                {success && <Alert severity="success" className="profile-page__alert">{success}</Alert>}

                <form onSubmit={handleSubmit} className="profile-page__form">
                    <TextField
                        label="Full Name"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        fullWidth
                        className="profile-page__input"
                    />
                    <TextField
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        fullWidth
                        className="profile-page__input"
                    />
                    <TextField
                        label="Current Password"
                        name="currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        fullWidth
                        className="profile-page__input"
                        placeholder="Leave blank to keep current password"
                    />
                    <TextField
                        label="New Password"
                        name="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        fullWidth
                        className="profile-page__input"
                        placeholder="Leave blank to keep current password"
                    />
                    <Button type="submit" variant="contained" fullWidth className="profile-page__submit-btn">
                        Update Profile
                    </Button>
                </form>
            </Box>
        </Box>
    );
};

export default ProfilePage;
