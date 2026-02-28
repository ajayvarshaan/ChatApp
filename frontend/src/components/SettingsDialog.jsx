import { Dialog, DialogTitle, DialogContent, IconButton, Box, Typography, Switch, FormControl, InputLabel, Select, MenuItem, Divider } from '@mui/material';
import { Close, DarkMode, LightMode } from '@mui/icons-material';
import { useThemeStore } from '../store/useThemeStore';

const SettingsDialog = ({ open, onClose }) => {
    const { isDarkMode, theme, fontSize, isCompactMode, toggleTheme, setTheme, setFontSize, toggleCompactMode } = useThemeStore();

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Settings</Typography>
                <IconButton onClick={onClose} size="small">
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {isDarkMode ? <DarkMode /> : <LightMode />}
                            <Typography>Dark Mode</Typography>
                        </Box>
                        <Switch checked={isDarkMode} onChange={toggleTheme} />
                    </Box>

                    <Divider />

                    <FormControl fullWidth>
                        <InputLabel>Theme</InputLabel>
                        <Select value={theme} onChange={(e) => setTheme(e.target.value)} label="Theme">
                            <MenuItem value="default">Default (Blue)</MenuItem>
                            <MenuItem value="purple">Purple</MenuItem>
                            <MenuItem value="green">Green</MenuItem>
                            <MenuItem value="orange">Orange</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Font Size</InputLabel>
                        <Select value={fontSize} onChange={(e) => setFontSize(e.target.value)} label="Font Size">
                            <MenuItem value="small">Small</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="large">Large</MenuItem>
                        </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Compact Mode</Typography>
                        <Switch checked={isCompactMode} onChange={toggleCompactMode} />
                    </Box>

                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default SettingsDialog;
