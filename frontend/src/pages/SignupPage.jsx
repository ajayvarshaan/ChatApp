import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import '../styles/Auth.scss';

const SignupPage = () => {
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
    const { signup } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signup(formData);
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <Box className="auth-page">
            <Box className="auth-page__container">
                <Paper className="auth-page__card" elevation={0}>
                    <Box className="auth-page__header">
                        <Box className="auth-page__header-icon">
                            <PersonAdd />
                        </Box>
                        <Typography variant="h4" component="h2">Create Account</Typography>
                        <Typography>Start chatting with friends</Typography>
                    </Box>
                    
                    <form onSubmit={handleSubmit} className="auth-page__form">
                        <TextField
                            fullWidth
                            label="Your name"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                        />
                        <TextField
                            fullWidth
                            type="email"
                            label="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        <TextField
                            fullWidth
                            type="password"
                            label="Password"
                            helperText="At least 6 characters"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            size="large"
                        >
                            Create your account
                        </Button>
                    </form>
                    
                    <Box className="auth-page__footer">
                        Already have an account? <a href="/login">Sign in</a>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default SignupPage;
