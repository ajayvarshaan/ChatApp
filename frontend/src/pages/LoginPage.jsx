import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import '../styles/Auth.scss';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(formData);
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
                            <LoginIcon />
                        </Box>
                        <Typography variant="h4" component="h2">Sign In</Typography>
                        <Typography>Access your chat account</Typography>
                    </Box>
                    
                    <form onSubmit={handleSubmit} className="auth-page__form">
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
                            Sign In
                        </Button>
                    </form>
                    
                    <Box className="auth-page__footer">
                        New to Chat? <a href="/signup">Create your account</a>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default LoginPage;
